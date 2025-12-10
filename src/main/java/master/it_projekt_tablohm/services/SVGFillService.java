package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.apache.batik.anim.dom.SAXSVGDocumentFactory;
import org.apache.batik.dom.util.DOMUtilities;
import org.apache.batik.util.XMLResourceDescriptor;
import org.springframework.stereotype.Service;
import org.w3c.dom.Element;
import org.w3c.dom.svg.SVGDocument;

import java.io.StringReader;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
@Service
public class SVGFillService {

    public String fill(String rawSvg,
                       String templateType,
                       Map<String, Object> fields,
                       List<DisplayTemplateSubData> subItems,
                       int targetWidth,
                       int targetHeight) {

        // Step 1: SVG -> DOM
        String parser = XMLResourceDescriptor.getXMLParserClassName();
        var factory = new SAXSVGDocumentFactory(parser);
        final SVGDocument doc;
        try (StringReader reader = new StringReader(rawSvg)) {
            doc = factory.createSVGDocument("http://local/template.svg", reader);
        } catch (java.io.IOException e) {
            throw new UncheckedIOException("Failed to parse SVG template", e);
        }

        Map<String, Object> f = (fields != null) ? fields : Map.of();

        // Step 2: fill logic based on template type and metrics
        switch (templateType.toLowerCase()) {
            case "notice-board", "notice-board-small" -> {

                // Title: accept headerTitle or title
                String header = coalesce(f, "headerTitle", "title");
                if (!notBlank(header)) header = "Hinweis";
                setText(doc, "headerTitle", header);

                // text: accept line1 or body/description
                String free = coalesce(f, "line1", "body", "description");
                String l1 = "", l2 = "";

                if (free != null) {
                    // split incoming text into 2 rows
                    String[] parts = free.split("\\R", 2);
                    l1 = parts.length > 0 ? parts[0].trim() : "";
                    l2 = parts.length > 1 ? parts[1].trim() : "";
                } else {
                    // if line 1 is not set but line 2
                    l1 = str(f, "line1", "");
                    l2 = str(f, "line2", "");
                }

                setText(doc, "line1", l1);
                setText(doc, "line2", l2);

                boolean filled = notBlank(l1) || notBlank(l2);
                toggleDisplay(doc, "state-idle",  !filled);
                toggleDisplay(doc, "state-filled", filled);

                // option for header color (step 2)
                String headerColor = str(f, "headerColor", "");
                if (notBlank(headerColor)) {
                    setStyleProp(doc, "headerBar", "fill", headerColor);
                }
            }

            case "door-sign" -> {

                // set roomNumber and footherNote
                setText(doc, "roomNumber", str(f, "roomNumber", "—"));
                setText(doc, "footerNote", str(f, "footerNote", ""));

                // sort people from subItems by positionIndex
                List<DisplayTemplateSubData> people = (subItems == null)
                        ? List.of()
                        : subItems.stream()
                        .sorted(Comparator.comparing(
                                s -> s.getPositionIndex() == null ? Integer.MAX_VALUE : s.getPositionIndex()
                        ))
                        .toList();

                // 3 slots max
                for (int i = 0; i < 3; i++) {
                    String nameId = switch (i) {
                        case 0 -> "name-1";
                        case 1 -> "name-2";
                        default -> "name-3";
                    };

                    // get SubData (person data)
                    if (i < people.size()) {
                        DisplayTemplateSubData person = people.get(i);
                        String name = person.getTitle() != null ? person.getTitle() : "";
                        boolean busy = Boolean.TRUE.equals(person.getBusy());

                        // set text
                        setText(doc, nameId, name);
                        // if person busy -> red text ; otherwise: black
                        setStyleProp(doc, nameId, "fill", busy ? "#ff0000" : "#000000");
                    } else {
                        // no person for this slot  -> empty & white
                        setText(doc, nameId, "");
                        setStyleProp(doc, nameId, "fill", "#ffffff");
                    }
                }

                // room status: if at least one person is busy -> show  "Nicht stören"-Badge
                // otherwise:  "Verfügbar"-Badge
                boolean anyBusy = people.stream().anyMatch(p -> Boolean.TRUE.equals(p.getBusy()));
                toggleDisplay(doc, "state-busy", anyBusy);
                toggleDisplay(doc, "state-free", !anyBusy);
            }
            case "event-board" -> {

                //check if empty
                boolean noEvents = (subItems == null || subItems.isEmpty());

                if (noEvents) {

                    // hide all event slots + lines
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

                    // show no events messages
                    toggleDisplay(doc, "no-events-message", true);
                    toggleDisplay(doc, "no-events-message-2", true);
                    toggleDisplay(doc, "idle-text-qr-1", true);
                    toggleDisplay(doc, "idle-text-qr-2", true);

                    // (optional) update title
                    setText(doc, "events-title", "Ereignisse");

                    // skip normal rendering
                    break;
                }

                // === 1) Title ===========================================
                String mainTitle = str(f, "title", "");
                boolean hasMainTitle = notBlank(mainTitle);

                if (hasMainTitle) {
                    // if the title isn't empty
                    setText(doc, "events-title", mainTitle);
                    toggleDisplay(doc, "events-title", true);

                    // red header
                    toggleDisplay(doc, "events-header-bg", true);
                } else {
                    // if there is no title
                    setText(doc, "events-title", "");
                    toggleDisplay(doc, "events-title", false);

                    // no red header
                    toggleDisplay(doc, "events-header-bg", false);

                    // the first event will be moved upwards
                    setTransform(doc, "event-1-text-1", "translate(0,-30)");
                    setTransform(doc, "event-1-text-2", "translate(0,-30)");

                    // the font will be increased
                    setStyleProp(doc, "event-1-text-1", "font-size", "22px");
                    setStyleProp(doc, "event-1-text-2", "font-size", "20px");
                }

                // === 2) get events from subItems ========================
                List<DisplayTemplateSubData> events = (subItems == null) ? List.of() : subItems;


                // === 3) Highlighted Event (sticky) =================
                DisplayTemplateSubData highlight = events.stream()
                        .filter(e -> Boolean.TRUE.equals(e.getHighlighted()))
                        .findFirst()
                        .orElse(null);

                // regular Events: max 4, if there is a highlighted ->  max 3
                List<DisplayTemplateSubData> normalEvents = events.stream()
                        .filter(e -> !Boolean.TRUE.equals(e.getHighlighted()))
                        .limit(highlight != null ? 3 : 4)
                        .toList();

                // === 4) fill slots 1–4 ===============================
                // Slots: event-1, event-2, event-3, event-4 (using setEventLines)
                for (int i = 0; i < normalEvents.size(); i++) {
                    DisplayTemplateSubData ev = normalEvents.get(i);
                    String baseId = "event-" + (i + 1);  // event-1..event-4

                    setEventLines(doc, baseId, ev);
                }

                // empty not used slots
                // alternative: SVG is empty there
                for (int i = normalEvents.size(); i < 4; i++) {
                    String baseId = "event-" + (i + 1);
                    setEventLines(doc, baseId, null);  // empty title + time
                }

                // === 5) Highlighted: sticky in event-4 =============
                // Standard: no red rectangle, line 3 visible
                setStyleProp(doc, "event-4-highlight-frame", "stroke", "none");
                toggleDisplay(doc, "events-line-3", true);

                // highlighted
                if (highlight != null) {
                    String baseId = "event-4";

                    setEventLines(doc, baseId, highlight);

                    // red rectangle
                    setStyleProp(doc, "event-4-highlight-frame", "stroke", "#ff0000");

                    // remove line
                    toggleDisplay(doc, "events-line-3", false);
                }
            }

            // TODO
            default -> {
                // Fallback
                f.forEach((k, v) -> setText(doc, k, String.valueOf(v)));
            }
        }

        // 3) set size on root
        setSizeOnRoot(doc, targetWidth, targetHeight);

        // 4) DOM -> SVG-String
        try (var sw = new StringWriter()) {
            DOMUtilities.writeDocument(doc, sw);
            return sw.toString();
        } catch (java.io.IOException e) {
            throw new UncheckedIOException("Failed to serialize SVG", e);
        }
    }

