package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.web.error.DuplicateVinException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarServiceTest {

    @Mock
    private CarRepository carRepository;

    @Mock
    private ListingRepository listingRepository;

    @InjectMocks
    private CarService carService;

    private Car car;

    @BeforeEach
    void setUp() {
        car = Car.builder()
                .id(1L)
                .make("BMW")
                .model("320d")
                .prodYear(2020)
                .mileage(120000L)
                .vin("WBA12345678901234")
                .price(new BigDecimal("24500"))
                .fuelType("Diesel")
                .transmission("Automatic")
                .doors(4)
                .ownerCount(1)
                .build();
    }

    @Test
    void createShouldThrowWhenVinAlreadyExists() {
        CarDtos.CreateCarRequest request = new CarDtos.CreateCarRequest();
        request.setVin("WBA12345678901234");

        when(carRepository.existsByVin(request.getVin())).thenReturn(true);

        assertThatThrownBy(() -> carService.create(request))
                .isInstanceOf(DuplicateVinException.class)
                .hasMessageContaining(request.getVin());

        verify(carRepository, never()).save(any(Car.class));
    }

    @Test
    void createShouldPersistAndReturnMappedResponse() {
        CarDtos.CreateCarRequest request = new CarDtos.CreateCarRequest();
        request.setMake("BMW");
        request.setModel("320d");
        request.setYear(2020);
        request.setMileage(120000L);
        request.setVin("WBA12345678901234");
        request.setPrice(new BigDecimal("24500"));
        request.setFuelType("Diesel");
        request.setTransmission("Automatic");
        request.setDoors(4);
        request.setOwnerCount(1);

        when(carRepository.existsByVin(request.getVin())).thenReturn(false);
        when(carRepository.save(any(Car.class))).thenReturn(car);

        CarDtos.CarResponse response = carService.create(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getMake()).isEqualTo("BMW");
        assertThat(response.getYear()).isEqualTo(2020);
        verify(carRepository).save(any(Car.class));
    }

    @Test
    void findAllShouldNormalizeRequestValues() {
        CarDtos.CarSearchRequest request = CarDtos.CarSearchRequest.builder()
                .search("  bmw  ")
                .priceFrom(new BigDecimal("-10"))
                .priceTo(new BigDecimal("25000"))
                .page(-3)
                .size(999)
                .sortBy("unsupported")
                .sortDir("asc")
                .build();

        when(carRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(car)));

        CarDtos.CarPageResponse response = carService.findAll(request);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(carRepository).findAll(any(Specification.class), pageableCaptor.capture());

        Pageable pageable = pageableCaptor.getValue();
        assertThat(pageable.getPageNumber()).isEqualTo(0);
        assertThat(pageable.getPageSize()).isEqualTo(50);
        assertThat(pageable.getSort().getOrderFor("id")).isNotNull();

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getSortBy()).isEqualTo("id");
        assertThat(response.getSortDir()).isEqualTo("asc");
    }

    @Test
    void findByIdShouldThrowWhenCarMissing() {
        when(carRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carService.findById(99L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("Car with id 99 was not found.");
    }

    @Test
    void deleteShouldRemoveListingsFirstAndThenCar() {
        carService.delete(5L);

        verify(listingRepository).deleteByCar_Id(5L);
        verify(carRepository).deleteById(5L);
    }
}