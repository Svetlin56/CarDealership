package com.example.cardealership.service;

import com.example.cardealership.domain.AuthProvider;
import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Inquiry;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.domain.Role;
import com.example.cardealership.domain.User;
import com.example.cardealership.dto.InquiryDtos;
import com.example.cardealership.repository.InquiryRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.web.error.BusinessValidationException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InquiryServiceTest {

    @Mock
    private InquiryRepository inquiryRepo;

    @Mock
    private ListingRepository listingRepo;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private InquiryService inquiryService;

    private Car car;
    private Listing listing;
    private InquiryDtos.InquiryRequest request;

    @BeforeEach
    void setUp() {
        car = Car.builder()
                .id(10L)
                .make("Audi")
                .model("A4")
                .prodYear(2019)
                .price(new BigDecimal("19999"))
                .vin("WAU12345678901234")
                .deleted(false)
                .build();

        User seller = User.builder()
                .id(1L)
                .email("seller@test.com")
                .passwordHash("hash")
                .role(Role.USER)
                .authProvider(AuthProvider.LOCAL)
                .build();

        listing = Listing.builder()
                .id(100L)
                .car(car)
                .seller(seller)
                .description("Clean car")
                .status(Listing.Status.ACTIVE)
                .build();

        request = new InquiryDtos.InquiryRequest();
        request.setName(" John Doe ");
        request.setEmail(" JOHN@EXAMPLE.COM ");
        request.setPhone(" +359888123456 ");
        request.setMessage(" I am interested in this car. ");
    }

    @Test
    void createShouldSaveInquiryAndSendNotificationEmail() {
        when(listingRepo.findByIdAndStatus(100L, Listing.Status.ACTIVE))
                .thenReturn(Optional.of(listing));

        when(inquiryRepo.save(any(Inquiry.class)))
                .thenAnswer(invocation -> {
                    Inquiry inquiry = invocation.getArgument(0);
                    inquiry.setId(200L);
                    return inquiry;
                });

        InquiryDtos.InquiryResponse response = inquiryService.create(100L, request);

        assertThat(response.getId()).isEqualTo(200L);
        assertThat(response.getListingId()).isEqualTo(100L);
        assertThat(response.getName()).isEqualTo("John Doe");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        assertThat(response.getPhone()).isEqualTo("+359888123456");
        assertThat(response.getMessage()).isEqualTo("I am interested in this car.");

        verify(emailService).sendInquiry(
                eq("seller@test.com"),
                eq("New inquiry for your listing"),
                anyString()
        );
    }

    @Test
    void createShouldSaveInquiryEvenWhenNotificationEmailFails() {
        when(listingRepo.findByIdAndStatus(100L, Listing.Status.ACTIVE))
                .thenReturn(Optional.of(listing));

        when(inquiryRepo.save(any(Inquiry.class)))
                .thenAnswer(invocation -> {
                    Inquiry inquiry = invocation.getArgument(0);
                    inquiry.setId(200L);
                    return inquiry;
                });

        doThrow(new RuntimeException("Mail server is unavailable"))
                .when(emailService)
                .sendInquiry(
                        eq("seller@test.com"),
                        eq("New inquiry for your listing"),
                        anyString()
                );

        InquiryDtos.InquiryResponse response = inquiryService.create(100L, request);

        assertThat(response.getId()).isEqualTo(200L);
        assertThat(response.getListingId()).isEqualTo(100L);
        assertThat(response.getEmail()).isEqualTo("john@example.com");

        verify(inquiryRepo).save(any(Inquiry.class));
        verify(emailService).sendInquiry(
                eq("seller@test.com"),
                eq("New inquiry for your listing"),
                anyString()
        );
    }

    @Test
    void createShouldFailWhenListingIsMissing() {
        when(listingRepo.findByIdAndStatus(404L, Listing.Status.ACTIVE))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> inquiryService.create(404L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Listing with id '404' was not found.");

        verify(inquiryRepo, never()).save(any(Inquiry.class));
        verify(emailService, never()).sendInquiry(anyString(), anyString(), anyString());
    }

    @Test
    void createShouldFailWhenCarIsDeleted() {
        car.setDeleted(true);

        when(listingRepo.findByIdAndStatus(100L, Listing.Status.ACTIVE))
                .thenReturn(Optional.of(listing));

        assertThatThrownBy(() -> inquiryService.create(100L, request))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessage("Cannot send inquiry for a deleted car.");

        verify(inquiryRepo, never()).save(any(Inquiry.class));
        verify(emailService, never()).sendInquiry(anyString(), anyString(), anyString());
    }
}