    // ============================= <3 helpers <3 =========================================

    private static void setTransform(SVGDocument doc, String id, String transform) {
        Element el = doc.getElementById(id);
        if (el != null) {
            el.setAttribute("transform", transform);
        }
    }

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy").withLocale(Locale.GERMAN);
    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm").withLocale(Locale.GERMAN);

    private static void setText(SVGDocument doc, String id, String value) {
        Element el = doc.getElementById(id);
        if (el != null) el.setTextContent(value != null ? value : "");
    }

    private static void setEventLines(SVGDocument doc, String baseId, DisplayTemplateSubData ev) {
        String idLine1 = baseId + "-text-1";
        String idLine2 = baseId + "-text-2";

        if (ev == null) {
            // Slot leeren
            setText(doc, idLine1, "");
            setText(doc, idLine2, "");
            return;
        }

        String title = ev.getTitle() != null ? ev.getTitle() : "";
        String line2 = formatEventTimeLine(ev);  // Zeit / Ganztags

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

        // === allDay ================================================
         if (allDay) {
            return dateStr + ", Ganztags";
         }

        // === START + END same day ===============================
        if (end != null && end.toLocalDate().isEqual(start.toLocalDate())) {
            String startTime = start.toLocalTime().format(TIME_FMT);
            String endTime   = end.toLocalTime().format(TIME_FMT);
            return dateStr + ", " + startTime + "–" + endTime + " Uhr";
        }

        // === START + END different days ==================
        if (end != null) {
            String startPart = dateStr + " " + start.toLocalTime().format(TIME_FMT);
            String endPart   = end.toLocalDate().format(DATE_FMT) + " " + end.toLocalTime().format(TIME_FMT);
            return startPart + " – " + endPart;
        }

        // === only start time ===============================================
        String startTime = start.toLocalTime().format(TIME_FMT);
        return dateStr + ", " + startTime + " Uhr";
    }


