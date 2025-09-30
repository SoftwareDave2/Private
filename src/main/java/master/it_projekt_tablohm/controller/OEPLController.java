package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.services.OpenEPaperSyncService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping(path = "/oepl")
@CrossOrigin(origins = "*")
public class OEPLController {

    private final OpenEPaperSyncService openEPaperSyncService;

    public OEPLController(OpenEPaperSyncService openEPaperSyncService) {
        this.openEPaperSyncService = openEPaperSyncService;
    }

    @PostMapping(path = "/send-image")
    public @ResponseBody ResponseEntity<String> sendImage(@RequestBody Map<String, String> payload) {
        String filename = payload.get("filename");
        String mac = payload.get("mac");
        if (filename == null || filename.isBlank() || mac == null || mac.isBlank()) {
            return ResponseEntity.badRequest().body("Filename and macAdress are required");
        }

        try {
            // TODO: finish method and uncomment
            // openEPaperSyncService.sendImageToDisplay(filename, mac);
            return ResponseEntity.ok("Image successfully sent: " + filename);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while sending image: " + e.getMessage());
        }
    }
}
