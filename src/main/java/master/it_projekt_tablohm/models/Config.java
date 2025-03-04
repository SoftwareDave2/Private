package master.it_projekt_tablohm.models;

import jakarta.persistence.*;

import java.util.Map;

@Entity // This tells Hibernate to make a table out of this class
public class Config {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    private Integer wakeIntervalDay;
    private Integer leadTime;
    private Integer followUpTime;
    private Integer deleteAfterDays;

    @ElementCollection
    @CollectionTable(name = "weekday_times", joinColumns = @JoinColumn(name = "config_id"))
    @MapKeyColumn(name = "weekday") // Store keys as "Montag", "Dienstag", etc.
    private Map<String, WeekdayTime> weekdayTimes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getWakeIntervalDay() {
        return wakeIntervalDay;
    }

    public void setWakeIntervalDay(Integer wakeIntervalDay) {
        this.wakeIntervalDay = wakeIntervalDay;
    }

    public Integer getLeadTime() {
        return leadTime;
    }

    public void setLeadTime(Integer leadTime) {
        this.leadTime = leadTime;
    }

    public Integer getFollowUpTime() {
        return followUpTime;
    }

    public void setFollowUpTime(Integer followUpTime) {
        this.followUpTime = followUpTime;
    }

    public Integer getDeleteAfterDays() {
        return deleteAfterDays;
    }

    public void setDeleteAfterDays(Integer deleteAfterDays) {
        this.deleteAfterDays = deleteAfterDays;
    }

    public Map<String, WeekdayTime> getWeekdayTimes() {
        return weekdayTimes;
    }

    public void setWeekdayTimes(Map<String, WeekdayTime> weekdayTimes) {
        this.weekdayTimes = weekdayTimes;
    }
}
