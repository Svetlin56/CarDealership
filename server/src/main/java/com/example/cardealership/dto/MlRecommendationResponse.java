package com.example.cardealership.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MlRecommendationResponse {

    @JsonProperty("Year")
    private Integer year;

    @JsonProperty("Engine_Size")
    private Double engineSize;

    @JsonProperty("Fuel_Type")
    private String fuelType;

    @JsonProperty("Transmission")
    private String transmission;

    @JsonProperty("Mileage")
    private Long mileage;

    @JsonProperty("Doors")
    private Integer doors;

    @JsonProperty("Owner_Count")
    private Integer ownerCount;

    @JsonProperty("predicted_price")
    private Double predictedPrice;

    @JsonProperty("score")
    private Double score;

    @JsonProperty("value_score")
    private Double valueScore;

    @JsonProperty("good_deal")
    private Boolean goodDeal;

    @JsonProperty("price")
    private Double price;
}