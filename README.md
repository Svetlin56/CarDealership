## 📌 Overview

This project consists of:

- **Frontend (React + TypeScript)** – user interface
- **Backend (Spring Boot)** – REST API and business logic
- **ML Service (Python)** – recommendation engine

The system allows users to:

- Browse available cars
- View detailed car listings
- Register and authenticate, including Google OAuth
- Receive car recommendations
- Admins can manage car listings

---

## 🏗️ Architecture


      [ React Frontend ]

               ↓

      [ Spring Boot API ]

               ↓

      [ ML Recommendation Service (Python) ]


- Frontend communicates with the backend via REST API
- Backend handles authentication, authorization, business logic, and persistence
- ML service provides recommendation results based on vehicle data and user-related criteria

---

## ⚙️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Context API

### Backend
- Spring Boot
- Spring Security
- RESTful API
- JWT Authentication
- Google OAuth
- Flyway Database Migrations
- MySQL

### Machine Learning Service
- Python
- Flask
- Custom recommendation model
- CSV dataset (`cars.csv`)

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- Google OAuth integration
- JWT-based authentication
- Role-based access control (User / Admin)

### 🚘 Car Listings
- Browse all available cars
- View detailed car information
- Search and filter listings
- Upload and manage car images
- Admin CRUD operations

### 🤖 Recommendations
- ML-powered car suggestions
- Based on vehicle characteristics and dataset analysis
- Provided through a separate Python ML service

### 📊 Dashboard
- Personalized user dashboard
- Admin management interface

---

## 📁 Project Structure


      CarDealership/
      │
      ├── client/      # React frontend
      ├── server/      # Spring Boot backend
      ├── ml-service/  # Python ML service
      │
      └── README.md


---

## 🚀 Getting Started

1. Start Backend (Spring Boot)

   cd server

   mvn spring-boot:run

2. Start Frontend

   cd client

   npm install

   npm run dev

3. Start ML Service

   cd ml-service

   pip install -r requirements.txt

   python train.py

   python app.py

---

## 🧠 Machine Learning

The ML service:

- Uses a dataset of cars (`cars.csv`)
- Trains a recommendation model (`train.py`)
- Serves prediction and recommendation results via API (`app.py`)

The trained model artifact is not included in the repository because of its file size.  
To run the ML service locally, the model should be generated first by executing `train.py`.

---

## 🛡️ Security

- JWT-based authentication
- Google OAuth authentication
- Protected routes
- Role-based access control
- CORS configuration
- Input validation
- Secure image upload validation

---

## 🧪 Future Improvements

- Advanced filtering by price, brand, fuel type, and other vehicle characteristics
- Pagination and search optimization
- Docker and Kubernetes deployment
- Real-time notifications
- Improved ML model evaluation and versioning
- Collaborative filtering
- Extended frontend and ML service test coverage

---

## 👨‍💻 Author

Developed as a full-stack project demonstrating:

- Scalable architecture
- REST API design
- Microservice design
- Authentication and authorization
- Integration of machine learning into web applications

---

## 📜 License

This project is for educational purposes.

This project uses the Car Price Prediction dataset published on Kaggle.

Author: Mustafa Oz  
Source: https://www.kaggle.com/code/mustafaoz158/car-price-prediction/notebook  
License: Apache License 2.0