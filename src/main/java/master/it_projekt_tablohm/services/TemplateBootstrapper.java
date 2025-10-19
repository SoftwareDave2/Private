package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.dto.TemplateDefinitionDTO;
import master.it_projekt_tablohm.repositories.DisplayTemplateRepository;
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

    public TemplateBootstrapper(DisplayTemplateRepository templateRepository,
                                TemplateManagementService templateManagementService) {
        this.templateRepository = templateRepository;
        this.templateManagementService = templateManagementService;
    }

    @Override
    public void run(String... args) {
        List<TemplateSeed> seeds = List.of(
                new TemplateSeed(
                        "door-sign",
                        "Türschild Standard",
                        "Standard-Türschild für 400x300 Displays",
                        400,
                        300,
                        """
                                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="400" height="300" fill="#ffffff"/>
                                    <text x="20" y="60" font-size="42" fill="#000000">{roomNumber}</text>
                                    <text x="20" y="110" font-size="18" fill="#000000">{footerNote}</text>
                                </svg>
                                """
                ),
                new TemplateSeed(
                        "event-board",
                        "Ereignistafel Standard",
                        "Übersicht für Ereignisse (400x300)",
                        400,
                        300,
                        """
                                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="400" height="300" fill="#ffffff"/>
                                    <text x="20" y="40" font-size="28" fill="#000000">{title}</text>
                                    <text x="20" y="70" font-size="16" fill="#000000">{description}</text>
                                </svg>
                                """
                ),
                new TemplateSeed(
                        "notice-board",
                        "Hinweisschild Standard",
                        "Hinweisschild für 296x128 Displays",
                        296,
                        128,
                        """
                                <svg width="296" height="128" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="296" height="128" fill="#ffffff"/>
                                    <text x="12" y="32" font-size="20" fill="#000000">{title}</text>
                                    <text x="12" y="60" font-size="14" fill="#000000">{body}</text>
                                </svg>
                                """
                ),
                new TemplateSeed(
                        "room-booking",
                        "Raumbuchung Standard",
                        "Raumbuchung für 400x300 Displays",
                        400,
                        300,
                        """
                                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="400" height="300" fill="#ffffff"/>
                                    <text x="20" y="50" font-size="32" fill="#000000">{roomNumber}</text>
                                    <text x="20" y="90" font-size="18" fill="#000000">{roomType}</text>
                                </svg>
                                """
                )
        );

        for (TemplateSeed seed : seeds) {
            templateRepository.findByTemplateType(seed.templateType()).ifPresentOrElse(
                    existing -> logger.debug("Template '{}' already present. Skipping bootstrap.", seed.templateType()),
                    () -> createTemplate(seed)
            );
        }
    }

    private void createTemplate(TemplateSeed seed) {
        try {
            TemplateDefinitionDTO dto = new TemplateDefinitionDTO();
            dto.setTemplateType(seed.templateType());
            dto.setName(seed.name());
            dto.setDescription(seed.description());
            dto.setDisplayWidth(seed.width());
            dto.setDisplayHeight(seed.height());
            dto.setSvgContent(seed.svgContent().trim());
            templateManagementService.createTemplate(dto);
            logger.info("Bootstrapped template '{}'", seed.templateType());
        } catch (Exception ex) {
            logger.error("Failed to bootstrap template '{}'", seed.templateType(), ex);
        }
    }

    private record TemplateSeed(
            String templateType,
            String name,
            String description,
            int width,
            int height,
            String svgContent
    ) {
    }
}

