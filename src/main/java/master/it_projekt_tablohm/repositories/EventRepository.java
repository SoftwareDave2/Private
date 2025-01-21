package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Integer> {  // Corrected ID type to Integer
    List<Event> findByDisplayMacAddress(String displayMac);  // This method still works as expected
    Optional<Event> findById(Integer eventId);  // Will work for events with Integer ID

    @Query("SELECT e FROM Event e WHERE e.display.macAddress = :macAddress AND " +
            "((:start < e.end AND :end > e.start) OR " +
            " (:start <= e.start AND :end >= e.end) OR " +
            " (:start >= e.start AND :start < e.end) OR " +
            " (:end > e.start AND :end <= e.end))")
    List<Event> findOverlappingEvents(@Param("macAddress") String macAddress,
                                      @Param("start") LocalDateTime start,
                                      @Param("end") LocalDateTime end);

}
