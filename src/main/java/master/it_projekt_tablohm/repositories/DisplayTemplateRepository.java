package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.DisplayTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DisplayTemplateRepository extends JpaRepository<DisplayTemplate, Long> {

    Optional<DisplayTemplate> findByTemplateType(String templateType);
}
