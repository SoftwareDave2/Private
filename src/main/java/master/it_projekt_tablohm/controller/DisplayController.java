package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Controller
@RequestMapping(path = "/display")
public class DisplayController {
    @Autowired
    private DisplayRepository displayRepository;

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

    @GetMapping(path = "/all")
    public @ResponseBody Iterable<Display> getAllDisplays() {
        return displayRepository.findAll();
    }
}
