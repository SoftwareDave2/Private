package master.it_projekt_tablohm.dto;

import java.time.LocalDateTime;

public class TemplateSubmissionResponseDTO {

    private Long templateId;
    private Long templateDataId;
    private LocalDateTime templateUpdatedAt;

    public TemplateSubmissionResponseDTO(Long templateId, Long templateDataId, LocalDateTime templateUpdatedAt) {
        this.templateId = templateId;
        this.templateDataId = templateDataId;
        this.templateUpdatedAt = templateUpdatedAt;
    }

    public Long getTemplateId() {
        return templateId;
    }

    public Long getTemplateDataId() {
        return templateDataId;
    }

    public LocalDateTime getTemplateUpdatedAt() {
        return templateUpdatedAt;
    }
}

