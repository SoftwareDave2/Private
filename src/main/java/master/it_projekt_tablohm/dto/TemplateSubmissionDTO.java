package master.it_projekt_tablohm.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class TemplateSubmissionDTO {

    @Valid
    @NotNull
    private TemplateDefinitionDTO template;

    @Valid
    @NotNull
    private TemplateDisplayDataDTO displayData;

    public TemplateDefinitionDTO getTemplate() {
        return template;
    }

    public void setTemplate(TemplateDefinitionDTO template) {
        this.template = template;
    }

    public TemplateDisplayDataDTO getDisplayData() {
        return displayData;
    }

    public void setDisplayData(TemplateDisplayDataDTO displayData) {
        this.displayData = displayData;
    }
}

