package com.example.cardealership.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MlRecommendationRequest {

    private Integer Year;
    private Double Engine_Size;
    private String Fuel_Type;
    private String Transmission;
    private Long Mileage;
    private Integer Doors;
    private Integer Owner_Count;
    private BigDecimal price;
    private String Brand;
    private String Model;
}