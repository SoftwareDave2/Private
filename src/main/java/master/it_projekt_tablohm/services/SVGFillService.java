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
import java.util.List;
import java.util.Map;

@Service
public class SVGFillService {

    public String fill(String rawSvg,
                       String templateType,
                       Map<String, Object> fields,
                       List<DisplayTemplateSubData> subItems,
                       int targetWidth,
                       int targetHeight) {

        // 1) SVG -> DOM
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
                setText(doc, "roomNumber", str(f, "roomNumber", "—"));
                setText(doc, "name-1",     str(f, "name1",     "—"));
                setText(doc, "name-2",     str(f, "name2",     "—"));
                setText(doc, "name-3",     str(f, "name3",     "—"));
                // Example: Color for busy / not busy
                if ("busy".equalsIgnoreCase(str(f, "state", ""))) {
                    setStyleProp(doc, "statusBar", "fill", "#ff0000");
                } else {
                    setStyleProp(doc, "statusBar", "fill", "#ffffff");
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

    // ===== helpers =====
    private static void setText(SVGDocument doc, String id, String value) {
        Element el = doc.getElementById(id);
        if (el != null) el.setTextContent(value != null ? value : "");
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
