package master.it_projekt_tablohm.repositories;


import master.it_projekt_tablohm.models.Config;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigRepository extends JpaRepository<Config, Long> {
}

