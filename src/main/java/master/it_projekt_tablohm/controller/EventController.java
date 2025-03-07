package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.models.DisplayImage;
import master.it_projekt_tablohm.repositories.EventRepository;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.services.ErrorService;
import org.dmfs.rfc5545.DateTime;
import org.dmfs.rfc5545.recur.InvalidRecurrenceRuleException;
import org.dmfs.rfc5545.recur.RecurrenceRule;
import org.dmfs.rfc5545.recur.RecurrenceRuleIterator;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/event")
public class EventController {
    private final EventRepository eventRepository;
    private final DisplayRepository displayRepository;
    private final ErrorService errorService;

    public EventController(EventRepository eventRepository, DisplayRepository displayRepository, ErrorService errorService) {
        this.eventRepository = eventRepository;
        this.displayRepository = displayRepository;
        this.errorService = errorService;
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

        // Check if event is before wakeTime of displays
        Boolean warning = false;
        Display collisionDisplay = null;
        for (Display display : existingDisplays) {
            LocalDateTime wakeTime = display.getWakeTime(); // Assuming wakeTime is LocalTime
            LocalDateTime eventStart = eventRequest.getStart();

            // Convert eventStart to LocalTime for comparison (assuming same time zone)
            if (wakeTime != null && eventStart.isBefore(wakeTime)) {
                warning = true;
                collisionDisplay = display;
            }
        }


        // Save the event
        Event event = new Event();
        event.setTitle(eventRequest.getTitle());
        event.setAllDay(eventRequest.getAllDay());
        event.setStart(eventRequest.getStart());
        event.setDisplayImages(eventRequest.getDisplayImages());

        // Adjust the all day end time
        if (eventRequest.getAllDay()){
            event.setEnd(eventRequest.getEnd().plusHours(23).plusMinutes(59).plusSeconds(59));
        }else{
            event.setEnd(eventRequest.getEnd());
        }

        eventRepository.save(event);

        // Update the display's nextEventTime if necessary
        for (Display display : existingDisplays) {
            LocalDateTime nextEventTime = display.getNextEventTime();

            // If nextEventTime is null or after the current event's start time, update nextEventTime
            if (nextEventTime == null || nextEventTime.isAfter(eventRequest.getStart())) {
                display.setNextEventTime(eventRequest.getStart());
                displayRepository.save(display);
            }
        }

        if(warning) {
            return ResponseEntity.status(HttpStatusCode.valueOf(541)).body("Event saved, but the start time is before the wake time of display: " + collisionDisplay.getMacAddress());

        }else{
            return ResponseEntity.ok("Event saved successfully.");
        }
    }

    @CrossOrigin(origins = "*")
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Integer id, @RequestBody Event eventRequest) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isEmpty()) {
            return ResponseEntity.notFound().build();
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

        // Check if event is before wakeTime of displays
        boolean warning = false;
        Display collisionDisplay = null;
        for (Display display : existingDisplays) {
            LocalDateTime wakeTime = display.getWakeTime(); // Assuming wakeTime is LocalTime
            LocalDateTime eventStart = eventRequest.getStart();

            // Convert eventStart to LocalTime for comparison (assuming same time zone)
            if (wakeTime != null && eventStart.isBefore(wakeTime)) {
                warning = true;
                collisionDisplay = display;
            }
        }

        Event event = optionalEvent.get();
        event.setTitle(eventRequest.getTitle());
        event.setAllDay(eventRequest.getAllDay());
        event.setStart(eventRequest.getStart());
        // Adjust the all day end time
        if (eventRequest.getAllDay()){
            event.setEnd(eventRequest.getEnd().plusHours(23).plusMinutes(59).plusSeconds(59));
        }else{
            event.setEnd(eventRequest.getEnd());
        }


        // Ensure displayImages is properly updated
        if (eventRequest.getDisplayImages() != null) {
            event.getDisplayImages().clear(); // Clear existing list to avoid duplicate issues
            event.getDisplayImages().addAll(eventRequest.getDisplayImages()); // Add updated images
        }

        eventRepository.save(event);

        // Update the display's nextEventTime if necessary
        for (Display display : existingDisplays) {
            LocalDateTime nextEventTime = display.getNextEventTime();

            // If nextEventTime is null or after the current event's start time, update nextEventTime
            if (nextEventTime == null || nextEventTime.isAfter(eventRequest.getStart())) {
                display.setNextEventTime(eventRequest.getStart());
                displayRepository.save(display);
            }
        }

        if(warning) {
            return ResponseEntity.status(HttpStatusCode.valueOf(541)).body("Event saved, but the start time is before the wake time of display: " + collisionDisplay.getMacAddress());

        }else{
            return ResponseEntity.ok("Event saved successfully.");
        }
    }

    @CrossOrigin(origins = "*")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Integer id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Event event = eventRepository.findById(id).get();
        // if event gets deleted while it should be active -> remove errors from display, that the event is not getting displayed
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime eventStart = event.getStart();
        LocalDateTime eventEnd = event.getEnd();
        if (now.isAfter(eventStart) && now.isBefore(eventEnd)) {
            // only the if event should currently take place
            List<DisplayImage> displayImages = event.getDisplayImages();
            for (DisplayImage displayImage : displayImages) {
                Optional<Display> displayOptional = displayRepository.findByMacAddress(displayImage.getdisplayMac());
                if (displayOptional.isPresent()) {
                    Display display = displayOptional.get();
                    errorService.removeErrorFromDisplay(display.getId(), 101);
                }

            }

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
