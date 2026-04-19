package com.example.cardealership.service;

import com.example.cardealership.web.error.BusinessValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final Path carImagesDirectory;

    public FileStorageService(@Value("${app.storage.car-images-dir}") String carImagesDir) {
        this.carImagesDirectory = Paths.get(carImagesDir).toAbsolutePath().normalize();
        createDirectories();
    }

    public String storeCarImage(MultipartFile file) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String storedFilename = UUID.randomUUID() + "." + extension;
        Path targetFile = carImagesDirectory.resolve(storedFilename).normalize();

        if (!targetFile.startsWith(carImagesDirectory)) {
            throw new BusinessValidationException("Invalid file path.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessValidationException("Could not save the image file.");
        }

        return "/uploads/cars/" + storedFilename;
    }

    public void deleteCarImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank() || !imageUrl.startsWith("/uploads/cars/")) {
            return;
        }

        String filename = imageUrl.substring("/uploads/cars/".length()).trim();
        if (filename.isEmpty() || filename.contains("/") || filename.contains("\\")) {
            return;
        }

        Path filePath = carImagesDirectory.resolve(filename).normalize();
        if (!filePath.startsWith(carImagesDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Intentionally ignored to avoid blocking car deletion when the file is already missing.
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessValidationException("Please select an image file.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessValidationException("Image size must be up to 5 MB.");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessValidationException("Only JPG, JPEG, PNG, WEBP or GIF images are allowed.");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || filename.isBlank() || !filename.contains(".")) {
            throw new BusinessValidationException("The uploaded file must have a valid extension.");
        }

        String extension = filename.substring(filename.lastIndexOf('.') + 1).trim().toLowerCase();
        if (extension.isBlank()) {
            throw new BusinessValidationException("The uploaded file must have a valid extension.");
        }

        return extension;
    }

    private void createDirectories() {
        try {
            Files.createDirectories(carImagesDirectory);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create car images directory.", ex);
        }
    }
}