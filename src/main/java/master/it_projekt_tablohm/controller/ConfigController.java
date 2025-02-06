package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Config;
import master.it_projekt_tablohm.repositories.ConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
@RequestMapping(path = "/config")
public class ConfigController {
    @Autowired
    private final ConfigRepository configRepository;

    public ConfigController(ConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/get")
    public ResponseEntity<Config> getConfig() {
        return configRepository.findAll().stream().findFirst()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @CrossOrigin(origins = "*")
    @PostMapping(path = "/post")
    public ResponseEntity<Config> createOrUpdateConfig(@RequestBody Config config) {
        Optional<Config> existingConfig = configRepository.findAll().stream().findFirst();

        if (existingConfig.isPresent()) {
            // Update the existing config
            Config updatedConfig = existingConfig.get();
            updatedConfig.setWakeIntervalDay(config.getWakeIntervalDay());
            updatedConfig.setWakeIntervalNight(config.getWakeIntervalNight());
            updatedConfig.setLeadTime(config.getLeadTime());
            updatedConfig.setFollowUpTime(config.getFollowUpTime());
            return ResponseEntity.ok(configRepository.save(updatedConfig));
        } else {
            // Create new config if none exists
            return ResponseEntity.ok(configRepository.save(config));
        }
    }

}
