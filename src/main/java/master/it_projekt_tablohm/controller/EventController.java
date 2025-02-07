package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.models.DisplayImage;
import master.it_projekt_tablohm.repositories.EventRepository;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/event")
public class EventController {
    private final EventRepository eventRepository;
    private final DisplayRepository displayRepository;

    public EventController(EventRepository eventRepository, DisplayRepository displayRepository) {
        this.eventRepository = eventRepository;
        this.displayRepository = displayRepository;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/add")
    public ResponseEntity<?> addEvent(@RequestBody Event eventRequest) {
        if (eventRequest.getDisplayImages() == null || eventRequest.getDisplayImages().isEmpty()) {
            return ResponseEntity.badRequest().body("At least one display must be specified.");
        }

        // Check if all specified displays exist
        List<String> macAddresses = eventRequest.getDisplayImages().stream()
                .map(DisplayImage::getdisplayMac)
                .collect(Collectors.toList());

        List<Display> existingDisplays = displayRepository.findByMacAddressIn(macAddresses);

        if (existingDisplays.size() != macAddresses.size()) {
            return ResponseEntity.badRequest().body("One or more specified displays do not exist.");
        }

        // Check for overlapping events
        for (String macAddress : macAddresses) {
            List<Event> overlappingEvents = eventRepository.findOverlappingEvents(macAddress, eventRequest.getStart(), eventRequest.getEnd());
            if (!overlappingEvents.isEmpty()) {
                return ResponseEntity.badRequest().body("Event overlaps with an existing event on display: " + macAddress);
            }
        }

        // Save the event
        Event event = new Event();
        event.setTitle(eventRequest.getTitle());
        event.setAllDay(eventRequest.getAllDay());
        event.setStart(eventRequest.getStart());
        event.setEnd(eventRequest.getEnd());
        event.setDisplayImages(eventRequest.getDisplayImages());

        eventRepository.save(event);
        return ResponseEntity.ok("Event saved successfully.");
    }

    @CrossOrigin(origins = "*")
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Integer id, @RequestBody Event eventRequest) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Event event = optionalEvent.get();
        event.setTitle(eventRequest.getTitle());
        event.setAllDay(eventRequest.getAllDay());
        event.setStart(eventRequest.getStart());
        event.setEnd(eventRequest.getEnd());

        // Ensure displayImages is properly updated
        if (eventRequest.getDisplayImages() != null) {
            event.getDisplayImages().clear(); // Clear existing list to avoid duplicate issues
            event.getDisplayImages().addAll(eventRequest.getDisplayImages()); // Add updated images
        }

        eventRepository.save(event);
        return ResponseEntity.ok("Event updated successfully.");
    }

    @CrossOrigin(origins = "*")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Integer id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.ok("Event deleted successfully.");
    }

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/all")
    public @ResponseBody Iterable<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/all/{macAddress}")
    public ResponseEntity<List<Event>> getEventsForDisplay(@PathVariable String macAddress) {
        List<Event> events = eventRepository.findByDisplayMacAddress(macAddress);

        if (events.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(events);
    }
}
