package master.it_projekt_tablohm.dto;

public class DisplayImageDTO {
    private String displayMac;
    private String image;

    // Constructors
    public DisplayImageDTO() {}

    public DisplayImageDTO(String displayMac, String image) {
        this.displayMac = displayMac;
        this.image = image;
    }

    // Getters and Setters
    public String getDisplayMac() {
        return displayMac;
    }

    public void setDisplayMac(String displayMac) {
        this.displayMac = displayMac;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
