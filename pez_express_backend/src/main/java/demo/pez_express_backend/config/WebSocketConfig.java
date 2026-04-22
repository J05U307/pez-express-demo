package demo.pez_express_backend.config;

import demo.pez_express_backend.service.ComandaService;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${FRONTEND_URL}")
     private String frontendUrl;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");        // canal de suscripción
        config.setApplicationDestinationPrefixes("/app"); // prefijo para enviar
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        frontendUrl,
                        "http://localhost:5173"
                        //"http://192.168.1.164:5173"
                )
                .withSockJS();
    }

    @Bean
    public ApplicationListener<SessionSubscribeEvent> onSubscribe(
            SimpMessagingTemplate messaging, ComandaService comandaService) {
        return event -> {
            String destination = (String) event.getMessage()
                    .getHeaders().get("simpDestination");
            if ("/topic/cocina".equals(destination)) {
                // Cliente recién conectado → enviarle el estado actual
                messaging.convertAndSend("/topic/cocina",
                        comandaService.listarActivas());
            }
        };
    }
}
