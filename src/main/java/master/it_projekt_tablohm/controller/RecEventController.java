package master.it_projekt_tablohm.controller;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.dto.RecEventDTO;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.models.RecEvent;
import master.it_projekt_tablohm.repositories.EventRepository;
import master.it_projekt_tablohm.repositories.RecEventRepository;
import org.dmfs.rfc5545.DateTime;
import org.dmfs.rfc5545.recur.RecurrenceRule;
import org.dmfs.rfc5545.recur.RecurrenceRuleIterator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.Instant;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/recevent")
public class RecEventController {

    private final RecEventRepository recEventRepository;
    private final EventRepository eventRepository;

    public RecEventController(RecEventRepository recEventRepository, EventRepository eventRepository) {
        this.recEventRepository = recEventRepository;
        this.eventRepository = eventRepository;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addRecEvent(@RequestBody RecEvent recEventRequest) {
        if (recEventRequest.getRrule() == null || recEventRequest.getStart() == null || recEventRequest.getEnd() == null) {
            return ResponseEntity.badRequest().body("Start time, end time, and rrule must be provided.");
        }

        // Generate a unique groupId for this recurrence rule
        String groupId = UUID.randomUUID().toString();
        recEventRequest.setGroupId(groupId);
        recEventRepository.save(recEventRequest);

        // Generate individual events based on the recurrence rule
        List<Event> generatedEvents = generateEvents(recEventRequest);
        eventRepository.saveAll(generatedEvents);

        return ResponseEntity.ok("Recurring event added with group ID: " + groupId);
    }

    @GetMapping("/all")
    public ResponseEntity<List<RecEventDTO>> getAllRecEvents() {
        List<RecEvent> recEvents = recEventRepository.findAll();

        List<RecEventDTO> response = recEvents.stream().map(event ->
                new RecEventDTO(event.getGroupId(), event.getStart(), event.getRrule())
        ).toList();

        return ResponseEntity.ok(response);
    }

    @Transactional
    @DeleteMapping("/delete/{groupId}")
    public ResponseEntity<?> deleteRecEvent(@PathVariable String groupId) {
        List<Event> eventsToDelete = eventRepository.findByGroupId(groupId);
        if (eventsToDelete.isEmpty()) {
            return ResponseEntity.badRequest().body("No events found for group ID: " + groupId);
        }

        eventRepository.deleteAll(eventsToDelete);
        recEventRepository.deleteByGroupId(groupId);

        return ResponseEntity.ok("Recurring events deleted successfully.");
    }


    private List<Event> generateEvents(RecEvent recEvent) {
        List<Event> eventList = new ArrayList<>();

        try {
            // Convert LocalDateTime to RFC5545 DateTime (lib-recur uses timestamps)
            long startMillis = recEvent.getStart().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
            DateTime start = new DateTime(startMillis);

            // Parse RRULE and generate event occurrences
            RecurrenceRule rule = new RecurrenceRule(recEvent.getRrule());
            RecurrenceRuleIterator it = rule.iterator(start);

            int maxInstances = 100; // Prevent infinite loops
            while (it.hasNext() && maxInstances-- > 0) {
                DateTime nextInstance = it.nextDateTime();

                // Convert DateTime to LocalDateTime using system default timezone
                LocalDateTime nextEventStart = Instant.ofEpochMilli(nextInstance.getTimestamp())
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();

                // Calculate event duration
                long durationMinutes = java.time.Duration.between(recEvent.getStart(), recEvent.getEnd()).toMinutes();
                LocalDateTime nextEventEnd = nextEventStart.plusMinutes(durationMinutes);

                // Create Event object
                Event event = new Event();
                event.setTitle("Generated Event");
                event.setAllDay(false);
                event.setStart(nextEventStart);
                event.setEnd(nextEventEnd);
                event.setGroupId(recEvent.getGroupId()); // Ensure group ID is assigned
                event.setDisplayImages(new ArrayList<>(recEvent.getDisplayImages()));



                eventList.add(event);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return eventList;
    }

}
