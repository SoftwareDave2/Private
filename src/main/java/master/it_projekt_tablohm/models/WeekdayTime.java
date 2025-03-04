package master.it_projekt_tablohm.models;

import jakarta.persistence.Embeddable;
import java.time.LocalTime;

@Embeddable
public class WeekdayTime {
    private boolean enabled;
    private LocalTime startTime;
    private LocalTime endTime;

    // Constructors
    public WeekdayTime() {}

    public WeekdayTime(boolean enabled, LocalTime startTime, LocalTime endTime) {
        this.enabled = enabled;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}

