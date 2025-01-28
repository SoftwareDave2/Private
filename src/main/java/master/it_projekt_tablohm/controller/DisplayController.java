package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Controller
@RequestMapping(path = "/display")
public class DisplayController {
    @Autowired
    private DisplayRepository displayRepository;

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/add")
    public @ResponseBody String addDisplay(
            @RequestParam String macAddress,
            @RequestParam String brand,
            @RequestParam String model,
            @RequestParam Integer width,
            @RequestParam Integer height,
            @RequestParam String orientation,
            @RequestParam String filename,
            @RequestParam(required = false) LocalDateTime wakeTime) {

        Optional<Display> existingDisplay = displayRepository.findByMacAddress(macAddress);
        if (!existingDisplay.isPresent()) {
            return "Display with this Mac Address not initiated yet!";
        }
        Display display = existingDisplay.get();
        display.setBrand(brand);
        display.setModel(model);
        display.setWidth(width);
        display.setHeight(height);
        display.setOrientation(orientation);
        //display.setFilename("/uploads/" + filename);
        display.setFilename(filename);

        // Set wakeTime to null if it's not provided
        if (wakeTime != null) {
            display.setWakeTime(wakeTime);
        }

        displayRepository.save(display);
        return "Saved";
    }

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/initiate")
    public @ResponseBody ResponseEntity<Map<String, Object>> initiateDisplay(@RequestParam String macAddress,
                                                                             @RequestParam int width,
                                                                             @RequestParam int height) {
        Map<String, Object> response = new HashMap<>();

        if (macAddress == null || macAddress.isEmpty()) {
            response.put("error", "No MAC address was given.");
            return ResponseEntity.badRequest().body(response);
        }

        // Check if a display with the given MAC address already exists
        Optional<Display> existingDisplay = displayRepository.findByMacAddress(macAddress);

        if (existingDisplay.isPresent()) {
            response.put("message", "Display with mac-address: " + macAddress + " is already initiated.");
            return ResponseEntity.ok(response);
        }

        // If not, create and save a new display
        Display display = new Display();
        display.setMacAddress(macAddress);
        //display.setFilename("src/frontend/public/uploads/initial.jpg");
        display.setFilename("initial.jpg");
        display.setWidth(width);
        display.setHeight(height);
        display.setWakeTime(LocalDateTime.now().plusHours(1));
        displayRepository.save(display);

        // Add current time and new wake time to the response
        response.put("currentTime", LocalDateTime.now().toString());
        response.put("wakeTime", display.getWakeTime().toString());
        response.put("message", "Display initiated with mac-address: " + macAddress);

        return ResponseEntity.ok(response);
    }



    @CrossOrigin(origins = "*")
    @DeleteMapping(path = "/delete/{mac}")
    public @ResponseBody String deleteDisplay(@PathVariable String mac) {
        // Check if the display exists using the MAC address
        return displayRepository.findByMacAddress(Objects.requireNonNull(mac))
                .map(display -> {
                    displayRepository.delete(display);
                    return "Display with MAC address " + mac + " deleted.";
                })
                .orElse("Display with MAC address " + mac + " not found.");
    }


    @CrossOrigin(origins = "*")
    @GetMapping(path = "/all")
    public @ResponseBody Iterable<Display> getAllDisplays() {
        return displayRepository.findAll();
    }

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/get/{mac}")
    public @ResponseBody Display getDisplayById(@PathVariable String mac) {
        return displayRepository.findByMacAddress(Objects.requireNonNull(mac))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Display not found"));
    }

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/switch")
    public @ResponseBody String initiateDisplay(@RequestParam String macAddress, @RequestParam String filename) {
        LocalDateTime timeNow = LocalDateTime.now();

        return displayRepository.findByMacAddress(Objects.requireNonNull(macAddress))
                .map(display -> {
                    display.setFilenameApp(filename);
                    display.setLastSwitch(timeNow);
                    displayRepository.save(display);
                    return "Image of Display with MAC address: " + macAddress + " switched to " + filename + " at " + timeNow.toString() + ".";
                })
                .orElse("Display with MAC address " + macAddress + " not found.");
    }

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/brands")
    public @ResponseBody List<String> getDistinctBrands() {
        return displayRepository.findDistinctBrands();
    }
}
