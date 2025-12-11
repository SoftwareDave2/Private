package master.it_projekt_tablohm.services.svgfill;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.w3c.dom.svg.SVGDocument;

import java.util.List;
import java.util.Map;

import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.coalesce;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.notBlank;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setStyleProp;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setText;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.str;
import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.toggleDisplay;

public class NoticeBoardStrategy implements TemplateFillStrategy {

    @Override
    public boolean supports(String templateType) {
        return "notice-board".equalsIgnoreCase(templateType);
    }

    @Override
    public void fill(SVGDocument doc, Map<String, Object> fields, List<DisplayTemplateSubData> subItems) {
        String header = coalesce(fields, "headerTitle", "title");
        if (!notBlank(header)) header = "Hinweis";
        setText(doc, "headerTitle", header);

        String free = coalesce(fields, "line1", "body", "description");

        String l1 = "";
        String l2 = "";

        if (free != null) {
            String[] parts = free.split("\\R", 2);
            l1 = parts.length > 0 ? parts[0].trim() : "";
            l2 = parts.length > 1 ? parts[1].trim() : "";
        } else {
            l1 = str(fields, "line1", "");
            l2 = str(fields, "line2", "");
        }

        setText(doc, "line1", l1);
        setText(doc, "line2", l2);

        boolean filled = notBlank(l1) || notBlank(l2);

        toggleDisplay(doc, "state-filled", filled);
        toggleDisplay(doc, "state-idle", !filled);

        String headerColor = str(fields, "headerColor", "");
        if (notBlank(headerColor)) {
            setStyleProp(doc, "headerBar", "fill", headerColor);
        }
    }
}
