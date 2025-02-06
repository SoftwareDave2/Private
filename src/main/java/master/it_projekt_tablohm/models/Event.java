package master.it_projekt_tablohm.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private Boolean allDay;
    private LocalDateTime start;
    private LocalDateTime end;

    @ElementCollection
    @CollectionTable(name = "event_display_images", joinColumns = @JoinColumn(name = "event_id"))
    private List<DisplayImage> displayImages = new ArrayList<>();


    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Boolean getAllDay() { return allDay; }
    public void setAllDay(Boolean allDay) { this.allDay = allDay; }

    public LocalDateTime getStart() { return start; }
    public void setStart(LocalDateTime start) { this.start = start; }

    public LocalDateTime getEnd() { return end; }
    public void setEnd(LocalDateTime end) { this.end = end; }

    public List<DisplayImage> getDisplayImages() { return displayImages; }
    public void setDisplayImages(List<DisplayImage> displayImages) { this.displayImages = displayImages; }
}
