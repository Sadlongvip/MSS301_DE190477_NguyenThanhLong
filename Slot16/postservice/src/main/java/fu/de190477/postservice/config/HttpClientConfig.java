package fu.de190477.postservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cung cấp bean ObjectMapper để PostServiceImpl dùng convertValue()
 * chuyển đổi LinkedHashMap trong ApiResponse.data nhận qua Feign thành object UserDTO.
 */
@Configuration
public class HttpClientConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}

