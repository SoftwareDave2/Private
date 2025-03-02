package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DisplayService {

    private final DisplayRepository displayRepository;
    private final EventRepository eventRepository; // Repository for events

    public DisplayService(DisplayRepository displayRepository, EventRepository eventRepository) {
        this.displayRepository = displayRepository;
        this.eventRepository = eventRepository;
    }

    // Scheduled method to check display's lastSwitch time every 5 minutes
    @Scheduled(fixedRate = 6000)  // 300000 milliseconds = 5 minutes
    public void checkDisplayStatus() {
        System.out.println("Display service running!");
        List<Event> events = eventRepository.findAll();  // Retrieve all events
        List<Display> displays = (List<Display>) displayRepository.findAll();  // Retrieve all displays

        for (Event event : events) {
            LocalDateTime eventStart = event.getStart();
            for (Display display : displays) {
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
