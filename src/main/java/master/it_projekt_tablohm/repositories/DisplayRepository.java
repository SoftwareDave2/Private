package master.it_projekt_tablohm.repositories;

import master.it_projekt_tablohm.models.Display;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

// This will be AUTO IMPLEMENTED by Spring into a Bean called userRepository
// CRUD refers Create, Read, Update, Delete

public interface DisplayRepository extends CrudRepository<Display, Integer> {

    Optional<Display> findByMacAddress(String macAddress);
}