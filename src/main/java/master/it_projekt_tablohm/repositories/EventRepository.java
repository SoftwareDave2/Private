package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Integer> {  // Corrected ID type to Integer
    List<Event> findByDisplayMacAddress(String displayMac);  // This method still works as expected
    Optional<Event> findById(Integer eventId);  // Will work for events with Integer ID
}
