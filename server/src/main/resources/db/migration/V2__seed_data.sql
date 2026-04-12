INSERT INTO users (email, password_hash, role)
VALUES (
           '${adminEmail}',
           '${adminPasswordHash}',
           'ADMIN'
       );

INSERT INTO car (make, model, prod_year, mileage, vin, price, image_url) VALUES
    ('BMW','320d',2016,145000,'WBA8D3C54GK421563',6000.00,'https://images.unsplash.com/photo-1686889903827-81e274b51bd4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('VW','Golf 7',2015,175000,'WVWZZZ1KZFW247681',9500.00,'https://images.unsplash.com/photo-1683444126212-50c0aa2a421b?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('Mercedes','C-Class',2017,120000,'WDD2052061F784215',12000.00,'https://images.unsplash.com/photo-1686562483617-3cf08d81e117?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('Audi','A4',2018,130000,'WAUZZZ8KXJA635824',8000.00,'https://images.unsplash.com/photo-1622198750361-6e94cb857945?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('BMW','X5',2019,95000,'WBAKF2C02K0A52618',20000.00,'https://images.unsplash.com/photo-1652453456487-f5be1b89a38b?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('Toyota','Corolla',2020,85000,'JTDBU4EE0LJ584216',10000.00,'https://images.unsplash.com/photo-1638618164682-12b986ec2a75?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('Ford','Mustang',2018,35000,'1FA6P8CF8J5173624',27000.00,'https://images.unsplash.com/photo-1547744152-14d985cb937f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('Nissan','GTR',2018,25000,'JN1AR5EF2JM483215',15000.00,'https://images.unsplash.com/photo-1609964729554-a02fb2a04830?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('Chevrolet','Malibu',2019,105000,'1G1ZD5ST6KF742138',14000.00,'https://images.unsplash.com/photo-1670800811775-63b858f1b37a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

INSERT INTO listing (car_id, seller_id, description, status)
VALUES
    (1, 1, 'Good automobile, service history', 'ACTIVE'),
    (2, 1, 'Economic city automobile', 'ACTIVE'),
    (3, 1, 'Comfortable luxury sedan', 'ACTIVE'),
    (4, 1, 'Stylish and fast', 'ACTIVE'),
    (5, 1, 'Spacious and premium SUV', 'ACTIVE'),
    (6, 1, 'Reliable and fuel efficient', 'ACTIVE'),
    (7, 1, 'Modern sedan, great for city driving', 'ACTIVE'),
    (8, 1, 'Performance car with excellent speed', 'ACTIVE'),
    (9, 1, 'Great daily driver with good mileage', 'ACTIVE');