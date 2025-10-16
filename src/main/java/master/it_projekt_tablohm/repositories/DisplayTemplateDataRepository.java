package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.DisplayTemplateData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DisplayTemplateDataRepository extends JpaRepository<DisplayTemplateData, Long> {

    List<DisplayTemplateData> findByDisplayMac(String displayMac);

    List<DisplayTemplateData> findByTemplateType(String templateType);

    Optional<DisplayTemplateData> findByDisplayMacAndTemplateType(String displayMac, String templateType);

    Optional<DisplayTemplateData> findFirstByDisplayMac(String displayMac);

    List<DisplayTemplateData> findByEventEndNotNullAndEventEndLessThanEqual(LocalDateTime cutoff);

    @Query("SELECT DISTINCT d FROM DisplayTemplateData d JOIN d.subItems s WHERE s.end IS NOT NULL AND s.end <= :cutoff")
    List<DisplayTemplateData> findWithExpiredSubItems(@Param("cutoff") LocalDateTime cutoff);

    Optional<DisplayTemplateData> findFirstByDisplayMacAndTemplateTypeAndEventEndAfterOrderByEventStartAsc(
            String displayMac,
            String templateType,
            LocalDateTime eventEnd
    );
}
