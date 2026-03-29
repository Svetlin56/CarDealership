ALTER TABLE car
    ADD COLUMN engine_size DECIMAL(4,1) NULL,
    ADD COLUMN fuel_type VARCHAR(50) NULL,
    ADD COLUMN transmission VARCHAR(50) NULL,
    ADD COLUMN doors INT NULL,
    ADD COLUMN owner_count INT NULL;

UPDATE car
SET engine_size = 2.0,
    fuel_type = 'Diesel',
    transmission = 'Automatic',
    doors = 4,
    owner_count = 2
WHERE make = 'BMW' AND model = '320d';

UPDATE car
SET engine_size = 2.0,
    fuel_type = 'Diesel',
    transmission = 'Manual',
    doors = 4,
    owner_count = 3
WHERE make = 'VW' AND model = 'Golf 7';

UPDATE car
SET engine_size = 2.2,
    fuel_type = 'Diesel',
    transmission = 'Automatic',
    doors = 4,
    owner_count = 2
WHERE make = 'Mercedes' AND model = 'C-Class';

UPDATE car
SET engine_size = 2.0,
    fuel_type = 'Petrol',
    transmission = 'Automatic',
    doors = 4,
    owner_count = 2
WHERE make = 'Audi' AND model = 'A4';

UPDATE car
SET engine_size = 3.0,
    fuel_type = 'Diesel',
    transmission = 'Automatic',
    doors = 4,
    owner_count = 2
WHERE make = 'BMW' AND model = 'X5';

UPDATE car
SET engine_size = 1.8,
    fuel_type = 'Hybrid',
    transmission = 'Automatic',
    doors = 4,
    owner_count = 1
WHERE make = 'Toyota' AND model = 'Corolla';

UPDATE car
SET engine_size = 5.0,
    fuel_type = 'Petrol',
    transmission = 'Manual',
    doors = 2,
    owner_count = 2
WHERE make = 'Ford' AND model = 'Mustang';

UPDATE car
SET engine_size = 3.8,
    fuel_type = 'Petrol',
    transmission = 'Automatic',
    doors = 2,
    owner_count = 1
WHERE make = 'Nissan' AND model = 'GTR';

UPDATE car
SET engine_size = 1.5,
    fuel_type = 'Petrol',
    transmission = 'Automatic',
    doors = 4,
    owner_count = 2
WHERE make = 'Chevrolet' AND model = 'Malibu';

UPDATE car
SET engine_size = COALESCE(engine_size, 2.0),
    fuel_type = COALESCE(fuel_type, 'Petrol'),
    transmission = COALESCE(transmission, 'Automatic'),
    doors = COALESCE(doors, 4),
    owner_count = COALESCE(owner_count, 1);