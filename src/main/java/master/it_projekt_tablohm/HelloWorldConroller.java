package master.it_projekt_tablohm;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class HelloWorldConroller {

    // This is a endpoint
    @GetMapping(path = "/hello")
    public String helloWorld() {
        return "Hello World!";
    }

}
