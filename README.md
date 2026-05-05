📌 Overview

This project consists of:

Frontend (React + TypeScript) – user interface
Backend (Spring Boot) – REST API, authentication, authorization and business logic
Database (MySQL) – persistent storage managed through Flyway migrations
ML Service (Python) – recommendation engine

The system allows users to:

Browse available cars
View detailed car listings
Search and filter cars by brand, model, VIN, fuel type, transmission, year and price
Register and authenticate, including Google OAuth
Receive car recommendations
Send inquiries for car listings
Admins can create, edit, delete and manage cars

🏗️ Architecture
 
                     React Frontend
                           ↓

                     Spring Boot API 

               ↓                          ↓
       MySQL Database      ML Recommendation Service (Python) 

Frontend communicates with the backend via REST API
Backend handles authentication, authorization, validation, business logic and persistence
MySQL stores users, cars, listings and inquiries
Flyway manages database schema migrations
ML service provides recommendation results based on vehicle data and vehicle-related criteria

⚙️ Tech Stack

Frontend
React
TypeScript
Vite
React Router
Axios
Context API
Bootstrap
Vitest
Backend
Java 21
Spring Boot
Spring Security
RESTful API
JWT authentication stored in an HttpOnly cookie
CSRF protection
Google OAuth
Role-based access control
Flyway Database Migrations
MySQL
Spring Data JPA
Springdoc OpenAPI / Swagger
Testcontainers
Machine Learning Service
Python
Flask
pandas
scikit-learn
joblib
CSV dataset (cars.csv)

✨ Features

🔐 Authentication & Authorization

User registration and login
Google OAuth integration
JWT authentication stored in an HttpOnly cookie
CSRF protection for state-changing requests
Role-based access control (USER / ADMIN)
Protected frontend routes
Admin-only functionality

🚘 Car Listings

Browse all available cars
View detailed car information
Search and filter listings
Pagination and sorting
Upload and manage car images
Admin CRUD operations
Soft delete support

📩 Inquiries

Users can send inquiries for car listings
Inquiry information is stored in the database
Email notification support for listing inquiries

🤖 Recommendations

ML-powered car suggestions
Based on vehicle characteristics and dataset analysis
Provided through a separate Python ML service
Backend communicates with the ML service through a REST API

📊 Dashboard

Admin dashboard for managing cars
Create new cars
Edit existing cars
Delete cars
Upload car images
Search inside the admin panel

📁 Project Structure

          CarDealership/
          │
          ├── client/      # React + TypeScript frontend
          ├── server/      # Spring Boot backend
          ├── ml-service/  # Python ML service
          │
          └── README.md
🚀 Getting Started
Prerequisites

Before running the project locally, make sure you have installed:

Java 21
Maven 3.9+
Node.js 18+
npm
Python 3.10+
MySQL 8+
Environment Variables

The backend uses environment variables for database access, authentication, email configuration and external services.

Common backend variables:

SQL_PASSWORD=your_mysql_password
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=your_bcrypt_admin_password_hash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_JWT_SECRET=your_jwt_secret
MAIL_USER=your_email_username
MAIL_PASS=your_email_password
ML_SERVICE_URL=http://localhost:5000

The frontend uses:

VITE_API_URL=http://localhost:8080
Database Setup

Create the MySQL database before starting the backend:

CREATE DATABASE cardealership;

Flyway will automatically apply the database migrations when the backend starts.

Start Backend (Spring Boot)

cd server

mvn spring-boot:run

Backend runs on:

http://localhost:8080

Swagger UI is available at:

http://localhost:8080/swagger-ui/index.html

Start Frontend

cd client

npm install

npm run dev

Frontend runs on:

http://localhost:5173

Start ML Service

cd ml-service

pip install -r requirements.txt

python train.py

python app.py

ML service runs on:

http://localhost:5000

🔐 Authentication Flow

The application uses JWT authentication with HttpOnly cookies.

After successful login, registration or Google OAuth login, the backend writes the JWT token into an authentication cookie.

The frontend does not store the JWT token directly. Instead, it checks the current authenticated user through:

GET /api/v1/auth/me

CSRF protection is used for state-changing requests such as login, registration, logout, create, update and delete operations.

The CSRF token can be obtained through:

GET /api/v1/auth/csrf

🧠 Machine Learning

The ML service:

Uses a dataset of cars (cars.csv)
Trains a recommendation model (train.py)
Serves prediction and recommendation results via API (app.py)
Is consumed by the Spring Boot backend through the configured ML service URL

The trained model artifact is not included in the repository because of its file size.
To run the ML service locally, the model should be generated first by executing train.py.

The recommendation service is separated from the backend in order to keep the web application logic and machine learning logic independent.

🛡️ Security

JWT authentication stored in an HttpOnly cookie
CSRF protection
Google OAuth authentication
Protected routes
Role-based access control
CORS configuration
Input validation through DTO validation
Global exception handling
Secure image upload validation
File type validation based on extension and content checks

🧪 Running Tests
Backend Tests

cd server

mvn test

Frontend Tests

cd client

npm test

🧪 Future Improvements

Docker Compose setup for local development
Docker and Kubernetes deployment
CI pipeline for automated testing
Query performance optimization for larger datasets
More advanced recommendation model evaluation
ML model versioning
Collaborative filtering
Real-time notifications
Extended frontend test coverage
Extended ML service test coverage
Audit fields for domain entities
Production deployment configuration

👨‍💻 Author

Developed as a full-stack project demonstrating:

Scalable architecture
REST API design
Microservice-based ML integration
Authentication and authorization
Database migration management
Secure file upload handling
Integration of machine learning into web applications

📜 License

This project is for educational purposes.

This project uses the Car Price Prediction dataset published on Kaggle.

Author: Mustafa Oz
Source: https://www.kaggle.com/code/mustafaoz158/car-price-prediction/notebook

License: Apache License 2.0