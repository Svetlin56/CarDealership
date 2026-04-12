package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.domain.Role;
import com.example.cardealership.domain.User;
import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {

    @Mock
    private ListingRepository listingRepo;

    @Mock
    private CarRepository carRepo;

    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private ListingService listingService;

    private User seller;
    private Car car;
    private Listing listing;

    @BeforeEach
    void setUp() {
        seller = User.builder()
                .id(1L)
                .email("seller@test.com")
                .passwordHash("hash")
                .role(Role.USER)
                .build();

        car = Car.builder()
                .id(10L)
                .make("Audi")
                .model("A4")
                .prodYear(2019)
                .price(new BigDecimal("19999"))
                .vin("WAU12345678901234")
                .build();

        listing = Listing.builder()
                .id(100L)
                .seller(seller)
                .car(car)
                .description("Clean car")
                .status(Listing.Status.ACTIVE)
                .build();
    }

    @Test
    void createByEmailShouldCreateListingForExistingUserAndCar() {
        ListingDtos.CreateListingRequest request = new ListingDtos.CreateListingRequest();
        request.setCarId(10L);
        request.setDescription("Clean car");

        when(userRepo.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
        when(carRepo.findById(10L)).thenReturn(Optional.of(car));
        when(listingRepo.save(any(Listing.class))).thenReturn(listing);

        ListingDtos.ListingResponse response = listingService.createByEmail("seller@test.com", request);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getSeller().getEmail()).isEqualTo("seller@test.com");
        assertThat(response.getCar().getId()).isEqualTo(10L);
        assertThat(response.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void createByEmailShouldFailWhenUserMissing() {
        ListingDtos.CreateListingRequest request = new ListingDtos.CreateListingRequest();
        request.setCarId(10L);

        when(userRepo.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> listingService.createByEmail("missing@test.com", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
    }

    @Test
    void createByEmailShouldFailWhenCarMissing() {
        ListingDtos.CreateListingRequest request = new ListingDtos.CreateListingRequest();
        request.setCarId(10L);

        when(userRepo.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
        when(carRepo.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> listingService.createByEmail("seller@test.com", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Car not found");
    }

    @Test
    void allShouldMapRepositoryResults() {
        when(listingRepo.findAll()).thenReturn(List.of(listing));

        List<ListingDtos.ListingResponse> response = listingService.all();

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().getDescription()).isEqualTo("Clean car");
    }

    @Test
    void updateStatusShouldChangeStatusWhenValid() {
        ListingDtos.UpdateListingStatusRequest request = new ListingDtos.UpdateListingStatusRequest();
        request.setStatus("sold");

        when(listingRepo.findById(100L)).thenReturn(Optional.of(listing));
        when(listingRepo.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ListingDtos.ListingResponse response = listingService.updateStatus(100L, request);

        assertThat(response.getStatus()).isEqualTo("SOLD");
    }

    @Test
    void updateStatusShouldThrowWhenStatusInvalid() {
        ListingDtos.UpdateListingStatusRequest request = new ListingDtos.UpdateListingStatusRequest();
        request.setStatus("archived");

        when(listingRepo.findById(100L)).thenReturn(Optional.of(listing));

        assertThatThrownBy(() -> listingService.updateStatus(100L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid status value");
    }
}