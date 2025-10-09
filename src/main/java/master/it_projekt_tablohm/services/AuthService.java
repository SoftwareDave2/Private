package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.config.AuthProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private final AuthProperties authProperties;

    public AuthService(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    public boolean authenticate(String username, String password) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            return false;
        }
        return username.equals(authProperties.getUsername())
                && password.equals(authProperties.getPassword());
    }

    public boolean isDevLoginEnabled() {
        return authProperties.isDevEnabled();
    }
}

