package master.it_projekt_tablohm.dto;

public class TemplateTypeDTO {
    private String key;
    private String label;
    private Integer displayWidth;
    private Integer displayHeight;

    public TemplateTypeDTO(String key, String label, Integer displayWidth, Integer displayHeight) {
        this.key = key;
        this.label = label;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
    }

    public TemplateTypeDTO() {
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Integer getDisplayWidth() {
        return displayWidth;
    }

    public void setDisplayWidth(Integer displayWidth) {
        this.displayWidth = displayWidth;
    }

    public Integer getDisplayHeight() {
        return displayHeight;
    }

    public void setDisplayHeight(Integer displayHeight) {
        this.displayHeight = displayHeight;
    }
}
