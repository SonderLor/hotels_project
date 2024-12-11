# Hotel Booking Microservices Project

## Overview
This project is a hotel booking platform built using a microservices architecture. It consists of several independent services, each with its own database, communicating via Kafka and RabbitMQ. The frontend is built with React, while the backend services are implemented in Django.

## Architecture
### Components
- **Frontend**: React-based application for user interaction.
- **API Gateway**: NGINX for routing requests to the appropriate microservices.
- **Microservices**:
  - **Auth Service**: Handles authentication and user management.
  - **Profiles Service**: Manages user profiles and personal data.
  - **Hotels Service**: Handles hotel and room management.
  - **Bookings Service**: Manages bookings and reservations.
- **Message Brokers**:
  - **Kafka**: For asynchronous communication between services.
  - **RabbitMQ**: For Celery tasks such as delayed and background jobs.
- **Databases**: Each service has its own MySQL database.
- **Caching**: Redis is used for caching.

## Technologies
- **Frontend**: React, React Router
- **Backend**: Django, Django REST Framework
- **Message Brokers**: Kafka, RabbitMQ
- **Databases**: MySQL
- **Caching**: Redis
- **API Gateway**: NGINX
- **Containerization**: Docker, Docker Compose

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed.
- `.env` file configured with the necessary environment variables.

### Environment Variables
The project uses a `.env` file for configuration. Below are some essential variables:

```env
# RabbitMQ
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest

# Auth Service Database
DB_AUTH_ROOT_PASSWORD=example
DB_AUTH_NAME=auth_db
DB_AUTH_USER=auth_user
DB_AUTH_PASSWORD=auth_pass

# Profiles Service Database
DB_PROFILES_ROOT_PASSWORD=example
DB_PROFILES_NAME=profiles_db
DB_PROFILES_USER=profiles_user
DB_PROFILES_PASSWORD=profiles_pass

# Hotels Service Database
DB_HOTELS_ROOT_PASSWORD=example
DB_HOTELS_NAME=hotels_db
DB_HOTELS_USER=hotels_user
DB_HOTELS_PASSWORD=hotels_pass

# Bookings Service Database
DB_BOOKINGS_ROOT_PASSWORD=example
DB_BOOKINGS_NAME=bookings_db
DB_BOOKINGS_USER=bookings_user
DB_BOOKINGS_PASSWORD=bookings_pass
```

### Starting the Services
1. Clone the repository and navigate to the project directory.
2. Build and start the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost/api`

### Directory Structure
```
project-root/
├── auth_service/
├── profiles_service/
├── hotels_service/
├── bookings_service/
├── frontend/
├── nginx/
├── docker-compose.yml
└── .env
```

### API Endpoints
- **Auth Service**: `/api/auth/`
- **Profiles Service**: `/api/profiles/`
- **Hotels Service**: `/api/hotels-rooms/`
- **Bookings Service**: `/api/bookings/`

## Features
1. **User Authentication**:
   - Login, Registration, Logout.
2. **User Profiles**:
   - View and update user profiles.
3. **Hotel Management**:
   - List, create, update, and delete hotels and rooms.
4. **Booking Management**:
   - Search, create, and manage bookings.
5. **Asynchronous Communication**:
   - Kafka for inter-service communication.
   - RabbitMQ with Celery for background tasks.

## Scaling
- Services can be scaled independently by increasing their replica count in the `docker-compose.yml` file.
- Kafka and RabbitMQ ensure that communication between services remains decoupled and resilient.

## Deployment
- Use a cloud service like AWS or GCP to deploy the application.
- Update the `docker-compose` file to use production-ready configurations.
- Use a CI/CD pipeline to automate the deployment process.

## License
This project is licensed under the MIREA License.

---
For further information, please refer to the service-specific documentation in their respective directories.
