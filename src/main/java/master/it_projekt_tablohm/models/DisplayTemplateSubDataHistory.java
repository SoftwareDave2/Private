package master.it_projekt_tablohm.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "display_template_sub_data_history",
        indexes = {
                @Index(name = "idx_history_template_type", columnList = "template_type_key"),
                @Index(name = "idx_history_display_mac", columnList = "display_mac"),
                @Index(name = "idx_history_expired_at", columnList = "expired_at")
        })
public class DisplayTemplateSubDataHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_type_key", nullable = false)
    private String templateTypeKey;

    @Column(name = "display_mac", nullable = false)
    private String displayMac;

    private Integer positionIndex;

    private String title;

    private LocalDateTime start;

    private LocalDateTime end;

    private Boolean highlighted;

    private Boolean busy;

    private String qrCodeUrl;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @PrePersist
    void onCreate() {
        this.expiredAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTemplateTypeKey() {
        return templateTypeKey;
    }

    public void setTemplateTypeKey(String templateTypeKey) {
        this.templateTypeKey = templateTypeKey;
    }

    public String getDisplayMac() {
        return displayMac;
    }

    public void setDisplayMac(String displayMac) {
        this.displayMac = displayMac;
    }

    public Integer getPositionIndex() {
        return positionIndex;
    }

    public void setPositionIndex(Integer positionIndex) {
        this.positionIndex = positionIndex;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getStart() {
        return start;
    }

    public void setStart(LocalDateTime start) {
        this.start = start;
    }

    public LocalDateTime getEnd() {
        return end;
    }

    public void setEnd(LocalDateTime end) {
        this.end = end;
    }

    public Boolean getHighlighted() {
        return highlighted;
    }

    public void setHighlighted(Boolean highlighted) {
        this.highlighted = highlighted;
    }

    public Boolean getBusy() {
        return busy;
    }

    public void setBusy(Boolean busy) {
        this.busy = busy;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public LocalDateTime getExpiredAt() {
        return expiredAt;
    }
}
