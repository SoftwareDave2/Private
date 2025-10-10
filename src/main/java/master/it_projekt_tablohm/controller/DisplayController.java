package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.*;
import master.it_projekt_tablohm.repositories.ConfigRepository;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
import master.it_projekt_tablohm.services.ErrorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.time.format.TextStyle;
import java.util.*;

@Controller
@RequestMapping(path = "/display")
public class DisplayController {
    @Autowired
    private final DisplayRepository displayRepository;
    private final EventRepository eventRepository;
    private final ConfigRepository configRepository;
    @Autowired
    private ErrorService errorService;

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
            @RequestParam String defaultFilename,
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
        display.setDefaultFilename(defaultFilename);

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
        display.setDoSwitch(true);
        display.setFilenameApp("");
        display.setDefaultFilename("initial.jpg");
        display.setFilename(display.getDefaultFilename());
        display.setOrientation("vertical");
        display.setDisplayTechnology("Tableaux");
        display.setDisplayType("Anzeige");
        display.setWidth(width);
        display.setHeight(height);
        display.setWakeTime(LocalDateTime.now().plusMinutes(10));
        display.setRunningSince(LocalDateTime.now());
        displayRepository.save(display);

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

    private class WakeTimeFilename {
        private LocalDateTime wakeTime;
        private String filename;

        public WakeTimeFilename(LocalDateTime wakeTime, String filename) {
            this.wakeTime = wakeTime;
            this.filename = filename;
        }

        public LocalDateTime getWakeTime() {
            return wakeTime;
        }

        public String getFilename() {
            return filename;
        }
    }

    private LocalDateTime leadStart(Config config, Event event) {
        return event.getStart().minusMinutes(config.getLeadTime());
    }

    private LocalDateTime followEnd(Config config, Event event) {
        return event.getEnd().plusMinutes(config.getFollowUpTime());
    }

    private WakeTimeFilename findNextWakeTime(Config config, List<Event> events, String mac) {
        Event leadFollowCurrent = null;
        String leadFollowCurrentFilename = "";

        Event current = null;
        String currentFilename = "";

        LocalDateTime nextStart = LocalDateTime.MAX;
        Event next = null;

        LocalDateTime nextnextStart = LocalDateTime.MAX;
        Event nextnext = null;

        LocalDateTime now = LocalDateTime.now();

        for (Event e : events) {
            for (DisplayImage di : e.getDisplayImages()) {
                if (di.getdisplayMac().equals(mac)) {

                    LocalDateTime leadStart = leadStart(config, e);
                    LocalDateTime followEnd = followEnd(config, e);
                    if (now.isAfter(leadStart) && now.isBefore(followEnd)) {
                        leadFollowCurrent = e;
                        leadFollowCurrentFilename = di.getImage();
                    }

                    LocalDateTime start = e.getStart();
                    LocalDateTime end = e.getEnd();
                    if (now.isAfter(start) && now.isBefore(end)) {
                        current = e;
                        currentFilename = di.getImage();
                    }
                    else if (now.isBefore(start)) {
                        if (start.isBefore(nextStart)) {
                            nextnextStart = nextStart;
                            nextnext = next;

                            nextStart = start;
                            next = e;
                        }
                        else if (start.isBefore(nextnextStart)) {
                            nextnextStart = start;
                            nextnext = e;
                        }
                    }

                }
            }
        }

        if (current == null && leadFollowCurrent != null) {
            current = leadFollowCurrent;
            currentFilename = leadFollowCurrentFilename;

            if (current != next) {
                System.out.println("cur != next");
            }

            next = nextnext;
        }

        LocalDateTime wakeTime = LocalDateTime.MAX;
        if (current != null) {
            LocalDateTime currentFollowEnd = followEnd(config, current);
            wakeTime = currentFollowEnd;

            if (next != null) {
                LocalDateTime nextLeadStart = leadStart(config, next);
                long diff = Duration.between(currentFollowEnd, nextLeadStart).getSeconds();
                if (diff <= 2 * 60) {
                    if (nextLeadStart.isBefore(current.getEnd()))
                        wakeTime = current.getEnd();
                    else
                        wakeTime = nextLeadStart;
                }
            }
        }
        else if (next != null)
            wakeTime = leadStart(config, next);

        return new WakeTimeFilename(wakeTime, currentFilename);
    }

    private LocalDateTime findNextInterval(Config config) {
        Map<String, WeekdayTime> weekdayTimes = config.getWeekdayTimes();

        LocalDateTime localDateTimeNow = LocalDateTime.now();
        LocalDate localDateNow = localDateTimeNow.toLocalDate();
        LocalTime localTimeNow = localDateTimeNow.toLocalTime();

        DayOfWeek dayOfWeek = localDateTimeNow.getDayOfWeek();
        int days = 0;
        while(days <= 7) {
            String dayName = dayOfWeek.getDisplayName(TextStyle.FULL, Locale.GERMANY);
            WeekdayTime weekdayTime = weekdayTimes.get(dayName);

            if(weekdayTime.isEnabled()) {
                LocalTime start = weekdayTime.getStartTime();
                LocalTime end = weekdayTime.getEndTime();

                if(days == 0) {
                    if(localTimeNow.isAfter(start) && localTimeNow.isBefore(end)) {
                        Duration wakeIntervalDay = Duration.ofMinutes(config.getWakeIntervalDay());
                        long count = Duration.between(start, localTimeNow).dividedBy(wakeIntervalDay);
                        count++;

                        LocalTime nextTime = start.plus(wakeIntervalDay.multipliedBy(count));
                        if(!nextTime.isAfter(end))
                            return nextTime.atDate(localDateNow);
                    }
                }
                else {
                    return start.atDate(localDateNow.plusDays(days));
                }
            }

            dayOfWeek = dayOfWeek.plus(1);
            days++;
        }
        return LocalDateTime.MAX;
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
            WakeTimeFilename wakeTimeFilename = findNextWakeTime(config, events, mac);
            next = wakeTimeFilename.getWakeTime();
            filename = wakeTimeFilename.getFilename();
        }

        LocalDateTime intervalNext = findNextInterval(config);
        if(intervalNext.isBefore(next))
            next = intervalNext;

        // LocalDateTime.MAX throws exception in database
        if(next == LocalDateTime.MAX)
            next = LocalDateTime.now().plusYears(1);

        if(filename.equals(""))
            filename = display.getDefaultFilename();

        display.setDoSwitch(!display.getFilenameApp().equals(filename));
        display.setFilename(filename);
        display.setWakeTime(next);
        errorService.removeErrorFromDisplay(display.getId(), 102);
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
                    if(batteryPercentage <= 10){
                        DisplayError error = new DisplayError(121, "Battery low");
                        display.addError(error.getErrorCode(), error.getErrorMessage());
                    }else{
                        errorService.removeErrorFromDisplay(display.getId(), 121);
                    }
                    display.setTimeOfBattery(timeNow);
                    displayRepository.save(display);
                    return "Battery percentage of Display with MAC address: " + macAddress + " saved at " + timeNow.toString() + ".";
                })
                .orElse("Display with MAC address " + macAddress + " not found.");
    }
}
