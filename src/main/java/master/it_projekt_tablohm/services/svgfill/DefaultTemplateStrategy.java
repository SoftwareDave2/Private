package master.it_projekt_tablohm.services.svgfill;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.w3c.dom.svg.SVGDocument;

import java.util.List;
import java.util.Map;

import static master.it_projekt_tablohm.services.svgfill.SvgDomHelper.setText;

public class DefaultTemplateStrategy implements TemplateFillStrategy {

    @Override
    public boolean supports(String templateType) {
        return false;
    }

    @Override
    public void fill(SVGDocument doc, Map<String, Object> fields, List<DisplayTemplateSubData> subItems) {
        fields.forEach((k, v) -> setText(doc, k, String.valueOf(v)));
    }
}
