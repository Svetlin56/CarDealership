package com.example.cardealership.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MlRecommendationResponse {

    @JsonProperty("Year")
    private Integer Year;

    @JsonProperty("Engine_Size")
    private Double Engine_Size;

    @JsonProperty("Fuel_Type")
    private String Fuel_Type;

    @JsonProperty("Transmission")
    private String Transmission;

    @JsonProperty("Mileage")
    private Long Mileage;

    @JsonProperty("Doors")
    private Integer Doors;

    @JsonProperty("Owner_Count")
    private Integer Owner_Count;

    @JsonProperty("price")
    private BigDecimal price;

    @JsonProperty("Brand")
    private String Brand;

    @JsonProperty("Model")
    private String Model;
}