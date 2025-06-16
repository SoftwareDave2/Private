package master.it_projekt_tablohm.repositories;

import org.springframework.data.repository.CrudRepository;
import java.util.Optional;
import master.it_projekt_tablohm.models.User;

// This will be AUTO IMPLEMENTED by Spring into a Bean called userRepository
// CRUD refers Create, Read, Update, Delete

public interface UserRepository extends CrudRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}