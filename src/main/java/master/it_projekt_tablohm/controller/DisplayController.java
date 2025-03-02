package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Config;
import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.DisplayImage;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.repositories.ConfigRepository;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
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
    private final DisplayRepository displayRepository;
    private final EventRepository eventRepository;
    private final ConfigRepository configRepository;

    public DisplayController(EventRepository eventRepository, DisplayRepository displayRepository, ConfigRepository configRepository) {
        this.eventRepository = eventRepository;
        this.displayRepository = displayRepository;
        this.configRepository = configRepository;
    }

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/add")
    public @ResponseBody String addDisplay(
            @RequestParam String macAddress,
            @RequestParam String displayName,
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
        display.setDisplayName(displayName);
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
        display.setDoSwitch(true);
        display.setFilenameApp("");
        display.setFilename("initial.jpg");
        display.setWidth(width);
        display.setHeight(height);
        display.setWakeTime(LocalDateTime.now().plusMinutes(10));
        displayRepository.save(display);

        // Add current time and new wake time to the response
        response.put("currentTime", LocalDateTime.now().toString());
        response.put("wakeTime", display.getWakeTime().toString());
        response.put("message", "Display initiated with mac-address: " + macAddress);

        return ResponseEntity.ok(response);
    }


    @CrossOrigin(origins = "*")
    @GetMapping(path = "/currentTime")
    public @ResponseBody ResponseEntity<Map<String, Object>> currentTime() {
        Map<String, Object> response = new HashMap<>();
        response.put("currentTime", LocalDateTime.now().toString());
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
         Display display = displayRepository.findByMacAddress(Objects.requireNonNull(mac))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Display not found"));

         List<Event> events = eventRepository.findByDisplayMacAddress(mac);
        Config config = configRepository.findAll().stream().findFirst().get();

         LocalDateTime next = LocalDateTime.MAX;
         String filename = "";
         if(!events.isEmpty()) {
             for(Event e : events) {
                 for(DisplayImage di : e.getDisplayImages()) {
                     if (di.getdisplayMac().equals(mac)) {
                         if(e.getStart().minusMinutes(config.getLeadTime()).isBefore(LocalDateTime.now()) && e.getEnd().plusMinutes(config.getFollowUpTime()).isAfter(LocalDateTime.now())) {
                             filename = di.getImage();
                             next = e.getEnd().plusMinutes(config.getFollowUpTime());
                         }
                     }
                 }
             }

             if(next == LocalDateTime.MAX) {
                 for(Event e : events) {
                     for(DisplayImage di : e.getDisplayImages()) {
                         if (di.getdisplayMac().equals(mac)) {
                             if(e.getStart().minusMinutes(config.getLeadTime()).isAfter(LocalDateTime.now())) {
                                 next = e.getStart().minusMinutes(config.getLeadTime());
                             }
                         }
                     }
                 }
             }
         }

         if(next == LocalDateTime.MAX)
             next = LocalDateTime.now().plusMinutes(10);

         if(filename.equals(""))
             filename = "initial.jpg";

         display.setDoSwitch(!display.getFilenameApp().equals(filename));
         display.setFilename(filename);
         display.setWakeTime(next);
         displayRepository.save(display);

         return display;
    }

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/switch")
    public @ResponseBody String imageSwitch(@RequestParam String macAddress, @RequestParam String filename) {
        LocalDateTime timeNow = LocalDateTime.now();

        return displayRepository.findByMacAddress(Objects.requireNonNull(macAddress))
                .map(display -> {
                    display.setFilenameApp(filename);
                    display.setLastSwitch(timeNow);
					display.setDoSwitch(false);
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

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/models")
    public @ResponseBody List<String> getDistinctModels() {
        return displayRepository.findDistinctModels();
    }

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/postBattery")
    public @ResponseBody String postBattery(@RequestParam String macAddress, @RequestParam Integer batteryPercentage) {
        LocalDateTime timeNow = LocalDateTime.now();

        return displayRepository.findByMacAddress(Objects.requireNonNull(macAddress))
                .map(display -> {
                    display.setBattery_percentage(batteryPercentage);
                    display.setTimeOfBattery(timeNow);
                    displayRepository.save(display);
                    return "Battery percentage of Display with MAC address: " + macAddress + " saved at " + timeNow.toString() + ".";
                })
                .orElse("Display with MAC address " + macAddress + " not found.");
    }
}
