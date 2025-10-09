package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.services.AuthService;
import master.it_projekt_tablohm.services.SessionService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final SessionService sessionService;

    public AuthController(AuthService authService, SessionService sessionService) {
        this.authService = authService;
        this.sessionService = sessionService;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        if (!authService.authenticate(loginRequest.username(), loginRequest.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Ungültige Zugangsdaten"));
        }
        final SessionService.SessionWithToken session = sessionService.createSession(loginRequest.username());
        return ResponseEntity.ok(new LoginResponse(session.token(), session.expiresAt()));
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/dev-login")
    public ResponseEntity<?> devLogin() {
        if (!authService.isDevLoginEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Dev Login ist deaktiviert"));
        }
        final SessionService.SessionWithToken session = sessionService.createSession("developer");
        return ResponseEntity.ok(new LoginResponse(session.token(), session.expiresAt()));
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        final Optional<String> maybeToken = resolveToken(authorizationHeader);
        if (maybeToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Kein Token übermittelt"));
        }
        return sessionService.validate(maybeToken.get())
                .<ResponseEntity<?>>map(session -> ResponseEntity.ok(new VerifyResponse(session.username(), session.expiresAt())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Token ist ungültig oder abgelaufen")));
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        resolveToken(authorizationHeader)
                .ifPresent(sessionService::invalidate);
        return ResponseEntity.ok(Map.of("message", "Abgemeldet"));
    }

    private Optional<String> resolveToken(String authorizationHeader) {
        if (authorizationHeader == null) {
            return Optional.empty();
        }
        if (authorizationHeader.startsWith("Bearer ")) {
            return Optional.of(authorizationHeader.substring(7));
        }
        return Optional.empty();
    }

    public record LoginRequest(String username, String password) {
    }

    public record LoginResponse(String token, Instant expiresAt) {
    }

    public record VerifyResponse(String username, Instant expiresAt) {
    }
}

