package fu.de190477.reservationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class De190477ReservationserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(De190477ReservationserviceApplication.class, args);
    }

}

