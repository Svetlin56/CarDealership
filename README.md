
## 📌 Overview

This project consist:

- **Frontend (React + TypeScript)** – user interface
- **Backend (Spring Boot)** – REST API & business logic
- **ML Service (Python)** – recommendation engine

The system allows users to:
- Browse available cars
- View detailed listings
- Register and authenticate (including Google OAuth)
- Receive personalized car recommendations
- Admins can manage listings

---

## 🏗️ Architecture


      [ React Frontend ]

               ↓

      [ Spring Boot API ]

               ↓

      [ ML Recommendation Service (Python) ]


- Frontend communicates with backend via REST API
- Backend handles authentication, business logic, and persistence
- ML service provides recommendation results based on user preferences

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

### Machine Learning Service
- Python
- Custom recommendation model
- CSV dataset (`cars.csv`)

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration & login
- Google OAuth integration
- Role-based access (User / Admin)

### 🚘 Car Listings
- Browse all cars
- View detailed car information
- Admin CRUD operations

### 🤖 Recommendations
- ML-powered car suggestions
- Based on user preferences and dataset

### 📊 Dashboard
- Personalized user dashboard
- Admin management interface

---

## 📁 Project Structure


      CarDealership/
      │
      ├── client/ # React frontend
      ├── server/ # Spring Boot backend
      ├── ml-service/ # Python ML service
      │
      └── README.md


---

## 🚀 Getting Started

1. Start Backend (Spring Boot)

   cd server

   ./mvnw spring-boot:run

2. Start Frontend

   cd client

   npm install

   npm run dev

3. Start ML Service

   cd ml-service

   pip install -r requirements.txt

   python app.py

🧠 Machine Learning

The ML service:
Uses a dataset of cars (cars.csv)
Trains a recommendation model (train.py)
Serves predictions via API (app.py)

🛡️ Security

JWT-based authentication
Protected routes
Role-based access control
CORS configuration

🧪 Future Improvements

Advanced filtering (price, brand, fuel type)
Pagination & search optimization
Docker & Kubernetes deployment
Real-time notifications
Improved ML model (collaborative filtering)

👨‍💻 Author

Developed as a full-stack project demonstrating:
Scalable architecture
Microservice design
Integration of ML into web applications

📜 License

This project is for educational purposes.

This project uses the Car Price Prediction dataset published on Kaggle.
Author: Mustafa Oz  
Source: https://www.kaggle.com/code/mustafaoz158/car-price-prediction/notebook  
License: Apache License 2.0
