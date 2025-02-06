package master.it_projekt_tablohm.controller;

import com.sun.jdi.request.EventRequest;
import master.it_projekt_tablohm.dto.DisplayImageDTO;
import master.it_projekt_tablohm.dto.EventRequestDTO;
import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Controller
@RequestMapping(path = "/event")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private DisplayRepository displayRepository;

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/add")
    public @ResponseBody ResponseEntity<String> addEvent(@RequestBody EventRequestDTO eventRequest) {
        String title = eventRequest.getTitle();
        Boolean allDay = eventRequest.getAllDay();
        String start = eventRequest.getStart();
        String end = eventRequest.getEnd();
        List<DisplayImageDTO> displayImages = eventRequest.getDisplayImages();

        if (title == null || start == null || end == null || displayImages == null || displayImages.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing required fields.");
        }

        if (!start.contains("T")) {
            start += "T00:00:00";
        }
        if (!end.contains("T")) {
            end += "T23:59:59";
        }
        LocalDateTime startDt = LocalDateTime.parse(start);
        LocalDateTime endDt = LocalDateTime.parse(end);

        // Generate a unique group ID for all events in this request
        String groupId = UUID.randomUUID().toString();

        for (DisplayImageDTO displayImage : displayImages) {
            String displayMac = displayImage.getDisplayMac();
            Optional<Display> displayOpt = displayRepository.findByMacAddress(displayMac);

            if (!displayOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Display with MAC " + displayMac + " not found. Event not saved.");
            }

            List<Event> overlappingEvents = eventRepository.findOverlappingEvents(displayMac, startDt, endDt);
            if (!overlappingEvents.isEmpty()) {
                return ResponseEntity.status(569).body("Event time collides for display " + displayMac + ". Event not saved.");
            }
        }

        // Save events with the same group ID
        for (DisplayImageDTO displayImage : displayImages) {
            Display display = displayRepository.findByMacAddress(displayImage.getDisplayMac()).get();
            Event event = new Event();
            event.setTitle(title);
            event.setAllDay(allDay);
            event.setStart(startDt);
            event.setEnd(endDt);
            event.setDisplay(display);
            event.setImage(displayImage.getImage());
            event.setGroupId(groupId); // Assign the same groupId to all events

            eventRepository.save(event);
        }

        return ResponseEntity.ok("Event added successfully for all displays.");
    }




    @CrossOrigin(origins = "*")
    @GetMapping(path = "/all/{displayMac}")
    public @ResponseBody ResponseEntity<List<Event>> getEventsByDisplay(@PathVariable String displayMac) {
        List<Event> events = eventRepository.findByDisplayMacAddress(displayMac);
        return ResponseEntity.ok(events);
    }

    @PutMapping(path = "/update/{groupId}")
    public @ResponseBody ResponseEntity<String> updateEventGroup(
            @PathVariable String groupId,
            @RequestBody EventRequestDTO eventRequest) {

        List<Event> events = eventRepository.findByGroupId(groupId);
        if (events.isEmpty()) {
            return ResponseEntity.badRequest().body("No events found for group ID " + groupId);
        }

        for (Event event : events) {
            event.setTitle(eventRequest.getTitle());
            event.setAllDay(eventRequest.getAllDay());
            event.setStart(LocalDateTime.parse(eventRequest.getStart()));
            event.setEnd(LocalDateTime.parse(eventRequest.getEnd()));

            // Update images per display
            for (DisplayImageDTO displayImage : eventRequest.getDisplayImages()) {  // Corrected method name
                if (event.getDisplay().getMacAddress().equals(displayImage.getDisplayMac())) {  // Corrected method name
                    event.setImage(displayImage.getImage());
                }
            }
        }

        eventRepository.saveAll(events);
        return ResponseEntity.ok("Event group updated successfully.");
    }


    @DeleteMapping(path = "/delete/{groupId}")
    public @ResponseBody ResponseEntity<String> deleteEventGroup(@PathVariable String groupId) {
        List<Event> events = eventRepository.findByGroupId(groupId);
        if (events.isEmpty()) {
            return ResponseEntity.badRequest().body("No events found for group ID " + groupId);
        }

        eventRepository.deleteAll(events);
        return ResponseEntity.ok("Event group deleted successfully.");
    }



    @CrossOrigin(origins = "*")
    @GetMapping(path = "/all")
    public @ResponseBody Iterable<Event> getAllEvents() {
        return eventRepository.findAll();
    }
}

