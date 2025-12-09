INSERT INTO users (email, password_hash, role)
VALUES ('admin@cars.bg', '$2a$10$F2x2m2Qm0fQ8.zfDgX4l3uOa0w8iU3Y0i8bM7C8kVv4x1g2mP8r6K', 'ADMIN');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
VALUES
    ('BMW','320d',2016,145000,'WBA8D3C56GK123456',18999.90,'https://imgd.aeplcdn.com/664x374/cw/cars/bmw/3-series.jpg?q=80'),
    ('VW','Golf 7',2015,175000,'WVWZZZAUZFW123456',11990.00,'https://upload.wikimedia.org/wikipedia/commons/9/94/VW_Golf_2.0_TDI_BlueMotion_Technology_Highline_%28VII%29_%E2%80%93_Frontansicht%2C_28._Juli_2013%2C_M%C3%BCnster.jpg');

INSERT INTO listing (car_id, seller_id, description, status, created_at)
VALUES (1, 1, 'Good automobile, service history', 'ACTIVE', CURRENT_TIMESTAMP),
       (2, 1, 'Economic city automobile', 'ACTIVE', CURRENT_TIMESTAMP);
