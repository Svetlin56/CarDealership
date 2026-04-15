package com.example.cardealership.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    @JsonProperty("price")
    private BigDecimal price;

    @JsonProperty("Brand")
    private String brand;

    @JsonProperty("Model")
    private String model;

    @JsonProperty("predicted_price")
    private Double predictedPrice;

    @JsonProperty("score")
    private Double score;

    @JsonProperty("value_score")
    private Double valueScore;

    @JsonProperty("good_deal")
    private Boolean goodDeal;

    @JsonProperty("anomaly_ratio")
    private Double anomalyRatio;

    @JsonProperty("anomaly_label")
    private String anomalyLabel;

    @JsonProperty("car_type")
    private String carType;

    @JsonProperty("confidence")
    private Double confidence;

    @JsonProperty("explanation")
    private String explanation;
}