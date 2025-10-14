package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.dto.TemplateDefinitionDTO;
import master.it_projekt_tablohm.models.DisplayTemplate;
import master.it_projekt_tablohm.repositories.DisplayTemplateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TemplateManagementService {

    private final DisplayTemplateRepository templateRepository;

    public TemplateManagementService(DisplayTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Transactional
    public TemplateDefinitionDTO createTemplate(TemplateDefinitionDTO dto) {
        templateRepository.findByTemplateType(dto.getTemplateType()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Template type " + dto.getTemplateType() + " already exists");
        });

        DisplayTemplate template = new DisplayTemplate();
        applyDefinition(template, dto);
        template.setTemplateType(dto.getTemplateType());

        template = templateRepository.save(template);
        return toDto(template);
    }

    @Transactional
    public TemplateDefinitionDTO updateTemplate(String templateType, TemplateDefinitionDTO dto) {
        if (!templateType.equals(dto.getTemplateType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Template type mismatch between path and payload");
        }

        DisplayTemplate template = templateRepository.findByTemplateType(templateType)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Template type " + templateType + " not found"));

        applyDefinition(template, dto);

        template = templateRepository.save(template);
        return toDto(template);
    }

    public TemplateDefinitionDTO getTemplate(String templateType) {
        DisplayTemplate template = templateRepository.findByTemplateType(templateType)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Template type " + templateType + " not found"));
        return toDto(template);
    }

    public List<TemplateDefinitionDTO> listTemplates() {
        return templateRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private void applyDefinition(DisplayTemplate template, TemplateDefinitionDTO dto) {
        template.setName(dto.getName());
        template.setDescription(dto.getDescription());
        template.setDisplayWidth(dto.getDisplayWidth());
        template.setDisplayHeight(dto.getDisplayHeight());
        if (dto.getDisplayWidth() != null && dto.getDisplayHeight() != null) {
            template.setOrientation(dto.getDisplayWidth() >= dto.getDisplayHeight() ? "landscape" : "portrait");
        }
        template.setSvgContent(dto.getSvgContent());
    }

    private TemplateDefinitionDTO toDto(DisplayTemplate template) {
        TemplateDefinitionDTO dto = new TemplateDefinitionDTO();
        dto.setTemplateType(template.getTemplateType());
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setDisplayWidth(template.getDisplayWidth());
        dto.setDisplayHeight(template.getDisplayHeight());
        dto.setSvgContent(template.getSvgContent());
        return dto;
    }
}
