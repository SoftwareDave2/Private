package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import master.it_projekt_tablohm.services.svgfill.*;
import org.apache.batik.anim.dom.SAXSVGDocumentFactory;
import org.apache.batik.dom.util.DOMUtilities;
import org.apache.batik.util.XMLResourceDescriptor;
import org.springframework.stereotype.Service;
import org.w3c.dom.svg.SVGDocument;

import java.io.StringReader;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;

@Service
public class SVGFillService {

    private final List<TemplateFillStrategy> strategies = List.of(
            new NoticeBoardStrategy(),
            new DoorSignStrategy(),
            new EventBoardStrategy(),
            new RoomBookingStrategy()
    );

    private final TemplateFillStrategy defaultStrategy = new DefaultTemplateStrategy();

    public String fill(String rawSvg,
                       String templateType,
                       Map<String, Object> fields,
                       List<DisplayTemplateSubData> subItems,
                       int targetWidth,
                       int targetHeight) {

        String parser = XMLResourceDescriptor.getXMLParserClassName();
        var factory = new SAXSVGDocumentFactory(parser);
        final SVGDocument doc;
        try (StringReader reader = new StringReader(rawSvg)) {
            doc = factory.createSVGDocument("http://local/template.svg", reader);
        } catch (java.io.IOException e) {
            throw new UncheckedIOException("Failed to parse SVG template", e);
        }

        Map<String, Object> f = (fields != null) ? fields : Map.of();

        TemplateFillStrategy strategy = strategies.stream()
                .filter(s -> s.supports(templateType))
                .findFirst()
                .orElse(defaultStrategy);

        strategy.fill(doc, f, subItems);

        SvgDomHelper.setSizeOnRoot(doc, targetWidth, targetHeight);

        try (var sw = new StringWriter()) {
            DOMUtilities.writeDocument(doc, sw);
            return sw.toString();
        } catch (java.io.IOException e) {
            throw new UncheckedIOException("Failed to serialize SVG", e);
        }
    }
}
