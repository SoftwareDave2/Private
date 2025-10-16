package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.dto.TemplateDisplayDataDTO;
import master.it_projekt_tablohm.dto.TemplateSubDataDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class TemplateDefaultContentProvider {

    public TemplateDisplayDataDTO createDefaultDisplayData(String templateType, String displayMac) {
        TemplateDisplayDataDTO dto = new TemplateDisplayDataDTO();
        dto.setTemplateType(templateType);
        dto.setDisplayMac(displayMac);
        dto.setFields(buildDefaultFields(templateType));
        dto.setSubItems(buildDefaultSubItems(templateType));
        dto.setEventStart(null);
        dto.setEventEnd(null);
        return dto;
    }

    private Map<String, Object> buildDefaultFields(String templateType) {
        Map<String, Object> fields = new HashMap<>();
        switch (templateType) {
            case "door-sign" -> {
                fields.put("roomNumber", "-");
                fields.put("footerNote", "Raumzuweisung verfügbar.");
            }
            case "event-board" -> {
                fields.put("title", "Ereignisse");
                fields.put("description", "Derzeit gibt es keine anstehenden Ereignisse");
            }
            case "notice-board" -> {
                fields.put("title", "Keine Hinweise");
                fields.put("body", "Es liegen derzeit keine Meldungen vor.");
                fields.put("start", "");
                fields.put("end", "");
            }
            case "room-booking" -> {
                fields.put("roomNumber", "–");
                fields.put("roomType", "Keine Buchungen");
            }
            default -> fields.put("message", "Kein Inhalt verfügbar.");
        }
        return fields;
    }

    private List<TemplateSubDataDTO> buildDefaultSubItems(String templateType) {
        List<TemplateSubDataDTO> subItems = new ArrayList<>();
        if ("door-sign".equals(templateType)) {
            addPerson(subItems, "Aktuell frei", null, null, false, null);
        } else if ("event-board".equals(templateType)) {
            addSubItem(subItems, "Keine Ereignisse", null, null, false, null, null);
        } else if ("room-booking".equals(templateType)) {
            addSubItem(subItems, "Keine Termine", null, null, false, null, null);
        }
        return subItems;
    }

    private void addPerson(List<TemplateSubDataDTO> subItems,
                           String title,
                           LocalDateTime start,
                           LocalDateTime end,
                           boolean highlighted,
                           String notes) {
        TemplateSubDataDTO sub = new TemplateSubDataDTO();
        sub.setTitle(title);
        sub.setStart(start);
        sub.setEnd(end);
        sub.setHighlighted(highlighted);
        sub.setNotes(notes);
        subItems.add(sub);
    }

    private void addSubItem(List<TemplateSubDataDTO> subItems,
                            String title,
                            LocalDateTime start,
                            LocalDateTime end,
                            boolean highlighted,
                            String notes,
                            String qrLink) {
        TemplateSubDataDTO sub = new TemplateSubDataDTO();
        sub.setTitle(title);
        sub.setStart(start);
        sub.setEnd(end);
        sub.setHighlighted(highlighted);
        sub.setNotes(notes);
        sub.setQrCodeUrl(qrLink);
        subItems.add(sub);
    }
}

