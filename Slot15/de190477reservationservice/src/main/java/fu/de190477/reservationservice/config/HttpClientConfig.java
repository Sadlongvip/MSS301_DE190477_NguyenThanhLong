package fu.de190477.reservationservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cung cấp bean ObjectMapper để PostServiceImpl dùng convertValue()
 * chuyển đổi LinkedHashMap trong ApiResponse.data nhận qua Feign thành object RoomDTO.
 */
@Configuration
public class HttpClientConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}

