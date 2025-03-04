package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.models.Event;
import master.it_projekt_tablohm.repositories.EventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {
    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Scheduled(fixedRate = 3600000*24)
    public void deleteOldEvents() {
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
            if(event.getEnd().plusDays(7).isBefore(LocalDateTime.now())){
                eventRepository.delete(event);
            }
        }
    }
}
