package master.it_projekt_tablohm.models;

import jakarta.persistence.Embeddable;

@Embeddable
public class DisplayImage {
    private String displayMac;
    private String image;

    // Constructors
    public DisplayImage() {}

    public DisplayImage(String displayMac, String image) {
        this.displayMac = displayMac;
        this.image = image;
    }

    // Getters and Setters
    public String getdisplayMac() {
        return displayMac;
    }

    public void setdisplayMac(String displayMac) {
        this.displayMac = displayMac;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
