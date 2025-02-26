package master.it_projekt_tablohm.dto;

import java.time.LocalDateTime;

public class RecEventDTO {
    private String eventTitle;
    private String groupId;
    private LocalDateTime start;
    private String rrule;

    public RecEventDTO(String eventTitle, String groupId, LocalDateTime start, String rrule) {
        this.eventTitle = eventTitle;
        this.groupId = groupId;
        this.start = start;
        this.rrule = rrule;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public String getGroupId() {
        return groupId;
    }

    public LocalDateTime getStart() {
        return start;
    }

    public String getRrule() {
        return rrule;
    }
}
