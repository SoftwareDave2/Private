package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.TemplateType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TemplateTypeRepository extends JpaRepository<TemplateType, Long> {
    Optional<TemplateType> findByTypeKey(String typeKey);
}
