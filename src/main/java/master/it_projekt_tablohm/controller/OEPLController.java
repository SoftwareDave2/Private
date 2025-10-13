package master.it_projekt_tablohm.controller;

import jakarta.validation.Valid;
import master.it_projekt_tablohm.dto.TemplateSubmissionDTO;
import master.it_projekt_tablohm.dto.TemplateSubmissionResponseDTO;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.services.OpenEPaperSyncService;
import master.it_projekt_tablohm.services.TemplateSubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
@RequestMapping(path = "/oepl")
@CrossOrigin(origins = "*")
public class OEPLController {

    private final OpenEPaperSyncService openEPaperSyncService;
    private final DisplayRepository displayRepository;
    private final TemplateSubmissionService templateSubmissionService;

    public OEPLController(OpenEPaperSyncService openEPaperSyncService,
                          DisplayRepository displayRepository,
                          TemplateSubmissionService templateSubmissionService) {
        this.openEPaperSyncService = openEPaperSyncService;
        this.displayRepository = displayRepository;
        this.templateSubmissionService = templateSubmissionService;
    }

    @PostMapping(path = "/send-image")
    public @ResponseBody ResponseEntity<String> sendImage(@RequestBody Map<String, String> payload) {
        String filename = payload.get("filename");
        String mac = payload.get("mac");
        if (filename == null || filename.isBlank() || mac == null || mac.isBlank()) {
            return ResponseEntity.badRequest().body("Filename and macAdress are required");
        }

        try {
            //sending Image to OEPL
            openEPaperSyncService.uploadImageToOEPLForDisplay(filename, mac);

            //updating Display
            displayRepository.findByMacAddress(mac).ifPresent(display -> {
                LocalDateTime now = LocalDateTime.now();
                display.setFilename(filename);
                display.setDefaultFilename(filename);
                display.setLastSwitch(now);
                display.setDoSwitch(false);
                displayRepository.save(display);
            });

            return ResponseEntity.ok("Image successfully sent and display updated: " + filename);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while sending image: " + e.getMessage());
        }
    }

    @PostMapping(path = "/template")
    public @ResponseBody ResponseEntity<TemplateSubmissionResponseDTO> submitTemplate(
            @Valid @RequestBody TemplateSubmissionDTO submissionDTO) {
        var response = templateSubmissionService.handleSubmission(submissionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
