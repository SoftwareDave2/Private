package master.it_projekt_tablohm.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    /**
     * Username that is allowed to authenticate against the backend.
     */
    private String username = "admin";

    /**
     * Plain text password for the pre-configured user.
     * Replace this with a secure value before deploying.
     */
    private String password = "tablohm";

    /**
     * Enables the development shortcut endpoint.
     */
    private boolean devEnabled = true;

    /**
     * Session lifetime in minutes for issued tokens.
     */
    private long sessionTtlMinutes = 720L;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isDevEnabled() {
        return devEnabled;
    }

    public void setDevEnabled(boolean devEnabled) {
        this.devEnabled = devEnabled;
    }

    public long getSessionTtlMinutes() {
        return sessionTtlMinutes;
    }

    public void setSessionTtlMinutes(long sessionTtlMinutes) {
        this.sessionTtlMinutes = sessionTtlMinutes;
    }
}

