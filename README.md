# Property Management Portal

A comprehensive property management system for Nigerian property managers, homeowners, and tenants.

## 🏗️ Project Structure

```
property-portal/
├── backend/          # Node.js/Express API
│   ├── config/       # Database, environment configs
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth, validation
│   └── services/     # Business logic
│
└── frontend/         # React application
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page components
    │   ├── services/    # API calls
    │   ├── context/     # State management
    │   └── utils/       # Helper functions
    └── public/
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your MongoDB URL and secrets
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📦 Tech Stack

**Backend:**
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Paystack for payments

**Frontend:**
- React 18
- Tailwind CSS
- Axios for API calls
- React Router

## 🎯 Features

- ✅ User Authentication (Property Managers, Homeowners, Tenants)
- ✅ Property Management
- ✅ Rent Payment Tracking
- ✅ Maintenance Requests
- ✅ Announcements & Notifications
- ✅ Property Applications

## 📖 Documentation

See `/docs` folder for detailed documentation on:
- API endpoints
- Database schemas
- Deployment guide
- User guides
