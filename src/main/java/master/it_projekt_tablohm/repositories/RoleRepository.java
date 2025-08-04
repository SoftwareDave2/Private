package master.it_projekt_tablohm.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import master.it_projekt_tablohm.models.Role;
import master.it_projekt_tablohm.models.Role.RoleName;

@Repository
public interface RoleRepository extends CrudRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
