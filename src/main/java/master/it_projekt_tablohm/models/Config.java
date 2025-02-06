package master.it_projekt_tablohm.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity // This tells Hibernate to make a table out of this class
public class Config {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    private Integer wakeIntervalDay;
    private Integer wakeIntervalNight;
    private Integer leadTime;
    private Integer followUpTime;
    private Integer deleteAfterDays;

    public Integer getWakeIntervalDay() {
        return wakeIntervalDay;
    }

    public void setWakeIntervalDay(Integer wakeIntervalDay) {
        this.wakeIntervalDay = wakeIntervalDay;
    }

    public Integer getWakeIntervalNight() {
        return wakeIntervalNight;
    }

    public void setWakeIntervalNight(Integer wakeIntervalNight) {
        this.wakeIntervalNight = wakeIntervalNight;
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
}
