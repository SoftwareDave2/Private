package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.dto.TemplateDefinitionDTO;
import master.it_projekt_tablohm.dto.TemplateTypeDTO;
import master.it_projekt_tablohm.models.DisplayTemplate;
import master.it_projekt_tablohm.models.TemplateType;
import master.it_projekt_tablohm.repositories.DisplayTemplateRepository;
import master.it_projekt_tablohm.repositories.TemplateTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TemplateManagementService {

    private final DisplayTemplateRepository templateRepository;
    private final TemplateTypeRepository templateTypeRepository;

    public TemplateManagementService(DisplayTemplateRepository templateRepository,
                                     TemplateTypeRepository templateTypeRepository) {
        this.templateRepository = templateRepository;
        this.templateTypeRepository = templateTypeRepository;
    }

    @Transactional
    public TemplateDefinitionDTO createTemplate(TemplateDefinitionDTO dto) {
        templateRepository.findByTemplateTypeEntity_TypeKeyAndDisplayWidthAndDisplayHeight(
                        dto.getTemplateType(), dto.getDisplayWidth(), dto.getDisplayHeight())
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Template " + dto.getTemplateType() + " (" + dto.getDisplayWidth() + "x" + dto.getDisplayHeight() + ") already exists");
                });

        TemplateType type = resolveTemplateType(dto.getTemplateType());

        DisplayTemplate template = new DisplayTemplate();
        template.setTemplateTypeEntity(type);
        applyDefinition(template, dto);

        template = templateRepository.save(template);
        return toDto(template);
    }

    @Transactional
    public TemplateDefinitionDTO updateTemplate(String templateType, TemplateDefinitionDTO dto) {
        if (!templateType.equals(dto.getTemplateType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Template type mismatch between path and payload");
        }

        DisplayTemplate template = templateRepository.findByTemplateTypeEntity_TypeKey(templateType)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Template type " + templateType + " not found"));

        TemplateType type = resolveTemplateType(dto.getTemplateType());
        template.setTemplateTypeEntity(type);
        applyDefinition(template, dto);

        template = templateRepository.save(template);
        return toDto(template);
    }

    public TemplateDefinitionDTO getTemplate(String templateType) {
        DisplayTemplate template = templateRepository.findByTemplateTypeEntity_TypeKey(templateType)
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

    public List<TemplateTypeDTO> listTemplateTypes() {
        return templateTypeRepository.findAll()
                .stream()
                .map(type -> new TemplateTypeDTO(
                        type.getTypeKey(),
                        type.getLabel()
                ))
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
        dto.setTemplateType(template.getTemplateTypeEntity() != null
                ? template.getTemplateTypeEntity().getTypeKey()
                : null);
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setDisplayWidth(template.getDisplayWidth());
        dto.setDisplayHeight(template.getDisplayHeight());
        dto.setSvgContent(template.getSvgContent());
        return dto;
    }

    private TemplateType resolveTemplateType(String templateTypeKey) {
        return templateTypeRepository.findByTypeKey(templateTypeKey)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Template type " + templateTypeKey + " not registered"));
    }
}
