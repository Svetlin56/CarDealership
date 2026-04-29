package com.example.cardealership.service;

import com.example.cardealership.web.error.BusinessValidationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileStorageServiceTest {

    @TempDir
    private Path tempDir;

    @Test
    void storeCarImageShouldSaveImageWhenExtensionMatchesFileContent() {
        FileStorageService service = new FileStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "car.png",
                "image/png",
                validPngBytes()
        );

        String imageUrl = service.storeCarImage(file);

        assertThat(imageUrl).startsWith("/uploads/cars/").endsWith(".png");
        assertThat(Files.exists(tempDir.resolve(imageUrl.substring("/uploads/cars/".length())))).isTrue();
    }

    @Test
    void storeCarImageShouldRejectFileWithAllowedExtensionButInvalidContent() {
        FileStorageService service = new FileStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "car.jpg",
                "image/jpeg",
                "<script>alert('not an image')</script>".getBytes()
        );

        assertThatThrownBy(() -> service.storeCarImage(file))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessage("The uploaded file is not a valid image.");
    }

    @Test
    void storeCarImageShouldRejectFileWhenExtensionDoesNotMatchFileContent() {
        FileStorageService service = new FileStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "car.jpg",
                "image/jpeg",
                validPngBytes()
        );

        assertThatThrownBy(() -> service.storeCarImage(file))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessage("The file content does not match the selected image type.");
    }

    private byte[] validPngBytes() {
        return new byte[]{
                (byte) 0x89, 0x50, 0x4E, 0x47,
                0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x0D,
                0x49, 0x48, 0x44, 0x52
        };
    }
}