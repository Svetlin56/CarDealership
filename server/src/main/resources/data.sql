INSERT INTO users (email, password_hash, role)
SELECT 'admin@cars.bg',
       '$2a$10$IuRbh312/9jBjFZi1ktSDOdYD5fAmGHMvygRQq5T.sFSkjStKLN6i',
       'ADMIN'
    WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@cars.bg'
);


INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'BMW','320d',2016,145000,'WBA8D3C56GK123456',18999.00,'https://media.drive.com.au/obj/tx_q:50,rs:auto:1920:1080:1/caradvice/private/25311edf22f469df49e5bb36e39c6221'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = 'WBA8D3C56GK123456');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'VW','Golf 7',2015,175000,'WVWZZZAUZFW123457',11990.00,'https://upload.wikimedia.org/wikipedia/commons/9/94/VW_Golf_2.0_TDI_BlueMotion_Technology_Highline_%28VII%29_%E2%80%93_Frontansicht%2C_28._Juli_2013%2C_M%C3%BCnster.jpg'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = 'WVWZZZAUZFW123457');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'Mercedes','C-Class',2017,120000,'WDD2052061R123458',25000.00,'https://carwow-uk-wp-3.imgix.net/C-Class_126_3.jpg'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = 'WDD2052061R123458');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'Audi','A4',2018,130000,'WAUZZZ8KXHA123459',24000.00,'https://media.ed.edmunds-media.com/audi/a4/2018/oem/2018_audi_a4_sedan_20-tfsi-prestige-quattro_fq_oem_1_1600.jpg'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = 'WAUZZZ8KXHA123459');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'BMW','X5',2019,95000,'WBAKF2C01KG123460',45000.00,'https://hips.hearstapps.com/hmg-prod/images/2019-bmw-x5-gallery-lead-1544808509.jpg'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = 'WBAKF2C01KG123460');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'Toyota','Corolla',2020,85000,'JTDBU4EE9LJ123461',19000.00,'https://toyotacanada.scene7.com/is/image/toyotacanada/2020_Corolla_Sedan?ts=1689854953729&$Media-Large$&dpr=off'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = 'JTDBU4EE9LJ123461');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'Ford','Mustang',2018,35000,'1FA6P8CF6JX123462',35000.00,'https://i.gaw.to/content/photos/31/45/314522_2018_Ford_Mustang.jpg'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = '1FA6P8CF6JX123462');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'Nissan','GTR',2018,25000,'1N4BL4BV6MN123463',240000.00,'https://www.cnet.com/a/img/resize/b36beb7e10fd1ddc4de41c2ffa08f7576a5c1aa2/hub/2018/07/03/0824a3cc-e0c7-4b6b-83ed-1b2051208627/ogi1-001-2018-nissan-gtr-review.jpg?auto=webp&fit=crop&height=675&width=1200'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = '1N4BL4BV6MN123463');

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url)
SELECT 'Chevrolet','Malibu',2019,105000,'1G1ZD5ST4KF123464',23000.00,'https://dealerimages.dealereprocess.com/image/upload/w_1000/1081654.jpg'
    WHERE NOT EXISTS (SELECT 1 FROM car WHERE vin = '1G1ZD5ST4KF123464');




INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 1, 1, 'Good automobile, service history', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 1);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 2, 1, 'Economic city automobile', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 2);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 3, 1, 'Comfortable luxury sedan', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 3);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 4, 1, 'Stylish and fast', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 4);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 5, 1, 'Spacious and premium SUV', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 5);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 6, 1, 'Reliable and fuel efficient', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 6);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 7, 1, 'Modern sedan, great for city driving', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 7);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 8, 1, 'Performance car with excellent speed', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 8);

INSERT INTO listing (car_id, seller_id, description, status, created_at)
SELECT 9, 1, 'Great daily driver with good mileage', 'ACTIVE', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM listing WHERE car_id = 9);


