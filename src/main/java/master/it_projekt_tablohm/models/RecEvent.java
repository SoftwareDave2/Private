package master.it_projekt_tablohm.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class RecEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private LocalDateTime start;
    private LocalDateTime end;
    private String rrule;
    private String groupId; // Used to track events generated from this recurrence rule

    @ElementCollection
    @CollectionTable(name = "recevent_display_images", joinColumns = @JoinColumn(name = "recevent_id"))
    private List<DisplayImage> displayImages = new ArrayList<>();

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() {
        return title;
    }

    public void setTitle(String eventTitle) {
        this.title = eventTitle;
    }

    public LocalDateTime getStart() { return start; }
    public void setStart(LocalDateTime start) { this.start = start; }

    public LocalDateTime getEnd() { return end; }
    public void setEnd(LocalDateTime end) { this.end = end; }

    public String getRrule() { return rrule; }
    public void setRrule(String rrule) { this.rrule = rrule; }

    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }

    public List<DisplayImage> getDisplayImages() {
        return displayImages;
    }

    public void setDisplayImages(List<DisplayImage> displayImages) {
        this.displayImages = displayImages;
    }
}
