package master.it_projekt_tablohm.dto;

import java.time.LocalDateTime;

public class RecEventDTO {
    private String groupId;
    private LocalDateTime start;
    private String rrule;

    public RecEventDTO(String groupId, LocalDateTime start, String rrule) {
        this.groupId = groupId;
        this.start = start;
        this.rrule = rrule;
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
