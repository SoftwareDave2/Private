package master.it_projekt_tablohm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// This is the annotation alias for many annotations
// Identifying a SpringBoot App
@SpringBootApplication
@EnableScheduling
public class ItProjektTablohmApplication {

    public static void main(String[] args) {
        SpringApplication.run(ItProjektTablohmApplication.class, args);
    }

}
