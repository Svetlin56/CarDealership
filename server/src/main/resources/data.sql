INSERT INTO users (email, password_hash, role)
SELECT 'admin@cars.bg',
       '$2a$10$7eqJtq98hPqEX7fNZaFWoObWvY1VE3DybZ0SqGmoNcnQ9Zp3YvYy6',
       'ADMIN'
    WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@cars.bg'
);


INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'BMW','320d',2016,145000,'WBA8D3C56GK123456',18999.90,'https://imgd.aeplcdn.com/664x374/cw/cars/bmw/3-series.jpg?q=80'
    WHERE NOT EXISTS (SELECT 1 FROM car);

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'VW','Golf 7',2015,175000,'WVWZZZAUZFW123456',11990.00,'https://upload.wikimedia.org/wikipedia/commons/9/94/VW_Golf_2.0_TDI_BlueMotion_Technology_Highline_%28VII%29_%E2%80%93_Frontansicht%2C_28._Juli_2013%2C_M%C3%BCnster.jpg'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = 'WVWZZZAUZFW123456');

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 1, 1, 'Good automobile, service history', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 2, 1, 'Economic city automobile', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 2);
