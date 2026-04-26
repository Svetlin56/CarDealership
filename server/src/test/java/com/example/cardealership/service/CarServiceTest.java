package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.service.car.CarMapper;
import com.example.cardealership.service.car.CarSpecificationBuilder;
import com.example.cardealership.service.car.CarValidator;
import com.example.cardealership.web.error.DuplicateVinException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
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

    @Mock
    private FileStorageService fileStorageService;

    private CarService carService;

    private Car car;

    @BeforeEach
    void setUp() {
        CarMapper carMapper = new CarMapper();
        CarValidator carValidator = new CarValidator(carRepository, carMapper);
        CarSpecificationBuilder carSpecificationBuilder = new CarSpecificationBuilder();

        carService = new CarService(
                carRepository,
                listingRepository,
                fileStorageService,
                carValidator,
                carMapper,
                carSpecificationBuilder
        );

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
                .deleted(false)
                .build();
    }

    @Test
    void createShouldThrowWhenVinAlreadyExists() {
        CarDtos.CreateCarRequest request = new CarDtos.CreateCarRequest();
        request.setVin("WBA12345678901234");

        when(carRepository.existsByVin("WBA12345678901234")).thenReturn(true);

        assertThatThrownBy(() -> carService.create(request))
                .isInstanceOf(DuplicateVinException.class)
                .hasMessage("Car with this VIN already exists");

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

        when(carRepository.existsByVin("WBA12345678901234")).thenReturn(false);
        when(carRepository.save(any(Car.class))).thenReturn(car);

        CarDtos.CarResponse response = carService.create(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getMake()).isEqualTo("BMW");
        assertThat(response.getModel()).isEqualTo("320d");
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

        verify(carRepository).findAll(any(Specification.class), any(Pageable.class));

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getSortBy()).isEqualTo("id");
        assertThat(response.getSortDir()).isEqualTo("asc");
    }

    @Test
    void findByIdShouldThrowWhenCarMissing() {
        when(carRepository.findByIdAndDeletedFalse(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Car with id '99' was not found.");
    }

    @Test
    void deleteShouldSoftDeleteCarAndHideListings() {
        Car carToDelete = Car.builder()
                .id(5L)
                .make("Audi")
                .model("A4")
                .prodYear(2019)
                .mileage(90000L)
                .vin("WAUZZZ8K9DA123456")
                .price(new BigDecimal("21000"))
                .imageUrl("/uploads/cars/test-image.jpg")
                .deleted(false)
                .build();

        Listing firstListing = Listing.builder()
                .id(10L)
                .car(carToDelete)
                .status(Listing.Status.ACTIVE)
                .build();

        Listing secondListing = Listing.builder()
                .id(11L)
                .car(carToDelete)
                .status(Listing.Status.SOLD)
                .build();

        List<Listing> listings = List.of(firstListing, secondListing);

        when(carRepository.findByIdAndDeletedFalse(5L)).thenReturn(Optional.of(carToDelete));
        when(listingRepository.findAllByCar_Id(5L)).thenReturn(listings);

        carService.delete(5L);

        assertThat(carToDelete.isDeleted()).isTrue();
        assertThat(firstListing.getStatus()).isEqualTo(Listing.Status.HIDDEN);
        assertThat(secondListing.getStatus()).isEqualTo(Listing.Status.HIDDEN);

        InOrder inOrder = inOrder(listingRepository, carRepository);

        inOrder.verify(listingRepository).findAllByCar_Id(5L);
        inOrder.verify(listingRepository).saveAll(listings);
        inOrder.verify(carRepository).save(carToDelete);

        verify(carRepository, never()).deleteById(anyLong());
        verify(fileStorageService, never()).deleteCarImage(anyString());
    }
}