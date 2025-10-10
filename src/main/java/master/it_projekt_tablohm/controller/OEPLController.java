package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.services.OpenEPaperSyncService;
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

    public OEPLController(OpenEPaperSyncService openEPaperSyncService,
                          DisplayRepository displayRepository) {
        this.openEPaperSyncService = openEPaperSyncService;
        this.displayRepository = displayRepository;
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
}
