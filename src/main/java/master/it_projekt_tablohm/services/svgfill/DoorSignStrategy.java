package master.it_projekt_tablohm.services.svgfill;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.w3c.dom.svg.SVGDocument;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setStyleProp;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setText;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.str;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.toggleDisplay;

public class DoorSignStrategy implements TemplateFillStrategy {

    @Override
    public boolean supports(String templateType) {
        return "door-sign".equalsIgnoreCase(templateType);
    }

    @Override
    public void fill(SVGDocument doc, Map<String, Object> fields, List<DisplayTemplateSubData> subItems) {

        setText(doc, "roomNumber", str(fields, "roomNumber", "-"));
        setText(doc, "footerNote", str(fields, "footerNote", ""));

        List<DisplayTemplateSubData> people = (subItems == null)
                ? List.of()
                : subItems.stream()
                .sorted(Comparator.comparing(
                        s -> s.getPositionIndex() == null ? Integer.MAX_VALUE : s.getPositionIndex()
                ))
                .toList();

        for (int i = 0; i < 3; i++) {
            String nameId = switch (i) {
                case 0 -> "name-1";
                case 1 -> "name-2";
                default -> "name-3";
            };

            if (i < people.size()) {
                DisplayTemplateSubData person = people.get(i);
                String name = person.getTitle() != null ? person.getTitle() : "";
                boolean busy = Boolean.TRUE.equals(person.getBusy());

                setText(doc, nameId, name);
                setStyleProp(doc, nameId, "fill", busy ? "#ff0000" : "#000000");
            } else {
                setText(doc, nameId, "");
                setStyleProp(doc, nameId, "fill", "#ffffff");
            }
        }

        boolean anyBusy = people.stream().anyMatch(p -> Boolean.TRUE.equals(p.getBusy()));
        toggleDisplay(doc, "state-busy", anyBusy);
        toggleDisplay(doc, "state-free", !anyBusy);
    }
}