    private static String coalesce(Map<String, Object> m, String... keys) {
        if (m == null) return null;
        for (String k : keys) {
            Object v = m.get(k);
            if (v != null) {
                String s = String.valueOf(v);
                if (s != null && !s.isBlank()) return s;
            }
        }
        return null;
    }


    private static void toggleDisplay(SVGDocument doc, String id, boolean visible) {
        Element el = doc.getElementById(id);
        if (el == null) return;
        String style = el.getAttribute("style");
        if (style == null) style = "";
        style = style.replaceAll("(?i)display\\s*:\\s*none;?", "");
        if (!visible) {
            if (!style.isEmpty() && !style.endsWith(";")) style += ";";
            style += "display:none";
        }
        el.setAttribute("style", style);
    }

    private static void setStyleProp(SVGDocument doc, String id, String prop, String val) {
        Element el = doc.getElementById(id);
        if (el == null) return;
        String style = el.getAttribute("style");
        if (style == null) style = "";
        style = style.replaceAll("(?i)" + prop + "\\s*:\\s*[^;]+;?", "");
        if (!style.isEmpty() && !style.endsWith(";")) style += ";";
        style += prop + ":" + val;
        el.setAttribute("style", style);
    }

    private static void setSizeOnRoot(SVGDocument doc, int w, int h) {
        Element root = doc.getDocumentElement(); // <svg>
        if (root != null) {
            root.setAttribute("width",  String.valueOf(w));
            root.setAttribute("height", String.valueOf(h));
        }
    }

    private static String str(Map<String, Object> map, String key, String def) {
        if (map == null) return def;
        Object v = map.get(key);
        return v == null ? def : String.valueOf(v);
    }
    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }
}
