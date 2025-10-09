package master.it_projekt_tablohm.services;

import master.it_projekt_tablohm.config.AuthProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {

    private final AuthProperties authProperties;
    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public SessionService(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    public SessionWithToken createSession(String username) {
        final String token = UUID.randomUUID().toString();
        final Instant expiresAt = Instant.now()
                .plus(authProperties.getSessionTtlMinutes(), ChronoUnit.MINUTES);
        sessions.put(token, new Session(username, expiresAt));
        return new SessionWithToken(token, expiresAt);
    }

    public Optional<Session> validate(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        final Session session = sessions.get(token);
        if (session == null) {
            return Optional.empty();
        }
        if (session.expiresAt().isBefore(Instant.now())) {
            sessions.remove(token);
            return Optional.empty();
        }
        return Optional.of(session);
    }

    public void invalidate(String token) {
        if (token != null && !token.isBlank()) {
            sessions.remove(token);
        }
    }

    public record Session(String username, Instant expiresAt) {
    }

    public record SessionWithToken(String token, Instant expiresAt) {
    }
}

