package master.it_projekt_tablohm.models;

import jakarta.persistence.*;
import master.it_projekt_tablohm.helper.MapToJsonConverter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(
        name = "display_template_data",
        uniqueConstraints = @UniqueConstraint(columnNames = {"display_mac", "template_type_id"})
)
public class DisplayTemplateData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id")
    private DisplayTemplate template;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_type_id")
    private TemplateType templateTypeEntity;

    @Column(name = "display_mac", nullable = false)
    private String displayMac;

    private LocalDateTime eventStart;

    private LocalDateTime eventEnd;

    @Convert(converter = MapToJsonConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    private Map<String, Object> fields;

    private String renderedImageFilename;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "templateData", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DisplayTemplateSubData> subItems = new ArrayList<>();

    @PrePersist
    void onCreate() {
        var now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public DisplayTemplate getTemplate() {
        return template;
    }

    public void setTemplate(DisplayTemplate template) {
        this.template = template;
    }

    public TemplateType getTemplateTypeEntity() {
        return templateTypeEntity;
    }

    public void setTemplateTypeEntity(TemplateType templateTypeEntity) {
        this.templateTypeEntity = templateTypeEntity;
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

    public String getRenderedImageFilename() {
        return renderedImageFilename;
    }

    public void setRenderedImageFilename(String renderedImageFilename) {
        this.renderedImageFilename = renderedImageFilename;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<DisplayTemplateSubData> getSubItems() {
        return subItems;
    }

    public void setSubItems(List<DisplayTemplateSubData> subItems) {
        this.subItems = subItems;
    }
}
