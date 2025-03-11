package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Integer> {
    Optional<Image> findByInternalName(String internalName);
}
