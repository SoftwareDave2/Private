package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.DisplayTemplate;
import master.it_projekt_tablohm.models.TemplateType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DisplayTemplateRepository extends JpaRepository<DisplayTemplate, Long> {

    Optional<DisplayTemplate> findByTemplateType(String templateType);

    Optional<DisplayTemplate> findByTemplateTypeEntity(TemplateType templateType);

    Optional<DisplayTemplate> findByTemplateTypeEntity_TypeKey(String templateTypeKey);

    // find a template based on template type (string fallback) and matching display width/ height
    Optional<DisplayTemplate> findByTemplateTypeAndDisplayWidthAndDisplayHeight(
            String templateType,
            Integer displayWidth,
            Integer displayHeight
    );

    Optional<DisplayTemplate> findByTemplateTypeEntity_TypeKeyAndDisplayWidthAndDisplayHeight(
            String templateTypeKey,
            Integer displayWidth,
            Integer displayHeight
    );
}
