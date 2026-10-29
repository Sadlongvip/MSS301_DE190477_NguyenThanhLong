package fu.de190477.postservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class De190477PostserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(De190477PostserviceApplication.class, args);
    }

}

