package com.example.cardealership.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final Path carImagesDirectory;

    public WebConfig(@Value("${app.storage.car-images-dir}") String carImagesDir) {
        this.carImagesDirectory = Paths.get(carImagesDir).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/cars/**")
                .addResourceLocations(carImagesDirectory.toUri().toString());
    }
}