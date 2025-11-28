package master.it_projekt_tablohm.models;

import jakarta.persistence.*;

@Entity
@Table(name = "template_type")
public class TemplateType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_key", nullable = false, unique = true)
    private String typeKey;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private Integer displayWidth;

    @Column(nullable = false)
    private Integer displayHeight;

    public Long getId() {
        return id;
    }

    public String getTypeKey() {
        return typeKey;
    }

    public void setTypeKey(String typeKey) {
        this.typeKey = typeKey;
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
