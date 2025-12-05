package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.helper.SVGToJPEGConverter;
import master.it_projekt_tablohm.models.DisplayTemplateData;
import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.DisplayTemplateDataRepository;
import master.it_projekt_tablohm.repositories.DisplayTemplateSubDataRepository;
import master.it_projekt_tablohm.repositories.DisplayTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Service
public class TemplateDisplayUpdateService {

    private static final Logger logger = LoggerFactory.getLogger(TemplateDisplayUpdateService.class);
    private final SVGFillService svgFillService;
    private final OpenEPaperSyncService oeplSync;
    private final DisplayTemplateDataRepository templateDataRepo;
    private final DisplayTemplateSubDataRepository subDataRepo;
    private final DisplayTemplateRepository templateRepo;
    private final DisplayRepository displayRepo;

    private static final Path UPLOADS_DIR = Paths.get(
            System.getProperty("user.dir"), "src", "frontend", "public", "uploads"
    );


    public TemplateDisplayUpdateService(
            SVGFillService svgFillService,
            OpenEPaperSyncService oeplSync,
            DisplayTemplateDataRepository templateDataRepo,
            DisplayTemplateSubDataRepository subDataRepo,
            DisplayTemplateRepository templateRepo,
            DisplayRepository displayRepo) {
        this.svgFillService = svgFillService;
        this.oeplSync = oeplSync;
        this.templateDataRepo = templateDataRepo;
        this.subDataRepo = subDataRepo;
        this.templateRepo = templateRepo;
        this.displayRepo = displayRepo;
    }

    public void requestUpdate(DisplayTemplateData templateData) {
        if (templateData == null) {
            return;
        }
        if (templateData.getTemplateTypeEntity() == null) {
            logger.warn("Cannot update display {} because template type entity is missing", templateData.getDisplayMac());
            return;
        }
        requestUpdate(templateData.getDisplayMac(), templateData.getTemplateTypeEntity().getTypeKey());
    }

    public void requestUpdate(String displayMac, String templateType) {
        if (displayMac == null || templateType == null) return;

        logger.info("Scheduling display refresh for mac={} templateType={}", displayMac, templateType);

        // Step 1: getting display info
        var display = displayRepo.findByMacAddress(displayMac).orElse(null);
        if (display == null) {
            logger.warn("No display found for mac={}", displayMac);
            return;
        }
        int dw = display.getWidth();
        int dh = display.getHeight();

        // finding template based on type, width and height
        var tplOpt = templateRepo.findByTemplateTypeEntity_TypeKeyAndDisplayWidthAndDisplayHeight(templateType, dw, dh);
        if (tplOpt.isEmpty()) {
            logger.error("No template for type={} size={}x{} found", templateType, dw, dh);
            return;
        }
        var tpl = tplOpt.get();
        String rawSvg = tpl.getSvgContent();

        // Step 3: getting data
        var dataOpt = templateDataRepo.findByDisplayMacAndTemplateTypeEntity_TypeKey(displayMac, templateType);
        if (dataOpt.isEmpty()) {
            logger.warn("No DisplayTemplateData for mac={} type={} - using empty fields", displayMac, templateType);
        }
        var data = dataOpt.orElse(null);

        Map<String, Object> fields = (data != null && data.getFields() != null)
                ? data.getFields()
                : Map.of();

        List<DisplayTemplateSubData> subItems = List.of();

        if (data != null) {
            // for event board:
            if ("event-board".equalsIgnoreCase(templateType)) {
                subItems = subDataRepo.findByTemplateDataIdOrderByStartAsc(data.getId());
            } else {
                // for others: no change
                subItems = (data.getSubItems() != null) ? data.getSubItems() : List.of();
            }
        }

        try {
            // Step 4: fill SVG
            String filledSvg = svgFillService.fill(rawSvg, templateType, fields, subItems, dw, dh);

            // Step 5: render SVG to JPEG
            String basename = buildBasename(displayMac, templateType);
            Path outPath = UPLOADS_DIR.resolve(basename);
            SVGToJPEGConverter.convertSVGToJPEG(filledSvg, outPath.toString());

            // Step 6: send image to OEPL
            oeplSync.uploadImageToOEPLForDisplay(basename, displayMac);

            logger.info("Rendered+uploaded mac={} type={} file={}", displayMac, templateType, outPath);

        } catch (Exception e) {
            logger.error("Render/upload failed for mac={} type={}", displayMac, templateType, e);
        }
    }

    private String buildBasename(String displayMac, String templateType) {
        String mac = displayMac == null ? "UNKNOWN"
                : displayMac.replace(":", "").toUpperCase();
        return mac + "_" + templateType + ".jpg";
    }

    //Funktion zum Updaten von Displays mit keinen anstehenden Events => Template mit DefaultData an Display senden
    public void requestDefault(String displayMac, String templateType, master.it_projekt_tablohm.dto.TemplateDisplayDataDTO defaultData) {
        logger.info("Applying default template for mac={} templateType={} fields={}",
                displayMac, templateType, defaultData.getFields());
    }
}
