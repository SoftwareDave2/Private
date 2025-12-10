package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.DisplayTemplateSubData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisplayTemplateSubDataRepository extends JpaRepository<DisplayTemplateSubData, Long> {

    List<DisplayTemplateSubData> findByTemplateDataId(Long templateDataId);

    List<DisplayTemplateSubData> findByTemplateDataIdOrderByStartAsc(Long templateDataId);

    List<DisplayTemplateSubData> findByTemplateDataIdAndHighlightedTrueOrderByStartAsc(Long templateDataId);

}

