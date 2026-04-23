# 🏥 MediCare Plus - Complete Clinic Management System

<div align="center">

![MediCare Plus](https://img.shields.io/badge/MediCare-Plus-blue?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A modern, full-featured clinic management system built with the MERN stack**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## 🌟 Overview

MediCare Plus is a comprehensive clinic management system designed to streamline healthcare operations. Built with modern technologies, it provides a seamless experience for administrators, in-charge staff, and patients.

**Key Highlights:**
- 🎨 Beautiful, responsive UI with modern gradients and animations
- 🔐 Secure authentication with role-based access control
- 📊 Real-time dashboard with analytics
- 📄 PDF report management system
- 👨‍⚕️ Doctor profiles with image uploads
- 📅 Appointment scheduling and management
- 🏥 Complete clinic information customization

---

## ✨ Features

### 👑 Admin Features
- **User Management**
  - Create admin and in-charge accounts
  - Assign granular permissions to in-charge users
  - Edit and delete users
  - Role-based access control

- **Clinic Customization**
  - Upload custom clinic logo
  - Update clinic information
  - Manage contact details
  - Customize hero section

- **Doctor Management**
  - Add/edit/delete doctors
  - Upload doctor images
  - Manage specialties and qualifications
  - Feature doctors on homepage

- **Service Management**
  - Create and manage services
  - Customize service icons and colors
  - Set service descriptions

- **Report Management**
  - Create medical reports
  - Upload PDF reports (max 10MB)
  - Update report status
  - Search reports by Patient ID

- **Appointment Management**
  - View all appointments
  - Update appointment status
  - Manage appointment details

### 👨‍💼 In-Charge Features
Customizable permissions include:
- Manage Reports (create, edit, upload PDFs)
- View Appointments
- Manage Appointments
- View Statistics

### 🏠 Public Features
- Browse doctors by specialty
- View doctor profiles and availability
- Book appointments
- Search and download medical reports
- View clinic services
- Contact information

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling (via inline classes)
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Font Awesome** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin requests

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/medicare-plus.git
cd medicare-plus
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Configure Environment Variables

Create `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

Create `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 5: Start MongoDB
```bash
# Make sure MongoDB is running
mongod
```

### Step 6: Run the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

---

## 📖 Usage

### Default Credentials

**Admin Account:**
```
Email: admin@medicare.com
Password: admin123
```

**In-Charge Account:**
```
Email: incharge@medicare.com
Password: incharge123
```

### Quick Start Guide

1. **Login as Admin**
   - Use default admin credentials
   - Access full admin panel

2. **Customize Clinic**
   - Go to "Clinic Information" tab
   - Upload your clinic logo
   - Update clinic details

3. **Add Doctors**
   - Go to "Doctors Management" tab
   - Click "Add New Doctor"
   - Upload doctor image and fill details

4. **Add Services**
   - Go to "Services" tab
   - Create services with icons

5. **Create Users**
   - Go to "In-Charge Users" tab
   - Create admin or in-charge accounts
   - Assign permissions to in-charge users

6. **Manage Reports**
   - Go to "Reports" tab
   - Add patient reports
   - Upload PDF files

---

## 👥 User Roles & Permissions

### Admin Role
Full system access including:
- ✅ Create/edit/delete users
- ✅ Upload clinic logo
- ✅ Manage doctors and upload images
- ✅ Manage services
- ✅ Manage reports and upload PDFs
- ✅ View/manage appointments
- ✅ View statistics
- ✅ Update all clinic information

### In-Charge Role
Customizable permissions:
- **Manage Reports** - Create, edit, and upload PDF reports
- **View Appointments** - See all patient appointments
- **Manage Appointments** - Update appointment status
- **View Statistics** - Access dashboard and analytics

### Public Users
- View doctor profiles
- Book appointments
- Search and download medical reports
- View services and contact information

---

## 🔌 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Create User (Admin Only)
```http
POST /api/auth/create-user
Authorization: Bearer <token>

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Doctor Endpoints

#### Get All Doctors
```http
GET /api/doctors
```

#### Upload Doctor Image
```http
POST /api/doctors/upload-image/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Report Endpoints

#### Upload PDF Report
```http
POST /api/reports/upload-pdf/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Search Report
```http
GET /api/reports/search/:patientId
```

### Clinic Endpoints

#### Upload Logo
```http
POST /api/clinic/upload-logo
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

## 📁 Project Structure

```
medicare-plus/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   └── public/
└── docs/
```

---

## ⚙️ Environment Variables

### Backend
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- File upload validation
- CORS configuration
- Environment variable protection

---

## 🤝 Contributing

Contributions welcome! Fork the repo and submit pull requests.

---

## 📄 License

MIT License - See LICENSE file

---

<div align="center">

**Made with ❤️ by the MediCare Team**

⭐ Star this repo if you found it helpful!

</div>
