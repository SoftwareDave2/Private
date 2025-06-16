package master.it_projekt_tablohm.services;

import jakarta.annotation.PostConstruct;
import master.it_projekt_tablohm.models.Role;
import master.it_projekt_tablohm.models.Role.RoleName;
import master.it_projekt_tablohm.repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleInitService {

    @Autowired
    private RoleRepository roleRepository;

    @PostConstruct
    public void initDefaultRoles() {
        createRoleIfNotExists(RoleName.PUBLIC);
        createRoleIfNotExists(RoleName.ADMIN);
    }

    private void createRoleIfNotExists(RoleName roleName) {
        roleRepository.findByName(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setName(roleName);
            return roleRepository.save(role);
        });
    }
}
