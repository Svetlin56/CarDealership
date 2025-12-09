package com.example.cardealership.web.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.Map;

@Getter @AllArgsConstructor
public class ApiError {
    private String message;
    private Map<String, String> fieldErrors;
}
