package com.example.cardealership.web.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final ApiErrorFactory apiErrorFactory;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> Objects.requireNonNullElse(fe.getDefaultMessage(), "Invalid value"),
                        (a, b) -> a
                ));

        return apiErrorFactory.build(HttpStatus.BAD_REQUEST, "Validation failed", request, errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraint(
            ConstraintViolationException ex,
            HttpServletRequest request
    ) {
        Map<String, String> errors = ex.getConstraintViolations()
                .stream()
                .collect(Collectors.toMap(
                        v -> v.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (a, b) -> a
                ));

        return apiErrorFactory.build(HttpStatus.BAD_REQUEST, "Validation failed", request, errors);
    }

    @ExceptionHandler(DuplicateVinException.class)
    public ResponseEntity<ApiError> handleDuplicateVin(
            DuplicateVinException ex,
            HttpServletRequest request
    ) {
        return apiErrorFactory.build(HttpStatus.CONFLICT, "Validation failed", request, Map.of("vin", ex.getMessage()));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailExists(
            EmailAlreadyExistsException ex,
            HttpServletRequest request
    ) {
        return apiErrorFactory.build(HttpStatus.CONFLICT, ex.getMessage(), request, null);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
        return apiErrorFactory.build(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ApiError> handleBusinessValidation(
            BusinessValidationException ex,
            HttpServletRequest request
    ) {
        return apiErrorFactory.build(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request
    ) {
        return apiErrorFactory.build(HttpStatus.UNAUTHORIZED, "Invalid email or password", request, null);
    }

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ApiError> handleAccessDenied(
            Exception ex,
            HttpServletRequest request
    ) {
        return apiErrorFactory.build(HttpStatus.FORBIDDEN, "Forbidden", request, null);
    }

    @ExceptionHandler(MlServiceUnavailableException.class)
    public ResponseEntity<ApiError> handleMlUnavailable(
            MlServiceUnavailableException ex,
            HttpServletRequest request
    ) {
        log.warn("ML service unavailable for path={}: {}", request.getRequestURI(), ex.getMessage());
        return apiErrorFactory.build(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), request, null);
    }

    @ExceptionHandler(MlPredictionException.class)
    public ResponseEntity<ApiError> handleMlFailure(
            MlPredictionException ex,
            HttpServletRequest request
    ) {
        log.warn("ML prediction failure for path={}: {}", request.getRequestURI(), ex.getMessage());
        return apiErrorFactory.build(HttpStatus.BAD_GATEWAY, ex.getMessage(), request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleOthers(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error("Unhandled exception for path={}", request.getRequestURI(), ex);
        return apiErrorFactory.build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", request, null);
    }
}