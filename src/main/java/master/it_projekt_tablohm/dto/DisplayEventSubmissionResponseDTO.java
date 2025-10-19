package master.it_projekt_tablohm.dto;

import java.time.LocalDateTime;

public class DisplayEventSubmissionResponseDTO {

    private final Long templateId;
    private final Long templateDataId;
    private final LocalDateTime templateUpdatedAt;

    public DisplayEventSubmissionResponseDTO(Long templateId, Long templateDataId, LocalDateTime templateUpdatedAt) {
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
