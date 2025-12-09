CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
    );

CREATE TABLE IF NOT EXISTS car (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    prod_year INT,
    mileage BIGINT,
    vin VARCHAR(255),
    price DOUBLE PRECISION NOT NULL,
    image_url VARCHAR(1000)
    );

CREATE TABLE IF NOT EXISTS listing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    car_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    description VARCHAR(2000),
    status VARCHAR(20),
    created_at TIMESTAMP,
    CONSTRAINT fk_listing_car FOREIGN KEY (car_id) REFERENCES car(id),
    CONSTRAINT fk_listing_user FOREIGN KEY (seller_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS inquiry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    message VARCHAR(2000),
    created_at TIMESTAMP,
    CONSTRAINT fk_inquiry_listing FOREIGN KEY (listing_id) REFERENCES listing(id)
    );
