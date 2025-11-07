package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.dto.DisplayEventSubmissionResponseDTO;
import master.it_projekt_tablohm.dto.DisplaySubDataDTO;
import master.it_projekt_tablohm.dto.TemplateDisplayDataDTO;
import master.it_projekt_tablohm.dto.TemplateSubDataDTO;
import master.it_projekt_tablohm.models.DisplayTemplate;
import master.it_projekt_tablohm.models.DisplayTemplateData;
import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import master.it_projekt_tablohm.repositories.DisplayTemplateDataRepository;
import master.it_projekt_tablohm.repositories.DisplayTemplateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisplayEventService {

    private final DisplayTemplateRepository templateRepository;
    private final DisplayTemplateDataRepository templateDataRepository;
    private final TemplateDisplayUpdateService displayUpdateService;
    private final TemplateDefaultContentProvider defaultContentProvider;

    public DisplayEventService(DisplayTemplateRepository templateRepository,
                               DisplayTemplateDataRepository templateDataRepository,
                               TemplateDisplayUpdateService displayUpdateService,
                               TemplateDefaultContentProvider defaultContentProvider) {
        this.templateRepository = templateRepository;
        this.templateDataRepository = templateDataRepository;
        this.displayUpdateService = displayUpdateService;
        this.defaultContentProvider = defaultContentProvider;
    }

    @Transactional
    public DisplayEventSubmissionResponseDTO saveDisplayData(TemplateDisplayDataDTO displayDataDto) {
        DisplayTemplate template = templateRepository
                .findByTemplateType(displayDataDto.getTemplateType())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Template type " + displayDataDto.getTemplateType() + " not found"));

        var existingEntries = templateDataRepository.findByDisplayMac(displayDataDto.getDisplayMac());

        DisplayTemplateData templateData = existingEntries.stream()
                .max(Comparator.comparing(DisplayTemplateData::getUpdatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .orElseGet(DisplayTemplateData::new);

        final Long retainedId = templateData.getId();

        existingEntries.stream()
                .filter(entry -> entry.getId() != null && !entry.getId().equals(retainedId))
                .forEach(templateDataRepository::delete);

        templateData.setTemplate(template);
        templateData.setTemplateType(displayDataDto.getTemplateType());
        templateData.setDisplayMac(displayDataDto.getDisplayMac());
        templateData.setEventStart(displayDataDto.getEventStart());
        templateData.setEventEnd(displayDataDto.getEventEnd());
        templateData.setFields(displayDataDto.getFields());

        templateData.getSubItems().clear();

        List<TemplateSubDataDTO> subDataDtos = displayDataDto.getSubItems();
        if (subDataDtos != null) {
            for (int i = 0; i < subDataDtos.size(); i++) {
                TemplateSubDataDTO subDto = subDataDtos.get(i);
                DisplayTemplateSubData subEntity = new DisplayTemplateSubData();
                subEntity.setTemplateData(templateData);
                subEntity.setPositionIndex(i);
                subEntity.setTitle(subDto.getTitle());
                subEntity.setStart(subDto.getStart());
                subEntity.setEnd(subDto.getEnd());
                subEntity.setHighlighted(subDto.getHighlighted());
                subEntity.setBusy(subDto.getBusy());
                subEntity.setQrCodeUrl(subDto.getQrCodeUrl());
                templateData.getSubItems().add(subEntity);
            }
        }

        templateData = templateDataRepository.save(templateData);

        displayUpdateService.requestUpdate(templateData);

        return new DisplayEventSubmissionResponseDTO(
                template.getId(),
                templateData.getId(),
                template.getUpdatedAt()
        );
    }

    public List<TemplateDisplayDataDTO> getDisplayDataByTemplateType(String templateType) {
        return templateDataRepository.findByTemplateType(templateType)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TemplateDisplayDataDTO> getDisplayDataByDisplayMac(String displayMac) {
        return templateDataRepository.findByDisplayMac(displayMac)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<DisplaySubDataDTO> getSubDataByDisplayMac(String displayMac) {
        return templateDataRepository.findByDisplayMac(displayMac)
                .stream()
                .flatMap(data -> data.getSubItems()
                        .stream()
                        .map(sub -> toSubDataDto(data, sub)))
                .collect(Collectors.toList());
    }

    public void applyDefaultState(String displayMac, String templateType) {
        TemplateDisplayDataDTO defaultDto = defaultContentProvider.createDefaultDisplayData(templateType, displayMac);
        displayUpdateService.requestDefault(displayMac, templateType, defaultDto);
    }

    private TemplateDisplayDataDTO toDto(DisplayTemplateData entity) {
        TemplateDisplayDataDTO dto = new TemplateDisplayDataDTO();
        dto.setTemplateType(entity.getTemplateType());
        dto.setDisplayMac(entity.getDisplayMac());
        dto.setEventStart(entity.getEventStart());
        dto.setEventEnd(entity.getEventEnd());
        dto.setFields(entity.getFields());

        if (entity.getSubItems() != null) {
            dto.setSubItems(
                    entity.getSubItems()
                            .stream()
                            .map(sub -> {
                                TemplateSubDataDTO subDto = new TemplateSubDataDTO();
                                subDto.setTitle(sub.getTitle());
                                subDto.setStart(sub.getStart());
                                subDto.setEnd(sub.getEnd());
                                subDto.setHighlighted(sub.getHighlighted());
                                subDto.setBusy(sub.getBusy());
                                subDto.setQrCodeUrl(sub.getQrCodeUrl());
                                return subDto;
                            })
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    private DisplaySubDataDTO toSubDataDto(DisplayTemplateData parent, DisplayTemplateSubData sub) {
        DisplaySubDataDTO dto = new DisplaySubDataDTO();
        dto.setTemplateType(parent.getTemplateType());
        dto.setDisplayMac(parent.getDisplayMac());
        dto.setTitle(sub.getTitle());
        dto.setStart(sub.getStart());
        dto.setEnd(sub.getEnd());
        dto.setHighlighted(sub.getHighlighted());
        dto.setBusy(sub.getBusy());
        dto.setQrCodeUrl(sub.getQrCodeUrl());
        return dto;
    }
}

