package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.models.DisplayTemplateData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TemplateDisplayUpdateService {

    private static final Logger logger = LoggerFactory.getLogger(TemplateDisplayUpdateService.class);

    public void requestUpdate(DisplayTemplateData templateData) {
        if (templateData == null) {
            return;
        }
        requestUpdate(templateData.getDisplayMac(), templateData.getTemplateType());
    }

    //Funktion zum Updaten von Displays mit abgelaufenem Event => Nächstes anstehendes Event an Display senden 
    public void requestUpdate(String displayMac, String templateType) {
        // TODO wire up actual rendering + OEPL dispatch once available
        logger.info("Scheduling display refresh for mac={} templateType={}", displayMac, templateType);
    }

    //Funktion zum Updaten von Displays mit keinen anstehenden Events => Template mit DefaultData an Display senden
    public void requestDefault(String displayMac, String templateType, master.it_projekt_tablohm.dto.TemplateDisplayDataDTO defaultData) {
        logger.info("Applying default template for mac={} templateType={} fields={}",
                displayMac, templateType, defaultData.getFields());
    }
}
