package com.example.cardealership.service;

import com.example.cardealership.web.error.BusinessValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final int MAGIC_BYTES_LENGTH = 12;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Map<String, Set<String>> EXTENSIONS_BY_IMAGE_TYPE = Map.of(
            "jpeg", Set.of("jpg", "jpeg"),
            "png", Set.of("png"),
            "webp", Set.of("webp"),
            "gif", Set.of("gif")
    );

    private final Path carImagesDirectory;

    public FileStorageService(@Value("${app.storage.car-images-dir}") String carImagesDir) {
        this.carImagesDirectory = Paths.get(carImagesDir).toAbsolutePath().normalize();
        createDirectories();
    }

    public String storeCarImage(MultipartFile file) {
        String extension = validateFile(file);
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

    private String validateFile(MultipartFile file) {
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

        String detectedImageType = detectImageType(file);
        Set<String> matchingExtensions = EXTENSIONS_BY_IMAGE_TYPE.get(detectedImageType);
        if (matchingExtensions == null || !matchingExtensions.contains(extension)) {
            throw new BusinessValidationException("The file content does not match the selected image type.");
        }

        return extension;
    }

    private String detectImageType(MultipartFile file) {
        byte[] magicBytes = readMagicBytes(file);

        if (isJpeg(magicBytes)) {
            return "jpeg";
        }

        if (isPng(magicBytes)) {
            return "png";
        }

        if (isWebp(magicBytes)) {
            return "webp";
        }

        if (isGif(magicBytes)) {
            return "gif";
        }

        throw new BusinessValidationException("The uploaded file is not a valid image.");
    }

    private byte[] readMagicBytes(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] buffer = inputStream.readNBytes(MAGIC_BYTES_LENGTH);
            if (buffer.length < MAGIC_BYTES_LENGTH) {
                throw new BusinessValidationException("The uploaded file is not a valid image.");
            }
            return buffer;
        } catch (IOException ex) {
            throw new BusinessValidationException("Could not read the image file.");
        }
    }

    private boolean isJpeg(byte[] bytes) {
        return bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF;
    }

    private boolean isPng(byte[] bytes) {
        byte[] pngSignature = new byte[]{
                (byte) 0x89, 0x50, 0x4E, 0x47,
                0x0D, 0x0A, 0x1A, 0x0A
        };
        return startsWith(bytes, pngSignature);
    }

    private boolean isWebp(byte[] bytes) {
        return bytes.length >= MAGIC_BYTES_LENGTH
                && bytes[0] == 'R'
                && bytes[1] == 'I'
                && bytes[2] == 'F'
                && bytes[3] == 'F'
                && bytes[8] == 'W'
                && bytes[9] == 'E'
                && bytes[10] == 'B'
                && bytes[11] == 'P';
    }

    private boolean isGif(byte[] bytes) {
        return startsWith(bytes, "GIF87a".getBytes(StandardCharsets.US_ASCII))
                || startsWith(bytes, "GIF89a".getBytes(StandardCharsets.US_ASCII));
    }

    private boolean startsWith(byte[] bytes, byte[] signature) {
        return bytes.length >= signature.length
                && Arrays.equals(Arrays.copyOf(bytes, signature.length), signature);
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