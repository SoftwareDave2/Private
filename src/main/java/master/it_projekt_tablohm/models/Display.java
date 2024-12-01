package master.it_projekt_tablohm.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity // This tells Hibernate to make a table out of this class
public class Display {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Integer id;
    private String macAddress;
    private String brand;
    private String model;
    private Integer width;
    private Integer height;
    private String orientation;
    private String filename;

    private LocalDateTime wakeTime;

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

    public String getFilename() {
        return filename;
    }

    public void setFilename(String image_filename) {
        this.filename = image_filename;
    }

    public LocalDateTime getWakeTime() {
        return wakeTime;
    }

    public void setWakeTime(LocalDateTime wakeTime) {
        this.wakeTime = wakeTime;
    }
}
