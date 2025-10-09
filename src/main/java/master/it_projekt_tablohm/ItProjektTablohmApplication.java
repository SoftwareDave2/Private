package master.it_projekt_tablohm;

import master.it_projekt_tablohm.config.AuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

// This is the annotation alias for many annotations
// Identifying a SpringBoot App
@SpringBootApplication
@EnableConfigurationProperties(AuthProperties.class)
@EnableScheduling
public class ItProjektTablohmApplication {

    public static void main(String[] args) {
        SpringApplication.run(ItProjektTablohmApplication.class, args);
    }

}
