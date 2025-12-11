package master.it_projekt_tablohm.services.svgfill;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.w3c.dom.Element;
import org.w3c.dom.svg.SVGDocument;

import java.util.Map;

final public class SvgDomHelper {

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
}
