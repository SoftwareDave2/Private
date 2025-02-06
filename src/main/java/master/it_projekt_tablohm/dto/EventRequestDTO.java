package master.it_projekt_tablohm.dto;

import java.util.List;

public class EventRequestDTO {
    private String title;
    private Boolean allDay;
    private String start;
    private String end;
    private List<DisplayImageDTO> displayImages;

    // Constructors
    public EventRequestDTO() {}

    public EventRequestDTO(String title, Boolean allDay, String start, String end, List<DisplayImageDTO> displayImages) {
        this.title = title;
        this.allDay = allDay;
        this.start = start;
        this.end = end;
        this.displayImages = displayImages;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Boolean getAllDay() {
        return allDay;
    }

    public void setAllDay(Boolean allDay) {
        this.allDay = allDay;
    }

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getEnd() {
        return end;
    }

    public void setEnd(String end) {
        this.end = end;
    }

    public List<DisplayImageDTO> getDisplayImages() {
        return displayImages;
    }

    public void setDisplayImages(List<DisplayImageDTO> displayImages) {
        this.displayImages = displayImages;
    }


}
