package master.it_projekt_tablohm.services.svgfill;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.w3c.dom.svg.SVGDocument;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.notBlank;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setStyleProp;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setText;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setTransform;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.str;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.toggleDisplay;

public class EventBoardStrategy implements TemplateFillStrategy {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy").withLocale(Locale.GERMAN);
    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm").withLocale(Locale.GERMAN);

    @Override
    public boolean supports(String templateType) {
        return "event-board".equalsIgnoreCase(templateType);
    }

    @Override
    public void fill(SVGDocument doc, Map<String, Object> fields, List<DisplayTemplateSubData> subItems) {
        boolean noEvents = (subItems == null || subItems.isEmpty());

        if (noEvents) {
            for (String id : List.of(
                    "event-1-text-1", "event-1-text-2",
                    "event-2-text-1", "event-2-text-2",
                    "event-3-text-1", "event-3-text-2",
                    "event-4-text-1", "event-4-text-2",
                    "events-line-1", "events-line-2", "events-line-3",
                    "event-4-highlight-frame"
            )) {
                toggleDisplay(doc, id, false);
            }

            toggleDisplay(doc, "no-events-message", true);
            toggleDisplay(doc, "no-events-message-2", true);
            toggleDisplay(doc, "idle-text-qr-1", true);
            toggleDisplay(doc, "idle-text-qr-2", true);

            setText(doc, "events-title", "Ereignisse");
            return;
        }

        String mainTitle = str(fields, "title", "");
        boolean hasMainTitle = notBlank(mainTitle);

        if (hasMainTitle) {
            setText(doc, "events-title", mainTitle);
            toggleDisplay(doc, "events-title", true);
            toggleDisplay(doc, "events-header-bg", true);
        } else {
            setText(doc, "events-title", "");
            toggleDisplay(doc, "events-title", false);
            toggleDisplay(doc, "events-header-bg", false);
            setTransform(doc, "event-1-text-1", "translate(0,-30)");
            setTransform(doc, "event-1-text-2", "translate(0,-30)");
            setStyleProp(doc, "event-1-text-1", "font-size", "22px");
            setStyleProp(doc, "event-1-text-2", "font-size", "20px");
        }

        List<DisplayTemplateSubData> events = (subItems == null) ? List.of() : subItems;

        DisplayTemplateSubData highlight = events.stream()
                .filter(e -> Boolean.TRUE.equals(e.getHighlighted()))
                .findFirst()
                .orElse(null);

        List<DisplayTemplateSubData> normalEvents = events.stream()
                .filter(e -> !Boolean.TRUE.equals(e.getHighlighted()))
                .limit(highlight != null ? 3 : 4)
                .toList();

        for (int i = 0; i < normalEvents.size(); i++) {
            DisplayTemplateSubData ev = normalEvents.get(i);
            String baseId = "event-" + (i + 1);
            setEventLines(doc, baseId, ev);
        }

        for (int i = normalEvents.size(); i < 4; i++) {
            String baseId = "event-" + (i + 1);
            setEventLines(doc, baseId, null);
        }

        setStyleProp(doc, "event-4-highlight-frame", "stroke", "none");
        toggleDisplay(doc, "events-line-3", true);

        if (highlight != null) {
            String baseId = "event-4";
            setEventLines(doc, baseId, highlight);
            setStyleProp(doc, "event-4-highlight-frame", "stroke", "#ff0000");
            toggleDisplay(doc, "events-line-3", false);
        }
    }

    private static void setEventLines(SVGDocument doc, String baseId, DisplayTemplateSubData ev) {
        String idLine1 = baseId + "-text-1";
        String idLine2 = baseId + "-text-2";

        if (ev == null) {
            setText(doc, idLine1, "");
            setText(doc, idLine2, "");
            return;
        }

        String title = ev.getTitle() != null ? ev.getTitle() : "";
        String line2 = formatEventTimeLine(ev);

        setText(doc, idLine1, title);
        setText(doc, idLine2, line2);
    }

    private static String formatEventTimeLine(DisplayTemplateSubData ev) {
        if (ev == null) return "";

        LocalDateTime start = ev.getStart();
        LocalDateTime end = ev.getEnd();
        boolean allDay = Boolean.TRUE.equals(ev.getAllDay());

        if (start == null) {
            return "";
        }

        String dateStr = start.toLocalDate().format(DATE_FMT);

        if (allDay) {
            return dateStr + ", Ganztags";
        }

        if (end != null && end.toLocalDate().isEqual(start.toLocalDate())) {
            String startTime = start.toLocalTime().format(TIME_FMT);
            String endTime = end.toLocalTime().format(TIME_FMT);
            return dateStr + ", " + startTime + " - " + endTime + " Uhr";
        }

        if (end != null) {
            String startPart = dateStr + " " + start.toLocalTime().format(TIME_FMT);
            String endPart = end.toLocalDate().format(DATE_FMT) + " " + end.toLocalTime().format(TIME_FMT);
            return startPart + " - " + endPart;
        }

        String startTime = start.toLocalTime().format(TIME_FMT);
        return dateStr + ", " + startTime + " Uhr";
    }
}
