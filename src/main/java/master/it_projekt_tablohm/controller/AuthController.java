package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.dto.RegisterRequestDTO;
import master.it_projekt_tablohm.models.User;
import master.it_projekt_tablohm.models.Role;
import master.it_projekt_tablohm.models.Role.RoleName;
import master.it_projekt_tablohm.repositories.UserRepository;
import master.it_projekt_tablohm.repositories.RoleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/register")
    public String registerUser(@RequestBody RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User with this email already exists.";
        }

        Role publicRole = roleRepository.findByName(RoleName.PUBLIC)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // später hashen
        user.setRoles(Set.of(publicRole));

        userRepository.save(user);

        return "User registered successfully.";
    }
}
