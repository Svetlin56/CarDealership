package com.example.cardealership.web.error;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super("%s with %s '%s' was not found.".formatted(resource, field, value));
    }
}