package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.RecEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecEventRepository extends JpaRepository<RecEvent, Integer> {
    void deleteByGroupId(String groupId);
}
