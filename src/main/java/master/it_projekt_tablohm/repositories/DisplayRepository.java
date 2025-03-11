package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.Display;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

// This will be AUTO IMPLEMENTED by Spring into a Bean called userRepository
// CRUD refers Create, Read, Update, Delete

public interface DisplayRepository extends CrudRepository<Display, Integer> {

    boolean existsByDefaultFilename(String filename);

    Optional<Display> findByMacAddress(String macAddress);

    List<Display> findByMacAddressIn(List<String> macAddresses);

    @Query("SELECT DISTINCT d.brand FROM Display d")
    List<String> findDistinctBrands();

    @Query("SELECT DISTINCT d.model FROM Display d")
    List<String> findDistinctModels();
}