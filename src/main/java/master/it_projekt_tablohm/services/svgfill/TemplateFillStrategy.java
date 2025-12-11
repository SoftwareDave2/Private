package master.it_projekt_tablohm.services.svgfill;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.w3c.dom.svg.SVGDocument;

import java.util.List;
import java.util.Map;

public interface TemplateFillStrategy {

    // checks if template type matches strategy
    boolean supports(String templateType);

    // actual filling of the SVG templates
    void fill(SVGDocument document, Map<String, Object> fields, List<DisplayTemplateSubData> subItems);
}
