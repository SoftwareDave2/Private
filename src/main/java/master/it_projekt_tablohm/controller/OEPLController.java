package master.it_projekt_tablohm.controller;

import jakarta.validation.Valid;
import master.it_projekt_tablohm.dto.DisplayEventSubmissionResponseDTO;
import master.it_projekt_tablohm.dto.DisplaySubDataDTO;
import master.it_projekt_tablohm.dto.TemplateDefinitionDTO;
import master.it_projekt_tablohm.dto.TemplateDisplayDataDTO;
import master.it_projekt_tablohm.dto.TemplateTypeDTO;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.services.DisplayEventService;
import master.it_projekt_tablohm.services.OpenEPaperSyncService;
import master.it_projekt_tablohm.services.TemplateManagementService;
import master.it_projekt_tablohm.services.TemplateMaintenanceService;
import org.apache.batik.anim.dom.SVG12DOMImplementation;
import org.apache.batik.anim.dom.SVGDOMImplementation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping(path = "/oepl")
@CrossOrigin(origins = "*")
public class OEPLController {

    private final OpenEPaperSyncService openEPaperSyncService;
    private final DisplayRepository displayRepository;
    private final DisplayEventService displayEventService;
    private final TemplateManagementService templateManagementService;
    private final TemplateMaintenanceService templateMaintenanceService;

    public OEPLController(OpenEPaperSyncService openEPaperSyncService,
                          DisplayRepository displayRepository,
                          DisplayEventService displayEventService,
                          TemplateManagementService templateManagementService,
                          TemplateMaintenanceService templateMaintenanceService) {
        this.openEPaperSyncService = openEPaperSyncService;
        this.displayRepository = displayRepository;
        this.displayEventService = displayEventService;
        this.templateManagementService = templateManagementService;
        this.templateMaintenanceService = templateMaintenanceService;
    }

    @PostMapping(path = "/send-image")
    public @ResponseBody ResponseEntity<String> sendImage(@RequestBody Map<String, String> payload) {
        String filename = payload.get("filename");
        String mac = payload.get("mac");
        if (filename == null || filename.isBlank() || mac == null || mac.isBlank()) {
            return ResponseEntity.badRequest().body("Filename and macAdress are required");
        }

        try {
            //updating Display
            displayRepository.findByMacAddress(mac).ifPresent(display -> {
                LocalDateTime now = LocalDateTime.now();
                display.setFilename(filename);
                display.setDefaultFilename(filename);
                display.setLastSwitch(now);
                display.setDoSwitch(false);
                // triggering update and image sending to OEPL
                displayRepository.save(display);
            });

            return ResponseEntity.ok("Image successfully sent and display updated: " + filename);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while sending image: " + e.getMessage());
        }
    }

    @PostMapping(path = "/display-data")
    public @ResponseBody ResponseEntity<DisplayEventSubmissionResponseDTO> submitDisplayData(
            @Valid @RequestBody TemplateDisplayDataDTO displayDataDTO) {
        var response = displayEventService.saveDisplayData(displayDataDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(path = "/templates")
    public @ResponseBody ResponseEntity<TemplateDefinitionDTO> createTemplate(
            @Valid @RequestBody TemplateDefinitionDTO templateDefinitionDTO) {
        var created = templateManagementService.createTemplate(templateDefinitionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping(path = "/templates/{templateType}")
    public @ResponseBody ResponseEntity<TemplateDefinitionDTO> updateTemplate(
            @PathVariable String templateType,
            @Valid @RequestBody TemplateDefinitionDTO templateDefinitionDTO) {
        var updated = templateManagementService.updateTemplate(templateType, templateDefinitionDTO);
        return ResponseEntity.ok(updated);
    }

    //Ausgabe der Templates und DisplayData aus Repositories
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    @GetMapping(path = "/display-data/template/{templateType}")
    public @ResponseBody ResponseEntity<List<TemplateDisplayDataDTO>> getDisplayDataForTemplate(
            @PathVariable String templateType) {
        return ResponseEntity.ok(displayEventService.getDisplayDataByTemplateType(templateType));
    }

    @GetMapping(path = "/display-data/display/{displayMac}")
    public @ResponseBody ResponseEntity<List<TemplateDisplayDataDTO>> getDisplayDataForDisplay(
            @PathVariable String displayMac) {
        return ResponseEntity.ok(displayEventService.getDisplayDataByDisplayMac(displayMac));
    }

    @GetMapping(path = "/display-data/display/{displayMac}/subitems")
    public @ResponseBody ResponseEntity<List<DisplaySubDataDTO>> getSubDataForDisplay(
            @PathVariable String displayMac) {
        return ResponseEntity.ok(displayEventService.getSubDataByDisplayMac(displayMac));
    }

    @GetMapping(path = "/display-data/display/{displayMac}/active")
    public @ResponseBody ResponseEntity<TemplateDisplayDataDTO> getActiveDisplayDataForDisplay(
            @PathVariable String displayMac) {
        TemplateDisplayDataDTO dto = displayEventService.getActiveDisplayDataForDisplay(displayMac);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping(path = "/templates")
    public @ResponseBody ResponseEntity<List<TemplateDefinitionDTO>> listTemplates() {
        return ResponseEntity.ok(templateManagementService.listTemplates());
    }

    @GetMapping(path = "/templates/{templateType}")
    public @ResponseBody ResponseEntity<TemplateDefinitionDTO> getTemplate(
            @PathVariable String templateType) {
        return ResponseEntity.ok(templateManagementService.getTemplate(templateType));
    }

    @GetMapping(path = "/template-types")
    public @ResponseBody ResponseEntity<List<TemplateTypeDTO>> listTemplateTypes() {
        return ResponseEntity.ok(templateManagementService.listTemplateTypes());
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
}
