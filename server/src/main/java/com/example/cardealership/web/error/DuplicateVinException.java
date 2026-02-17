package com.example.cardealership.web.error;

public class DuplicateVinException extends RuntimeException {

    public DuplicateVinException(String vin) {
        super("Car with VIN " + vin + " already exists");
    }
}