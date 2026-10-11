# HealthHub - Healthcare & Doctor Appointment Management System

HealthHub is a comprehensive full-stack MERN (MongoDB, Express, React, Node.js) healthcare management portal that connects patients with medical specialists. The platform facilitates physical clinic visits, video consultations, doctor verification workflows, real-time notifications, and interactive health chatbot support.

---

## Features

### 1. Patient Portal
- **User Authentication**: Secure registration and login with bcryptjs password hashing and JWT token authentication.
- **Find Specialists**: Browse approved medical specialists with instant name and specialization search filtering.
- **Book Appointments**: Schedule clinic appointments with slot availability checks and calendar validation.
- **Video Consultations**: Request remote virtual consultations directly from doctor cards.
- **My Appointments**: Track appointment status (Pending, Approved, Rejected) with real-time updates.
- **Smart Health Chatbot**: Integrated assistant to guide patients on medical inquiries and portal navigation.

### 2. Doctor Dashboard
- **Application Workflow**: Dedicated doctor registration with credentials, clinic location, experience, and consult timings.
- **Practice Management**: Real-time overview of daily scheduled appointments and patient records.
- **Status Updates**: Accept or decline incoming consultation requests with automatic patient notification triggers.

### 3. System Admin Panel
- **Doctor Approval**: Verify credentials and approve or reject doctor applications.
- **User Management**: Monitor registered users and manage active accounts securely.
- **Analytics Overview**: Real-time stats on registered patients, verified doctors, and pending applications.

---

## Tech Stack

- **Frontend**:
  - React 18
  - Redux Toolkit (State Management)
  - Ant Design (Antd UI Components)
  - React Router DOM v6
  - Axios & Moment.js
  - FontAwesome Icons
- **Backend**:
  - Node.js & Express.js
  - MongoDB with Mongoose ODM
  - JSON Web Tokens (JWT) for session management
  - Bcrypt.js for secure password hashing
  - Dotenv for environment configuration

---

## Project Structure

```
HealthHub/
├── client/                     # Frontend React Application
│   ├── public/                 # Static assets and index.html
│   └── src/
│       ├── components/         # Reusable UI (Layout, DoctorList, Chatbot, etc.)
│       ├── pages/              # Views (HomePage, Login, Register, Appointments, etc.)
│       ├── redux/              # Redux slices (user, alert)
│       └── styles/             # Modular CSS stylesheets
│
├── server/                     # Backend API Server
│   ├── config/                 # Database configuration (db.js)
│   ├── controllers/            # Route controllers (user, doctor, admin)
│   ├── middlewares/            # Auth and logging middlewares
│   ├── models/                 # Mongoose schemas (user, doctor, appointment)
│   ├── routes/                 # Express API routes
│   └── server.js               # Express application entry point
│
└── README.md                   # Project documentation
```

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas URI

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ekta1912/HealthHub.git
   cd HealthHub
   ```

2. **Configure Server Environment**:
   Create a `.env` file in the `server` directory (reference `server/.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URL=mongodb://localhost:27017/healthhub
   JWT_SECRET=your_secret_key_here
   ```

3. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Run the Application**:
   - Start the backend server:
     ```bash
     cd server
     npm start
     ```
   - In a separate terminal, start the React client:
     ```bash
     cd client
     npm start
     ```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/user/register` | Register new user | Public |
| `POST` | `/api/v1/user/login` | Authenticate user & get JWT | Public |
| `POST` | `/api/v1/user/getUserData` | Fetch current user data | Protected |
| `GET`  | `/api/v1/user/getAllDoctors` | List all verified doctors | Protected |
| `POST` | `/api/v1/user/book-appointment` | Book consultation appointment | Protected |
| `POST` | `/api/v1/user/booking-availbility` | Check doctor slot availability | Protected |
| `GET`  | `/api/v1/user/user-appointments` | List patient appointments | Protected |
| `POST` | `/api/v1/user/update-profile` | Update user personal details | Protected |
| `GET`  | `/api/v1/admin/getAllUsers` | Fetch all registered users | Admin |
| `GET`  | `/api/v1/admin/getAllDoctors` | Fetch all doctors | Admin |
| `POST` | `/api/v1/admin/changeAccountStatus`| Approve or reject doctor | Admin |

---

## License
MIT
