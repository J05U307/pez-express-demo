package demo.pez_express_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);      // hilos siempre activos
        executor.setMaxPoolSize(5);       // máximo bajo carga
        executor.setQueueCapacity(50);    // cola si todos los hilos están ocupados
        executor.setThreadNamePrefix("cocina-async-");
        executor.initialize();
        return executor;
    }
}