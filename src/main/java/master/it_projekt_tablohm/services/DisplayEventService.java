package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.dto.DisplayEventSubmissionResponseDTO;
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

import java.util.List;

@Service
public class DisplayEventService {

    private final DisplayTemplateRepository templateRepository;
    private final DisplayTemplateDataRepository templateDataRepository;
    private final TemplateDisplayUpdateService displayUpdateService;

    public DisplayEventService(DisplayTemplateRepository templateRepository,
                               DisplayTemplateDataRepository templateDataRepository,
                               TemplateDisplayUpdateService displayUpdateService) {
        this.templateRepository = templateRepository;
        this.templateDataRepository = templateDataRepository;
        this.displayUpdateService = displayUpdateService;
    }

    @Transactional
    public DisplayEventSubmissionResponseDTO saveDisplayData(TemplateDisplayDataDTO displayDataDto) {
        DisplayTemplate template = templateRepository
                .findByTemplateType(displayDataDto.getTemplateType())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Template type " + displayDataDto.getTemplateType() + " not found"));

        DisplayTemplateData templateData = templateDataRepository
                .findByDisplayMacAndTemplateType(displayDataDto.getDisplayMac(), displayDataDto.getTemplateType())
                .orElseGet(DisplayTemplateData::new);

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
                subEntity.setNotes(subDto.getNotes());
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
}
