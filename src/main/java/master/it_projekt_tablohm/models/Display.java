package master.it_projekt_tablohm.models;

import jakarta.persistence.*;
import org.springframework.cglib.proxy.Dispatcher;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity // This tells Hibernate to make a table out of this class
public class Display {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Integer id;
    private String macAddress;
    private String displayName;
    private String brand;
    private String model;
    private Integer width;
    private Integer height;
    private String orientation;
    private String displayType;
    private String displayTechnology;

    @ElementCollection
    @CollectionTable(name = "display_errors", joinColumns = @JoinColumn(name = "display_id"))
    private List<DisplayError> errors = new ArrayList<>();

    private Integer battery_percentage;
    private LocalDateTime timeOfBattery;

    private boolean doSwitch;
    private String filename;
    private String defaultFilename;
    private String filenameApp;

    private LocalDateTime lastSwitch;

    private LocalDateTime runningSince;
    private LocalDateTime wakeTime;
    private LocalDateTime nextEventTime;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMacAddress() {
        return macAddress;
    }

    public void setMacAddress(String macAddress) {
        this.macAddress = macAddress;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public String getOrientation() {
        return orientation;
    }

    public void setOrientation(String orientation) {
        this.orientation = orientation;
    }

    public void setDisplayType(String displayType) {this.displayType = displayType; }

    public String getDisplayType() {return displayType;}

    public void setDisplayTechnology(String displayTechnology) {this.displayTechnology = displayTechnology; }

    public String getDisplayTechnology() {return displayTechnology;}

    public List<DisplayError> getErrors() {
        return errors;
    }

    public void addError(Integer errorCode, String errorMessage) {
        // Check if error already exists before adding
        if (errors.stream().noneMatch(error -> error.getErrorCode().equals(errorCode))) {
            errors.add(new DisplayError(errorCode, errorMessage));
        }
    }

    public void removeErrorByCode(Integer errorCode) {
        errors.removeIf(error -> error.getErrorCode().equals(errorCode));
    }

    public Integer getBattery_percentage() {
        return battery_percentage;
    }

    public void setBattery_percentage(Integer battery_percentage) {
        this.battery_percentage = battery_percentage;
    }

    public LocalDateTime getTimeOfBattery() {
        return timeOfBattery;
    }

    public void setTimeOfBattery(LocalDateTime timeOfBattery) {
        this.timeOfBattery = timeOfBattery;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String image_filename) {
        this.filename = image_filename;
    }

    public String getFilenameApp() {
        return filenameApp;
    }

    public void setFilenameApp(String filenameApp) {
        this.filenameApp = filenameApp;
    }

    public LocalDateTime getLastSwitch() {
        return lastSwitch;
    }

    public void setLastSwitch(LocalDateTime lastSwitch) {
        this.lastSwitch = lastSwitch;
    }

    public LocalDateTime getRunningSince() {
        return runningSince;
    }

    public void setRunningSince(LocalDateTime runningSince) {
        this.runningSince = runningSince;
    }

    public LocalDateTime getNextEventTime() {
        return nextEventTime;
    }

    public void setNextEventTime(LocalDateTime nextEventTime) {
        this.nextEventTime = nextEventTime;
    }

    public LocalDateTime getWakeTime() {
        return wakeTime;
    }

    public void setWakeTime(LocalDateTime wakeTime) {
        this.wakeTime = wakeTime;
    }

    public boolean isDoSwitch() {
        return doSwitch;
    }

    public void setDoSwitch(boolean doSwitch) {
        this.doSwitch = doSwitch;
    }

    public String getDefaultFilename() {
        return defaultFilename;
    }

    public void setDefaultFilename(String defaultFilename) {
        this.defaultFilename = defaultFilename;
    }
}
