package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.dto.TemplateDefinitionDTO;
import master.it_projekt_tablohm.models.TemplateType;
import master.it_projekt_tablohm.repositories.DisplayTemplateRepository;
import master.it_projekt_tablohm.repositories.TemplateTypeRepository;
import master.it_projekt_tablohm.services.storage.TemplateFileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TemplateBootstrapper implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(TemplateBootstrapper.class);

    private final DisplayTemplateRepository templateRepository;
    private final TemplateManagementService templateManagementService;
    private final TemplateTypeRepository templateTypeRepository;
    private final TemplateFileService templateFileService;

    private final boolean forceOverwrite =
            Boolean.parseBoolean(System.getenv().getOrDefault("TEMPLATE_BOOTSTRAP_OVERWRITE", "false"));

    public TemplateBootstrapper(DisplayTemplateRepository templateRepository,
                                TemplateManagementService templateManagementService,
                                TemplateTypeRepository templateTypeRepository,
                                TemplateFileService templateFileService) {
        this.templateRepository = templateRepository;
        this.templateManagementService = templateManagementService;
        this.templateTypeRepository = templateTypeRepository;
        this.templateFileService = templateFileService;
    }

    @Override
    public void run(String... args) {
        List<TemplateSeed> seeds = List.of(
                new TemplateSeed("door-sign", "Türschild", "Türschild für 400x300 Displays", 400, 300),
                new TemplateSeed("event-board", "Ereignisschild", "Ereignisschild für 400x300 Displays", 400, 300),
                new TemplateSeed("notice-board", "Hinweisschild Klein", "Hinweisschild für 250x128 Displays", 250, 128),
                new TemplateSeed("notice-board", "Hinweisschild", "Hinweisschild für 296x128 Displays", 296, 128),
                new TemplateSeed("room-booking", "Raumbuchungsschild", "Raumbuchungsschild für 400x300 Displays", 400, 300),
                new TemplateSeed("test-board", "TestSchild", "Ereignisschild für 400x300 Displays", 400, 300)
        );

        for (TemplateSeed seed : seeds) {
            upsertTemplateType(seed);
            upsertTemplate(seed);
        }
    }

    private void upsertTemplate(TemplateSeed seed) {
        final String type = seed.templateType();
        final int w = seed.width();
        final int h = seed.height();
        final String svg = loadSvg(seed);
        final TemplateType typeEntity = templateTypeRepository.findByTypeKey(type)
                .orElseThrow(() -> new IllegalStateException("Template type seed missing for key " + type));

        templateRepository.findByTemplateTypeEntity_TypeKeyAndDisplayWidthAndDisplayHeight(type, w, h)
                .ifPresentOrElse(existing -> {
                    boolean needsUpdate =
                            forceOverwrite
                                    || !svg.equals(existing.getSvgContent())
                                    || !seed.name().equals(existing.getName())
                                    || !seed.description().equals(existing.getDescription());

                    if (needsUpdate) {
                        existing.setName(seed.name());
                        existing.setDescription(seed.description());
                        existing.setSvgContent(svg);
                        existing.setOrientation(existing.getOrientation() == null ? "landscape" : existing.getOrientation());
                        existing.setDisplayWidth(w);
                        existing.setDisplayHeight(h);
                        existing.setTemplateTypeEntity(typeEntity);
                        templateRepository.save(existing);
                        logger.info("Updated template '{}' ({}x{})", type, w, h);
                    } else {
                        logger.debug("Template '{}' ({}x{}) up-to-date. Skipping.", type, w, h);
                    }
                }, () -> createTemplate(seed));
    }

    private void createTemplate(TemplateSeed seed) {
        try {
            TemplateDefinitionDTO dto = new TemplateDefinitionDTO();
            dto.setTemplateType(seed.templateType());
            dto.setName(seed.name());
            dto.setDescription(seed.description());
            dto.setDisplayWidth(seed.width());
            dto.setDisplayHeight(seed.height());
            dto.setSvgContent(loadSvg(seed));
            templateManagementService.createTemplate(dto);
            logger.info("Bootstrapped template '{}'", seed.templateType());
        } catch (Exception ex) {
            logger.error("Failed to bootstrap template '{}'", seed.templateType(), ex);
        }
    }

    private void upsertTemplateType(TemplateSeed seed) {
        TemplateType type = templateTypeRepository.findByTypeKey(seed.templateType()).orElseGet(TemplateType::new);
        boolean isNew = type.getId() == null;
        type.setTypeKey(seed.templateType());
        type.setLabel(seed.name());
        templateTypeRepository.save(type);
        if (isNew) {
            logger.info("Bootstrapped template type '{}'", seed.templateType());
        }
    }

    private String loadSvg(TemplateSeed seed) {
        return templateFileService.loadTemplate(seed.templateType(), seed.width(), seed.height()).trim();
    }

    private record TemplateSeed(
            String templateType,
            String name,
            String description,
            int width,
            int height
    ) {
    }
}
