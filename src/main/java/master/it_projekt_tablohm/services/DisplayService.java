package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.DisplayError;
import master.it_projekt_tablohm.models.DisplayImage;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DisplayService {
    private static final Logger logger = LoggerFactory.getLogger(DisplayService.class);
    private final DisplayRepository displayRepository;
    private final EventRepository eventRepository; // Repository for events
    private final ErrorService errorService;

    public DisplayService(DisplayRepository displayRepository, EventRepository eventRepository, ErrorService errorService) {
        this.displayRepository = displayRepository;
        this.eventRepository = eventRepository;
        this.errorService = errorService;
    }

    // Scheduled method to check display's lastSwitch time every 5 minutes
    @Transactional
    @Scheduled(fixedRate = 6000)  // 300000 milliseconds = 5 minutes
    public void checkDisplayStatus() {
        List<Event> events = eventRepository.findAll(); // Retrieve all events

        LocalDateTime now = LocalDateTime.now();

        for (Event event : events) {
            LocalDateTime eventStart = event.getStart();
            LocalDateTime eventEnd = event.getEnd(); // Assuming Event has an 'end' field

            if (now.isAfter(eventStart) && now.isBefore(eventEnd)) {

                List<DisplayImage> displayImages = event.getDisplayImages();
                for (DisplayImage displayImage : displayImages) {
                    Optional<Display> displayOptional = displayRepository.findByMacAddress(displayImage.getdisplayMac());
                    if (displayOptional.isPresent()) {
                        Display display = displayOptional.get();
                        LocalDateTime lastSwitch = display.getLastSwitch();


                        if (lastSwitch != null && eventStart.isBefore(lastSwitch) && eventEnd.isAfter(lastSwitch)) {
                            errorService.removeErrorFromDisplay(display.getId(), 101);
                        } else {
                            DisplayError error = new DisplayError(101, "Event not Updated");
                            display.addError(error.getErrorCode(), error.getErrorMessage());
                            displayRepository.save(display);
                        }
                    }
                }
            }
        }


    }

    // Scheduled method to check display's nextEvent time every 5 minutes
    @Transactional
    @Scheduled(fixedRate = 6000)  // 6000 milliseconds = 6 seconds (this should be adjusted to your need)
    public void checkDisplayNextEvent() {
        List<Display> displays = (List<Display>) displayRepository.findAll();  // Retrieve all displays

        LocalDateTime now = LocalDateTime.now();

        for (Display display : displays) {
            LocalDateTime nextEventTime = display.getNextEventTime();

            // Check if the nextEventTime is null or if it's within the next 20 minutes
            if (nextEventTime != null) {
                if (now.isAfter(nextEventTime.plusMinutes(10))) {
                    // Retrieve the next event for the display after the current time
                    List<Event> upcomingEvents = eventRepository.findUpcomingEventsForDisplay(display.getMacAddress(), now);

                    if (!upcomingEvents.isEmpty()) {
                        Event nextEvent = upcomingEvents.get(0);  // Get the first upcoming event for this display
                        LocalDateTime nextEventStartTime = nextEvent.getStart();

                        // Log or handle the start time of the next event
                        //logger.info("Next event for display {} starts at {}", display.getMacAddress(), nextEventStartTime);

                        // Optionally, save this information or update something on the display
                        display.setNextEventTime(nextEventStartTime); // If you want to update the nextEventTime
                        displayRepository.save(display);
                    }
                }
            }
        }
    }
}
