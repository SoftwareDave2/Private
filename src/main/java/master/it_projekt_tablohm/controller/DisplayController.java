package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(path = "/display")
public class DisplayController {
    @Autowired
    private DisplayRepository displayRepository;

    @PostMapping(path = "/add")
    public @ResponseBody String addDisplay (@RequestParam String brand, @RequestParam String model, @RequestParam Integer width, @RequestParam Integer height, @RequestParam String orientation) {

        Display display = new Display();
        display.setBrand(brand);
        display.setModel(model);
        display.setWidth(width);
        display.setHeight(height);
        display.setOrientation(orientation);
        displayRepository.save(display);
        return "Saved";
    }

    @GetMapping(path = "/all")
    public @ResponseBody Iterable<Display> getAllDisplays() {
        return displayRepository.findAll();
    }
}
