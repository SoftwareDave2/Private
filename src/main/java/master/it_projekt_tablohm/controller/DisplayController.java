package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Optional;

@Controller
@RequestMapping(path = "/display")
public class DisplayController {
    @Autowired
    private DisplayRepository displayRepository;

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/add")
    public @ResponseBody String addDisplay(
            @RequestParam String brand,
            @RequestParam String model,
            @RequestParam Integer width,
            @RequestParam Integer height,
            @RequestParam String orientation,
            @RequestParam String filename) {

        Display display = new Display();
        display.setBrand(brand);
        display.setModel(model);
        display.setWidth(width);
        display.setHeight(height);
        display.setOrientation(orientation);
        display.setFilename(filename);
        displayRepository.save(display);
        return "Saved";
    }

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/initiate")
    public @ResponseBody String initiateDisplay(@RequestParam(required = false) String macAddress) {
        if (macAddress == null || macAddress.isEmpty()) {
            return "Error: No MAC address was given.";
        }

        // Check if a display with the given MAC address already exists
        Optional<Display> existingDisplay = displayRepository.findByMacAddress(macAddress);

        if (existingDisplay.isPresent()) {
            return "Display with mac-address: " + macAddress + " is already initiated.";
        }

        // If not, create and save a new display
        Display display = new Display();
        display.setMacAddress(macAddress);
        displayRepository.save(display);

        return "Display initiated with mac-address: " + macAddress;
    }



    @CrossOrigin(origins = "*")
    @DeleteMapping(path = "/delete/{id}")
    public @ResponseBody String deleteDisplay(@PathVariable Integer id) {
        // Check if the display exists
        if (displayRepository.existsById(id)) {
            displayRepository.deleteById(id);
            return "Display with ID " + id + " deleted.";
        } else {
            return "Display with ID " + id + " not found.";
        }
    }

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/all")
    public @ResponseBody Iterable<Display> getAllDisplays() {
        return displayRepository.findAll();
    }
}
