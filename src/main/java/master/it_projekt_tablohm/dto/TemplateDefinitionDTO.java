package master.it_projekt_tablohm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TemplateDefinitionDTO {

    @NotBlank
    private String templateType;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Integer displayWidth;

    @NotNull
    private Integer displayHeight;

    @NotBlank
    private String orientation;

    @NotBlank
    private String svgContent;

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getOrientation() {
        return orientation;
    }

    public void setOrientation(String orientation) {
        this.orientation = orientation;
    }

    public String getSvgContent() {
        return svgContent;
    }

    public void setSvgContent(String svgContent) {
        this.svgContent = svgContent;
    }
}

