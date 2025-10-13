package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.DisplayTemplateData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DisplayTemplateDataRepository extends JpaRepository<DisplayTemplateData, Long> {

    List<DisplayTemplateData> findByDisplayMac(String displayMac);

    List<DisplayTemplateData> findByTemplateType(String templateType);

    Optional<DisplayTemplateData> findFirstByDisplayMacAndTemplateTypeAndEventEndAfterOrderByEventStartAsc(
            String displayMac,
            String templateType,
            LocalDateTime eventEnd
    );
}

