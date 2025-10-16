package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.models.DisplayTemplateData;
import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import master.it_projekt_tablohm.repositories.DisplayTemplateDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${oepl.template.cleanup-enabled:true}")
    private boolean cleanupEnabled;

    public TemplateMaintenanceService(DisplayTemplateDataRepository templateDataRepository,
                                      TemplateDisplayUpdateService displayUpdateService,
                                      DisplayEventService displayEventService) {
        this.templateDataRepository = templateDataRepository;
        this.displayUpdateService = displayUpdateService;
        this.displayEventService = displayEventService;
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
            affectedDisplays.add(data.getDisplayMac() + "|" + data.getTemplateType());
            logger.info("Removing expired template data id={} mac={} templateType={} eventEnd={}",
                    data.getId(), data.getDisplayMac(), data.getTemplateType(), data.getEventEnd());
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
            boolean modified = false;
            Iterator<DisplayTemplateSubData> iterator = data.getSubItems().iterator();
            while (iterator.hasNext()) {
                DisplayTemplateSubData subData = iterator.next();
                LocalDateTime end = subData.getEnd();
                if (end != null && !end.isAfter(now)) {
                    logger.info("Removing expired sub item id={} parentId={} mac={} templateType={} end={}",
                            subData.getId(), data.getId(), data.getDisplayMac(), data.getTemplateType(), end);
                    iterator.remove();
                    modified = true;
                }
            }

            if (modified) {
                if (data.getSubItems().isEmpty() && data.getEventEnd() == null) {
                    logger.info("Removing template data id={} mac={} templateType={} because all sub items expired",
                            data.getId(), data.getDisplayMac(), data.getTemplateType());
                    templateDataRepository.delete(data);
                } else {
                    templateDataRepository.save(data);
                }
                affectedDisplays.add(data.getDisplayMac() + "|" + data.getTemplateType());
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
}
