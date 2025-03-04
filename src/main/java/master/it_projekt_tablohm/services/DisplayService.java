package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.DisplayImage;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DisplayService {

    private final DisplayRepository displayRepository;
    private final EventRepository eventRepository; // Repository for events

    public DisplayService(DisplayRepository displayRepository, EventRepository eventRepository) {
        this.displayRepository = displayRepository;
        this.eventRepository = eventRepository;
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

                        // Check if the lastSwitch time is within 5 minutes of the event start time
                        if (lastSwitch != null && eventStart.isBefore(lastSwitch.plusMinutes(1)) && eventStart.isAfter(lastSwitch.minusMinutes(5))) {
                            // If it's within 5 minutes before or after the event start time
                            // (meaning the display is correctly updated)
                            display.setError(null);
                        } else {
                            // If it's not within the tolerance window
                            display.setError("Failed to update for event " + event.getTitle());
                        }
                    }
                }
            }
        }


    }
}
