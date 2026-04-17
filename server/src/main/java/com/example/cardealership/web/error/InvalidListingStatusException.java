package com.example.cardealership.web.error;

public class InvalidListingStatusException extends BusinessValidationException {

    public InvalidListingStatusException(String status) {
        super("Invalid listing status: " + status);
    }
}