package master.it_projekt_tablohm.services.svgfill;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.w3c.dom.Element;
import org.w3c.dom.svg.SVGDocument;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setText;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.str;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.toggleDisplay;

public class RoomBookingStrategy implements TemplateFillStrategy {

    @Override
    public boolean supports(String templateType) { return "room-booking".equalsIgnoreCase(templateType);}

    @Override
    public void fill(SVGDocument doc, Map<String, Object> fields, List<DisplayTemplateSubData> subItems){

        setTextIfNotBlank(doc, "room-number", str(fields, "roomNumber", null));
        setTextIfNotBlank(doc, "room-name",   str(fields, "roomType", null));

        LocalDateTime now = LocalDateTime.now();

        List<DisplayTemplateSubData> sorted = (subItems == null ? List.<DisplayTemplateSubData>of() : subItems)
                .stream()
                .filter(e -> e.getStart() != null)
                .sorted(Comparator.comparing(DisplayTemplateSubData::getStart))
                .toList();

        // check if empty
        if (sorted.isEmpty()) {
            toggleDisplay(doc, "state-filled", false);
            toggleDisplay(doc, "state-idle", true);
            return;
        }

        toggleDisplay(doc, "state-filled", true);
        toggleDisplay(doc, "state-idle", false);

        // look if there is an active event right now
        DisplayTemplateSubData active = sorted.stream()
                .filter(e ->
                        e.getStart() != null &&
                                e.getEnd() != null &&
                                !now.isBefore(e.getStart()) &&
                                now.isBefore(e.getEnd())
                )
                .findFirst()
                .orElse(null);

        List<DisplayTemplateSubData> upcoming;

        Element label = doc.getElementById("current-label");

        if (active != null) {
            // there is an active event
            if (label != null) label.setAttribute("x", "18");
            setText(doc, "current-label", "Aktiver Termin");

            setText(doc, "current-time", SvgDomHelper.formatEventTimeLine(active));
            setText(doc, "current-title", active.getTitle());

            upcoming = sorted.stream()
                    .filter(e -> e.getStart().isAfter(active.getStart()))
                    .toList();
        } else {
            // next event
            DisplayTemplateSubData next = sorted.get(0);

            if (label != null) label.setAttribute("x", "18");
            setText(doc, "current-label", "Anstehender Termin");

            setText(doc, "current-time", SvgDomHelper.formatEventTimeLine(next));
            setText(doc, "current-title", next.getTitle());

            upcoming = sorted.stream().skip(1).toList();
        }

        // fill up the following events
        fillNext(doc, 1, upcoming.size() > 0 ? upcoming.get(0) : null);
        fillNext(doc, 2, upcoming.size() > 1 ? upcoming.get(1) : null);
        fillNext(doc, 3, upcoming.size() > 2 ? upcoming.get(2) : null);
    }

    private static void setTextIfNotBlank(SVGDocument doc, String id, String value) {
        if (value == null || value.isBlank()) return;
        Element el = doc.getElementById(id);
        if (el != null) el.setTextContent(value);
    }

    private void fillNext(SVGDocument doc, int idx, DisplayTemplateSubData ev) {
        String a = "next-" + idx + "a";
        String b = "next-" + idx + "b";

        if (ev == null) {
            setText(doc, a, "");
            setText(doc, b, "");
            return;
        }

        setText(doc, a, SvgDomHelper.formatEventTimeLine(ev));
        setText(doc, b, ev.getTitle());
    }

}