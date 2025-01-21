package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping(path = "/event")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private DisplayRepository displayRepository;

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/add")
    public @ResponseBody ResponseEntity<String> addEvent(
            @RequestParam String title,
            @RequestParam Boolean allDay,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end,
            @RequestParam String displayMac,
            @RequestParam(required = false) String image) {

        // Validate display existence
        Optional<Display> displayOpt = displayRepository.findByMacAddress(displayMac);
        if (!displayOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Display with MAC " + displayMac + " not found.");
        }

        Event event = new Event();
        event.setTitle(title);
        event.setAllDay(allDay);
        event.setStart(start);
        event.setEnd(end);
        event.setDisplay(displayOpt.get());
        event.setImage(image);

        eventRepository.save(event);
        return ResponseEntity.ok("Event added successfully.");
    }

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/all/{displayMac}")
    public @ResponseBody ResponseEntity<List<Event>> getEventsByDisplay(@PathVariable String displayMac) {
        List<Event> events = eventRepository.findByDisplayMacAddress(displayMac);
        return ResponseEntity.ok(events);
    }

    @CrossOrigin(origins = "*")
    @PutMapping(path = "/update/{id}")
    public @ResponseBody ResponseEntity<String> updateEvent(
            @PathVariable Integer id,
            @RequestParam String title,
            @RequestParam Boolean allDay,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end,
            @RequestParam(required = false) String image) {

        Optional<Event> eventOpt = eventRepository.findById(id);
        if (!eventOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Event with ID " + id + " not found.");
        }

        Event event = eventOpt.get();
        event.setTitle(title);
        event.setAllDay(allDay);
        event.setStart(start);
        event.setEnd(end);
        event.setImage(image);

        eventRepository.save(event);
        return ResponseEntity.ok("Event updated successfully.");
    }

    @CrossOrigin(origins = "*")
    @DeleteMapping(path = "/delete/{id}")
    public @ResponseBody ResponseEntity<String> deleteEvent(@PathVariable Integer id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (!eventOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Event with ID " + id + " not found.");
        }

        eventRepository.delete(eventOpt.get());
        return ResponseEntity.ok("Event deleted successfully.");
    }

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/all")
    public @ResponseBody Iterable<Event> getAllEvents() {
        return eventRepository.findAll();
    }
}

