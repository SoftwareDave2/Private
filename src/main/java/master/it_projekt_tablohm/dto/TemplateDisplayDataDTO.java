package master.it_projekt_tablohm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class TemplateDisplayDataDTO {

    @NotBlank
    private String templateType;

    @NotBlank
    private String displayMac;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventStart;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventEnd;

    @NotNull
    private Map<String, Object> fields;

    private List<TemplateSubDataDTO> subItems;

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getDisplayMac() {
        return displayMac;
    }

    public void setDisplayMac(String displayMac) {
        this.displayMac = displayMac;
    }

    public LocalDateTime getEventStart() {
        return eventStart;
    }

    public void setEventStart(LocalDateTime eventStart) {
        this.eventStart = eventStart;
    }

    public LocalDateTime getEventEnd() {
        return eventEnd;
    }

    public void setEventEnd(LocalDateTime eventEnd) {
        this.eventEnd = eventEnd;
    }

    public Map<String, Object> getFields() {
        return fields;
    }

    public void setFields(Map<String, Object> fields) {
        this.fields = fields;
    }

    public List<TemplateSubDataDTO> getSubItems() {
        return subItems;
    }

    public void setSubItems(List<TemplateSubDataDTO> subItems) {
        this.subItems = subItems;
    }
}

