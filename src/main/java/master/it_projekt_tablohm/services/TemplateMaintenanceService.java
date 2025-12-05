package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.models.DisplayTemplateData;
import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import master.it_projekt_tablohm.models.DisplayTemplateSubDataHistory;
import master.it_projekt_tablohm.repositories.DisplayTemplateDataRepository;
import master.it_projekt_tablohm.repositories.DisplayTemplateSubDataHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

@Service
public class TemplateMaintenanceService {

    private static final Logger logger = LoggerFactory.getLogger(TemplateMaintenanceService.class);

    private final DisplayTemplateDataRepository templateDataRepository;
    private final TemplateDisplayUpdateService displayUpdateService;
    private final DisplayEventService displayEventService;
    private final DisplayTemplateSubDataHistoryRepository subDataHistoryRepository;

    @Value("${oepl.template.cleanup-enabled:true}")
    private boolean cleanupEnabled;

    @Value("${oepl.event-board.history.max-entries:200}")
    private int eventBoardHistoryLimit;

    public TemplateMaintenanceService(DisplayTemplateDataRepository templateDataRepository,
                                      TemplateDisplayUpdateService displayUpdateService,
                                      DisplayEventService displayEventService,
                                      DisplayTemplateSubDataHistoryRepository subDataHistoryRepository) {
        this.templateDataRepository = templateDataRepository;
        this.displayUpdateService = displayUpdateService;
        this.displayEventService = displayEventService;
        this.subDataHistoryRepository = subDataHistoryRepository;
    }

    @Scheduled(fixedRate = 6000)
    @Transactional
    public void pruneExpiredTemplates() {
        if (!cleanupEnabled) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(java.time.ZoneId.of("Europe/Berlin"));

        handleExpiredTemplates(now);
        handleExpiredSubItems(now);
    }

    private void handleExpiredTemplates(LocalDateTime now) {
        List<DisplayTemplateData> expiredTemplates =
                templateDataRepository.findByEventEndNotNullAndEventEndLessThanEqual(now);
        if (expiredTemplates.isEmpty()) {
            return;
        }

        Set<String> affectedDisplays = new HashSet<>();
        for (DisplayTemplateData data : expiredTemplates) {
            if (data.getTemplateTypeEntity() == null) {
                logger.warn("Skipping expired template data id={} mac={} without template type entity", data.getId(), data.getDisplayMac());
                continue;
            }
            if (isEventBoard(data)) {
                archiveEventBoardSubItems(data, data.getSubItems());
            }
            affectedDisplays.add(data.getDisplayMac() + "|" + data.getTemplateTypeEntity().getTypeKey());
            logger.info("Removing expired template data id={} mac={} templateType={} eventEnd={}",
                    data.getId(), data.getDisplayMac(), data.getTemplateTypeEntity().getTypeKey(), data.getEventEnd());
        }

        templateDataRepository.deleteAll(expiredTemplates);

        notifyDisplays(affectedDisplays);
    }

    private void handleExpiredSubItems(LocalDateTime now) {
        List<DisplayTemplateData> templatesWithExpiredSubItems =
                templateDataRepository.findWithExpiredSubItems(now);
        if (templatesWithExpiredSubItems.isEmpty()) {
            return;
        }

        Set<String> affectedDisplays = new HashSet<>();

        for (DisplayTemplateData data : templatesWithExpiredSubItems) {
            if (data.getTemplateTypeEntity() == null) {
                logger.warn("Skipping template data id={} mac={} without template type entity", data.getId(), data.getDisplayMac());
                continue;
            }
            boolean modified = false;
            boolean isDoorSign = "door-sign".equalsIgnoreCase(data.getTemplateTypeEntity().getTypeKey());
            Iterator<DisplayTemplateSubData> iterator = data.getSubItems().iterator();
            while (iterator.hasNext()) {
                DisplayTemplateSubData subData = iterator.next();
                LocalDateTime end = subData.getEnd();
                if (end != null && !end.isAfter(now)) {
                    if (isDoorSign) {
                        boolean wasBusy = Boolean.TRUE.equals(subData.getBusy()) || Boolean.TRUE.equals(subData.getHighlighted());
                        if (wasBusy || subData.getEnd() != null) {
                            logger.info("Resetting busy state for door-sign sub item id={} parentId={} mac={} end={}",
                                    subData.getId(), data.getId(), data.getDisplayMac(), end);
                            subData.setBusy(false);
                            subData.setHighlighted(false);
                            subData.setEnd(null);
                            modified = true;
                        }
                    } else {
                        if (isEventBoard(data)) {
                            archiveEventBoardSubItems(data, List.of(subData));
                        }
                        logger.info("Removing expired sub item id={} parentId={} mac={} templateType={} end={}",
                                subData.getId(), data.getId(), data.getDisplayMac(), data.getTemplateTypeEntity().getTypeKey(), end);
                        iterator.remove();
                        modified = true;
                    }
                }
            }

            if (modified) {
                if (data.getSubItems().isEmpty() && data.getEventEnd() == null) {
                    logger.info("Removing template data id={} mac={} templateType={} because all sub items expired",
                            data.getId(), data.getDisplayMac(), data.getTemplateTypeEntity().getTypeKey());
                    templateDataRepository.delete(data);
                } else {
                    templateDataRepository.save(data);
                }
                affectedDisplays.add(data.getDisplayMac() + "|" + data.getTemplateTypeEntity().getTypeKey());
            }
        }

        notifyDisplays(affectedDisplays);
    }

    private void notifyDisplays(Set<String> affectedDisplays) {
        for (String entry : affectedDisplays) {
            String[] parts = entry.split("\\|");
            String mac = parts[0];
            String templateType = parts[1];
            displayEventService.applyDefaultState(mac, templateType);
            displayUpdateService.requestUpdate(mac, templateType);
        }
    }

    private boolean isEventBoard(DisplayTemplateData data) {
        return data.getTemplateTypeEntity() != null
                && "event-board".equalsIgnoreCase(data.getTemplateTypeEntity().getTypeKey());
    }

    private void archiveEventBoardSubItems(DisplayTemplateData parent, List<DisplayTemplateSubData> subItems) {
        if (subItems == null || subItems.isEmpty()) {
            return;
        }
        for (DisplayTemplateSubData sub : subItems) {
            DisplayTemplateSubDataHistory history = new DisplayTemplateSubDataHistory();
            history.setTemplateTypeKey(parent.getTemplateTypeEntity().getTypeKey());
            history.setDisplayMac(parent.getDisplayMac());
            history.setPositionIndex(sub.getPositionIndex());
            history.setTitle(sub.getTitle());
            history.setStart(sub.getStart());
            history.setEnd(sub.getEnd());
            history.setHighlighted(sub.getHighlighted());
            history.setBusy(sub.getBusy());
            history.setQrCodeUrl(sub.getQrCodeUrl());
            subDataHistoryRepository.save(history);
        }
        trimHistory();
    }

    private void trimHistory() {
        long count = subDataHistoryRepository.count();
        if (count <= eventBoardHistoryLimit) {
            return;
        }
        int toDelete = (int) (count - eventBoardHistoryLimit);
        List<DisplayTemplateSubDataHistory> oldest = subDataHistoryRepository.findAll(
                PageRequest.of(0, toDelete, Sort.by(Sort.Direction.ASC, "end", "expiredAt"))
        ).getContent();
        if (!oldest.isEmpty()) {
            subDataHistoryRepository.deleteAll(oldest);
            logger.info("Trimmed {} history entries exceeding limit {}", oldest.size(), eventBoardHistoryLimit);
        }
    }
}
