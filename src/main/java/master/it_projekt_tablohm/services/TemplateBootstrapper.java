package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.dto.TemplateDefinitionDTO;
import master.it_projekt_tablohm.models.TemplateType;
import master.it_projekt_tablohm.repositories.DisplayTemplateRepository;
import master.it_projekt_tablohm.repositories.TemplateTypeRepository;
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

    private final boolean forceOverwrite =
            Boolean.parseBoolean(System.getenv().getOrDefault("TEMPLATE_BOOTSTRAP_OVERWRITE", "false"));


    public TemplateBootstrapper(DisplayTemplateRepository templateRepository,
                                TemplateManagementService templateManagementService,
                                TemplateTypeRepository templateTypeRepository) {
        this.templateRepository = templateRepository;
        this.templateManagementService = templateManagementService;
        this.templateTypeRepository = templateTypeRepository;
    }

    @Override
    public void run(String... args) {
        List<TemplateSeed> seeds = List.of(
                new TemplateSeed(
                        "door-sign",
                        "Türschild",
                        "Türschild für 400x300 Displays",
                        400,
                        300,
                        """
                                <?xml version="1.0" encoding="utf-8"?>
                                <svg id="root" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
                                                                  <!-- Weißer Hintergrund für saubere Palettierung -->
                                                                  <rect x="0" y="0" width="400" height="300" fill="#ffffff"/>
                                                                  <!-- Obere rechte Raumnummer -->
                                                                  <text id="roomNumber" x="185" y="60"
                                                                        style="fill:#000000; font-family: Arial, sans-serif; font-size:60px; font-weight:700; white-space:pre;">
                                                                    KS 503
                                                                  </text>
                                                                  <!-- Namen (links) -->
                                                                  <text id="name-1" x="25" y="108"
                                                                        style="fill:#000000; font-family: Arial, sans-serif; font-size:26px; white-space:pre;">Uwe Wienkop</text>
                                                                  <text id="name-2" x="25" y="153"
                                                                        style="fill:#000000; font-family: Arial, sans-serif; font-size:26px; white-space:pre;">Louis Burk</text>
                                                                  <text id="name-3" x="25" y="198"
                                                                        style="fill:#000000; font-family: Arial, sans-serif; font-size:26px; white-space:pre;">Vorname Nachname</text>
                                                                  <!-- Trennlinie -->
                                                                  <path d="M -2.012 230 L 404.969 230" style="stroke:#ff0000; stroke-width:2; fill:none"/>
                                                                  <!-- Footer -->
                                                                  <text id="footerNote" x="25" y="270"
                                                                        style="fill:#000000; font-family: Arial, sans-serif; font-size:16px; white-space:pre;">
                                                                    Angestellte der Hochschuljobbörse
                                                                  </text>
                                                                  <!-- STATUS: BUSY (Nicht stören) -->
                                                                  <g id="state-busy">
                                                                    <rect x="25.232" y="22.884" width="103.118" height="31.715" rx="10" ry="10"
                                                                          style="fill:#ff0000; stroke:#ff0000; stroke-width:2"/>
                                                                    <text id="statusText-busy"
                                                                          x="45" y="43.871"
                                                                          transform="matrix(0.658162,0,0,0.694913,7.827,11.939)"
                                                                          style="fill:#ffffff; font-family: Arial, sans-serif; font-size:20px; font-weight:700; white-space:pre;">
                                                                      nicht stören
                                                                    </text>
                                                                  </g>
                                                                  <!-- STATUS: FREE (empty) -->
                                                                  <g id="state-free" style="display:none">
                                                                    <rect x="25.232" y="22.884" width="103.118" height="31.715" rx="10" ry="10"
                                                                          style="fill:#ffffff; fill-opacity:0; stroke:#000000; stroke-width:1; paint-order:stroke"/>
                                                                    <text id="statusText-free"
                                                                          x="48" y="43.871"
                                                                          transform="matrix(0.658162,0,0,0.694913,14.134,12.290)"
                                                                          style="fill:#000000; font-family: Arial, sans-serif; font-size:20px; font-weight:700; white-space:pre;">
                                                                      verfügbar
                                                                    </text>
                                                                  </g>
                                                                </svg>
                                """
                ),
                new TemplateSeed(
                        "event-board",
                        "Ereignisschild",
                        "Ereignisschild für 400x300 Displays",
                        400,
                        300,
                        """
                                <?xml version="1.0" encoding="utf-8"?>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400px" height="300px">
                            
                                  <!-- horizontale Linien -->
                                  <path id="events-line-1" style="fill: rgb(248, 6, 6); stroke: rgb(0, 0, 0);" d="M 15.964 134.303 L 376.409 134.411"/>
                                  <path id="events-line-2" style="fill: rgb(248, 6, 6); stroke: rgb(0, 0, 0); stroke-width: 1;" d="M 15.758 188.86 L 376.203 188.968"/>
                                  <path id="events-line-3" style="fill: rgb(248, 6, 6); stroke: rgb(0, 0, 0); stroke-width: 1;" d="M 15.758 244.143 L 376.203 244.251"/>
                                
                                  <g id="preview"/>
                                
                                  <!-- Header-Balken + Titel -->
                                  <rect id="events-header-bg" x="-1.17" y="0.002" width="400.752" height="46.775" style="fill: rgb(206, 24, 24);"/>
                                  <text id="events-title"
                                        style="fill: rgb(255, 255, 255); font-family: Arial, sans-serif; font-size: 31px; font-weight:700; white-space: pre;"
                                        x="20" y="34.553">
                                    Ereignisse
                                  </text>
                                
                                  <!-- Body (alle Events) – kann per transform verschoben werden -->
                                  <g id="events-body">
                                
                                  <!-- === Empty State Message (hidden by default) === -->
                                  <text id="no-events-message"
                                        style="fill: rgb(120, 120, 120); font-family: Arial, sans-serif; font-size: 26px; font-weight:700; text-anchor: middle; display:none;"
                                        x="200" y="80">
                                      Derzeit gibt es keine
                                  </text>
                                
                                  <text id="no-events-message-2"
                                        style="fill: rgb(120, 120, 120); font-family: Arial, sans-serif; font-size: 26px; font-weight:700; text-anchor: middle; display:none;"
                                        x="200" y="110">
                                      anstehenden Ereignisse
                                  </text>
                               
                                  <text id="idle-text-qr-1"
                                          x="200" y="250"
                                          text-anchor="middle"
                                          style="font-family:Arial,sans-serif; font-size:22px; font-weight:700; fill:#333; display:none;">
                                      QR-Code scannen und neue
                                    </text>
                                
                                    <text id="idle-text-qr-2"
                                          x="200" y="280"
                                          text-anchor="middle"
                                          style="font-family:Arial,sans-serif; font-size:22px; font-weight:700; fill:#333; display:none;">
                                      Ereignisse hinzufügen
                                    </text>
                                  
                                    <!-- Event 1 (immer rot) -->
                                    <text id="event-1-text-1"
                                          style="fill: rgb(255, 0, 0); font-family: Arial, sans-serif; font-size: 21px; font-weight:700; white-space: pre;"
                                          x="17.256" y="86.323">
                                      Event 1 Text 1
                                    </text>
                                    <text id="event-1-text-2"
                                          style="fill: rgb(255, 0, 0); font-family: Arial, sans-serif; font-size: 19px; font-weight:700; white-space: pre;"
                                          x="17.636" y="112.811">
                                      Event 1 Text 2
                                    </text>
                                
                                    <!-- Event 2 -->
                                    <text id="event-2-text-1"
                                          style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 19px; font-weight:700; white-space: pre; stroke-width: 1;"
                                          x="17.992" y="154.955">
                                      Event 2 Text 1
                                    </text>
                                    <text id="event-2-text-2"
                                          style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 17px; font-weight:700; white-space: pre; stroke-width: 1;"
                                          x="17.991" y="177.642">
                                      Event 2 Text 2
                                    </text>
                                
                                    <!-- Event 3 -->
                                    <text id="event-3-text-1"
                                          style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 19px; font-weight:700; white-space: pre; stroke-width: 1;"
                                          x="18.539" y="211.402">
                                      Event 3 Text 1
                                    </text>
                                    <text id="event-3-text-2"
                                          style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 17px; font-weight:700; white-space: pre; stroke-width: 1;"
                                          x="18.635" y="232.83">
                                      Event 3 Text 2
                                    </text>
                                
                                    <!-- Event 4 (unterster Slot / sticky) -->
                                    <text id="event-4-text-1"
                                          style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 19px; font-weight:700; white-space: pre; stroke-width: 1;"
                                          x="18.042" y="265.646">
                                      Event 4 Text 1
                                    </text>
                                    <text id="event-4-text-2"
                                          style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 17px; font-weight:700; white-space: pre; stroke-width: 1;"
                                          x="18.138" y="287.074">
                                      Event 4 Text 2
                                    </text>
                                    <rect id="event-4-highlight-frame"
                                          x="10"
                                          y="246"
                                          width="380"
                                          height="50"
                                          style="fill: none; stroke: none; stroke-width: 3;" />
                                  </g>
                                </svg>           
                                """
                ),
                new TemplateSeed(
                        "notice-board",
                        "Hinweisschild Klein",
                        "Hinweisschild für 250x128 Displays",
                        250,
                        128,
                        """
                                <svg id="root" xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 250 128" width="250" height="128">
                                
                                  <!-- globaler Hintergrund -->
                                  <rect id="bg" x="0" y="0" width="250" height="128" fill="#ffffff"/>
                                
                                  <!-- Zustand: befüllt -->
                                  <g id="state-filled">
                                
                                    <!-- Header-Balken -->
                                    <rect id="headerBar" x="0" y="0" width="250" height="28" fill="#ff0000"/>
                                
                                    <!-- Titel -->
                                    <text id="headerTitle"
                                          x="5" y="20"
                                          style="fill:#ffffff; font-family:Arial,sans-serif; font-size:19px; font-weight:700;">
                                      Hinweis
                                    </text>
                                
                                    <!-- Textzeile 1 -->
                                    <text id="line1"
                                          x="8" y="57"
                                          style="fill:#000000; font-family:Arial,sans-serif; font-size:19px;font-weight:700;">
                                      Textzeile 1
                                    </text>
                                
                                    <!-- Textzeile 2 -->
                                    <text id="line2"
                                          x="8" y="92"
                                          style="fill:#000000; font-family:Arial,sans-serif; font-size:19px;font-weight:700;">
                                      Textzeile 2
                                    </text>
                                
                                  </g>
                                
                                  <!-- Zustand: Leerlauf -->
                                  <g id="state-idle" style="display:none">
                                
                                    <rect x="0" y="0" width="250" height="28"
                                          style="fill:#ff0000;"/>
                                
                                    <text x="60" y="20"
                                          style="fill:#fff; font-family:Arial,sans-serif; font-size:20px;font-weight:700;">
                                      Hinweisschild
                                    </text>
                                
                                    <!-- optionaler QR-Code Platzhalter -->
                                    <g id="QR-Code" transform="matrix(1,0,0,1,0,0)"></g>
                                
                                    <text x="5" y="55"
                                          style="fill:#333; font-family:Arial,sans-serif; font-size:14px;font-weight:700;">
                                      Zum Beschreiben QR-Code scannen
                                    </text>
                      
                                  </g>
                                
                                </svg>
                                """
                ),
                new TemplateSeed(
                        "notice-board",
                        "Hinweisschild",
                        "Hinweisschild für 296x128 Displays",
                        296,
                        128,
                        """
                                 <svg id="root" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 296 128" width="296" height="128">
                                   <!-- globaler Hintergrund: -->
                                   <rect id="bg" x="0" y="0" width="296" height="128" fill="#ffffff"/>
                                
                                   <!-- Zustand: befüllt -->
                                   <g id="state-filled">
                                     <rect id="headerBar" x="0.071" y="0.355" width="296" height="37.374" fill="#ff0000" />
                                     <text id="headerTitle" x="8.415" y="29.554"
                                           style="fill:#ffffff; font-family: Arial, sans-serif; font-size: 24px; font-weight:700;">Druckerstatus</text>
                                
                                     <!-- lieber reines Schwarz statt #333 für saubere Palettierung -->
                                     <text id="line1" x="9" y="66"
                                           style="fill:#000000; font-family: Arial, sans-serif; font-size: 20px; font-weight:700;">Textzeile 1</text>
                                     <text id="line2" x="9" y="93"
                                           style="fill:#000000; font-family: Arial, sans-serif; font-size: 20px; font-weight:700;">Textzeile 2</text>
                                   </g>
                                
                                   <!-- Zustand: Leerlauf -->
                                   <g id="state-idle" style="display:none">
                                     <rect x="0.071" y="0.355" width="296" height="37.374" style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0);"/>
                                         <text style="fill: rgb(255, 255, 255); font-family: Arial, sans-serif; font-size: 28px; white-space: pre;" x="64.476" y="28.386">Hinweisschild</text>
                                         <g id="QR-Code" transform="matrix(1.333696, 0, 0, 1.208561, -400.829291, -33.080102)" style="">
                                         </g>
                                         <text style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; white-space: pre; font-size: 16px;font-weight:700;" x="10" y="60.503">Zum Beschreiben QR-Code scannen</text>
                                    </g>
                                 </svg>
                                """
                ),
                new TemplateSeed(
                        "room-booking",
                        "Raumbuchungsschild",
                        "Raumbuchungsschild für 400x300 Displays",
                        400,
                        300,
                        """
                                <?xml version="1.0" encoding="utf-8"?>
                                    <svg id="root"
                                         xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 400 300"
                                         width="400"
                                         height="300">

                                      <!-- Raumkopf (immer sichtbar) -->
                                      <text id="room-number"
                                            x="248" y="46"
                                            style="fill:#000000; font-family: Arial, sans-serif; font-size:45px; font-weight:700;">
                                        SP.123
                                      </text>
                               
                                      <text id="room-name"
                                            x="280" y="290"
                                            style="fill:#333333; font-family: Arial, sans-serif; font-size:15px; font-weight:700;font-weight:700;">
                                        Konferenzraum
                                      </text>
                               
                                      <g id="qr-code"
                                         transform="matrix(1.315342, 0, 0, 1.245268, -105.979878, -40.375223)">
                                      </g>

                                      <!-- ===================== -->
                                      <!-- Zustand: BEFÜLLT -->
                                      <!-- ===================== -->
                                      <g id="state-filled">

                                        <text id="current-label"
                                              x="18" y="46"
                                              style="fill:#ff0000; font-family: Arial, sans-serif; font-size:22px; font-weight:700;">
                                          Anstehender Termin
                                        </text>

                                        <rect id="current-box"
                                              x="12" y="54"
                                              width="380" height="58"
                                              style="fill:none; stroke:#000000;" />

                                        <text id="current-time"
                                              x="18" y="77"
                                              style="fill:#ff0000; font-family: Arial, sans-serif; font-size:16px;font-weight:700;">
                                          18.12.25: 11:00 Uhr - 11:30 Uhr
                                        </text>
                                        <text id="current-title"
                                              x="18" y="100"
                                              style="fill:#ff0000; font-family: Arial, sans-serif; font-size:18px;font-weight:700;">
                                          Daily Meeting
                                        </text>
                                        <path id="line-1" d="M 13 170 L 280 170" style="stroke:#000000;" />
                                        <path id="line-2" d="M 13 215 L 280 215" style="stroke:#000000;" />
                                        <text id="next-1a" x="15" y="145" style="font-size:15px;font-weight:700;">19.12.25: 11:30 Uhr - 20.12.25 9:00 Uhr </text>
                                        <text id="next-1b" x="15" y="160" style="font-size:15px;font-weight:700;">Austellung</text>
    
                                        <text id="next-2a" x="15" y="190" style="font-size:15px;font-weight:700;">25.12.25: 12:00 Uhr</text>
                                        <text id="next-2b" x="15" y="205" style="font-size:15px;font-weight:700;">Weihnachtsessen</text>
    
                                        <text id="next-3a" x="15" y="235" style="font-size:15px;font-weight:700;">31.01.2025: 20:00 Uhr - 23:00 Uhr</text>
                                        <text id="next-3b" x="15" y="250" style="font-size:15px;font-weight:700;">Raclette Essen</text>
    
                                      </g>
                                      <!-- ===================== -->
                                      <!-- Zustand: LEERLAUF -->
                                      <!-- ===================== -->
                                      <g id="state-idle" style="display:none">
                                   <rect x="21" y="90"
                                              width="228" height="69"
                                              style="fill:none; stroke:#ff0000;" />
                                        <text id="idle-text"
                                              x="25" y="120"
                                              style="fill:#333333; font-family: Arial, sans-serif; font-size:24px; font-weight:700;">
                                          Keine anstehenden
                                          <tspan x="86" dy="1.2em">Termine</tspan>
                                        </text>
                                      </g>
                                    </svg>
                                """
                ),
                new TemplateSeed(
                        "test-board",
                        "TestSchild",
                        "Ereignisschild für 400x300 Displays",
                        400,
                        300,
                        """
                                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="400" height="300" fill="#ffffff"/>
                                    <text x="20" y="40" font-size="28" fill="#000000">{title}</text>
                                    <text x="20" y="70" font-size="16" fill="#000000">{description}</text>
                                </svg>
                                """
                )
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
        final String svg = seed.svgContent().trim();
        final TemplateType typeEntity = templateTypeRepository.findByTypeKey(type)
                .orElseThrow(() -> new IllegalStateException("Template type seed missing for key " + type));

        templateRepository.findByTemplateTypeEntity_TypeKeyAndDisplayWidthAndDisplayHeight(type, w, h)
                .ifPresentOrElse(existing -> {
                    // update if needed
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
                }, () -> {
                    createTemplate(seed);
                });
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

