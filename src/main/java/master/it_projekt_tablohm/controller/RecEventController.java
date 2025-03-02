package master.it_projekt_tablohm.controller;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.dto.RecEventDTO;
import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.DisplayImage;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.models.RecEvent;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
import master.it_projekt_tablohm.repositories.RecEventRepository;
import org.dmfs.rfc5545.DateTime;
import org.dmfs.rfc5545.recur.RecurrenceRule;
import org.dmfs.rfc5545.recur.RecurrenceRuleIterator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.time.Instant;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/recevent")
public class RecEventController {

    private final RecEventRepository recEventRepository;
    private final EventRepository eventRepository;
    private final DisplayRepository displayRepository;

    public RecEventController(RecEventRepository recEventRepository, EventRepository eventRepository, DisplayRepository displayRepository) {
        this.recEventRepository = recEventRepository;
        this.eventRepository = eventRepository;
        this.displayRepository = displayRepository;
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

        ResponseEntity<?> response = generateEvents(recEventRequest);

        if (!response.getStatusCode().is2xxSuccessful()) {
            return response; // Return conflicts if found
        }

        // Save events if no conflicts
        List<Event> generatedEvents = (List<Event>) response.getBody();
        eventRepository.saveAll(generatedEvents);

        return ResponseEntity.ok("Recurring event added with group ID: " + groupId);
    }


    @GetMapping("/all")
    public ResponseEntity<List<RecEventDTO>> getAllRecEvents() {
        List<RecEvent> recEvents = recEventRepository.findAll();

        List<RecEventDTO> response = recEvents.stream().map(event ->
                new RecEventDTO(event.getTitle(), event.getGroupId(), event.getStart(), event.getRrule())
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


    private ResponseEntity<?> generateEvents(RecEvent recEvent) {
        List<Event> eventList = new ArrayList<>();
        Map<String, List<Event>> conflictMap = new HashMap<>();

        try {
            long startMillis = recEvent.getStart().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
            DateTime start = new DateTime(startMillis);
            String title = recEvent.getTitle();

            RecurrenceRule rule = new RecurrenceRule(recEvent.getRrule());
            RecurrenceRuleIterator it = rule.iterator(start);

            int maxInstances = 100;
            while (it.hasNext() && maxInstances-- > 0) {
                DateTime nextInstance = it.nextDateTime();

                LocalDateTime nextEventStart = Instant.ofEpochMilli(nextInstance.getTimestamp())
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();

                long durationMinutes = java.time.Duration.between(recEvent.getStart(), recEvent.getEnd()).toMinutes();
                LocalDateTime nextEventEnd = nextEventStart.plusMinutes(durationMinutes);

                Event event = new Event();
                event.setTitle(title);
                event.setAllDay(false);
                event.setStart(nextEventStart);
                event.setEnd(nextEventEnd);
                event.setGroupId(recEvent.getGroupId());
                event.setDisplayImages(new ArrayList<>(recEvent.getDisplayImages()));

                List<String> macAddresses = event.getDisplayImages().stream()
                        .map(DisplayImage::getdisplayMac)
                        .collect(Collectors.toList());

                List<Display> existingDisplays = displayRepository.findByMacAddressIn(macAddresses);
                if (existingDisplays.size() != macAddresses.size()) {
                    return ResponseEntity.badRequest().body("One or more specified displays do not exist.");
                }

                for (String macAddress : macAddresses) {
                    List<Event> overlappingEvents = eventRepository.findOverlappingEvents(macAddress, event.getStart(), event.getEnd());

                    if (!overlappingEvents.isEmpty()) {
                        conflictMap.putIfAbsent(macAddress, new ArrayList<>());
                        conflictMap.get(macAddress).addAll(overlappingEvents);
                    }
                }

                eventList.add(event);
            }

            if (!conflictMap.isEmpty()) {
                StringBuilder conflictMessage = new StringBuilder("Event conflicts detected:\n");

                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("H:mm");

                for (Map.Entry<String, List<Event>> entry : conflictMap.entrySet()) {
                    String macAddress = entry.getKey();
                    conflictMessage.append("Display ").append(macAddress).append(":\n");

                    for (Event overlap : entry.getValue()) {
                        String startDate = overlap.getStart().format(dateFormatter);
                        String endDate = overlap.getEnd().format(dateFormatter);
                        String startTime = overlap.getStart().format(timeFormatter);
                        String endTime = overlap.getEnd().format(timeFormatter);

                        if (startDate.equals(endDate)) {
                            conflictMessage.append("- ").append(overlap.getTitle())
                                    .append(" (").append(startDate).append(" ").append(startTime).append("-").append(endTime).append(")\n");
                        } else {
                            conflictMessage.append("- ").append(overlap.getTitle())
                                    .append(" (").append(startDate).append(" ").append(startTime)
                                    .append(" - ").append(endDate).append(" ").append(endTime).append(")\n");
                        }
                    }
                }

                return ResponseEntity.badRequest().body(conflictMessage.toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while generating events.");
        }

        return ResponseEntity.ok(eventList);
    }



}
