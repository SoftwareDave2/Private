package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.dto.DisplaySubDataHistoryDTO;
import master.it_projekt_tablohm.models.DisplayTemplateSubDataHistory;
import master.it_projekt_tablohm.repositories.DisplayTemplateSubDataHistoryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DisplayHistoryService {

    private final DisplayTemplateSubDataHistoryRepository historyRepository;

    public DisplayHistoryService(DisplayTemplateSubDataHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public List<DisplaySubDataHistoryDTO> listHistory(int limit) {
        int pageSize = Math.max(1, Math.min(limit, 500));
        List<DisplayTemplateSubDataHistory> entries = historyRepository.findAll(
                PageRequest.of(0, pageSize, Sort.by(Sort.Direction.DESC, "end", "expiredAt"))
        ).getContent();

        return entries.stream().map(this::toDto).toList();
    }

    private DisplaySubDataHistoryDTO toDto(DisplayTemplateSubDataHistory entry) {
        var dto = new master.it_projekt_tablohm.dto.DisplaySubDataHistoryDTO();
        dto.setId(entry.getId());
        dto.setTemplateType(entry.getTemplateTypeKey());
        dto.setDisplayMac(entry.getDisplayMac());
        dto.setPositionIndex(entry.getPositionIndex());
        dto.setTitle(entry.getTitle());
        dto.setStart(entry.getStart());
        dto.setEnd(entry.getEnd());
        dto.setHighlighted(entry.getHighlighted());
        dto.setBusy(entry.getBusy());
        dto.setQrCodeUrl(entry.getQrCodeUrl());
        dto.setExpiredAt(entry.getExpiredAt());
        return dto;
    }
}
