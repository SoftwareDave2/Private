package master.it_projekt_tablohm.services.svgfill;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.w3c.dom.Element;
import org.w3c.dom.svg.SVGDocument;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;

final public class SvgDomHelper {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy").withLocale(Locale.GERMAN);
    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm").withLocale(Locale.GERMAN);

    private SvgDomHelper() {
    }

    static void setTransform(SVGDocument doc, String id, String transform) {
        Element el = doc.getElementById(id);
        if (el != null) {
            el.setAttribute("transform", transform);
        }
    }

    static void setText(SVGDocument doc, String id, String value) {
        Element el = doc.getElementById(id);
        if (el != null) el.setTextContent(value != null ? value : "");
    }

    static void toggleDisplay(SVGDocument doc, String id, boolean visible) {
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

    static void setStyleProp(SVGDocument doc, String id, String prop, String val) {
        Element el = doc.getElementById(id);
        if (el == null) return;
        String style = el.getAttribute("style");
        if (style == null) style = "";
        style = style.replaceAll("(?i)" + prop + "\\s*:\\s*[^;]+;?", "");
        if (!style.isEmpty() && !style.endsWith(";")) style += ";";
        style += prop + ":" + val;
        el.setAttribute("style", style);
    }

    public static void setSizeOnRoot(SVGDocument doc, int w, int h) {
        Element root = doc.getDocumentElement(); // <svg>
        if (root != null) {
            root.setAttribute("width", String.valueOf(w));
            root.setAttribute("height", String.valueOf(h));
        }
    }

    static String str(Map<String, Object> map, String key, String def) {
        if (map == null) return def;
        Object v = map.get(key);
        return v == null ? def : String.valueOf(v);
    }

    static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    static String coalesce(Map<String, Object> m, String... keys) {
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

    public static String formatEventTimeLine(DisplayTemplateSubData ev) {
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
