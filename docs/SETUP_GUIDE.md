# Property Management Portal - Setup Guide

## 📋 Prerequisites

Before you start, make sure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **MongoDB** (for local development) OR **MongoDB Atlas** account (recommended for production)
   - MongoDB Atlas (Free): https://www.mongodb.com/cloud/atlas
   - Local MongoDB: https://www.mongodb.com/try/download/community

4. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## 🚀 Quick Start

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd property-portal

# OR simply extract the downloaded folder and navigate to it
cd property-portal
```

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env
```

### Step 3: Configure Environment Variables

Open `backend/.env` and configure the following:

```env
# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# For MongoDB Atlas:
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create a free cluster
# 3. Get connection string and replace:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/property-portal

# JWT Secret (Generate a random string)
JWT_SECRET=your-super-secret-key-here

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start the Backend Server

```bash
# Still in the backend folder
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000 in development mode
```

### Step 5: Frontend Setup (New Terminal)

Open a NEW terminal window/tab:

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## ✅ Verify Installation

1. **Backend Health Check**
   - Open browser: http://localhost:5000/api/health
   - You should see: `{"success":true,"message":"Property Portal API is running"}`

2. **Frontend Check**
   - Open browser: http://localhost:3000
   - You should see the PropertyHub landing page

## 👤 Create Your First Account

1. Click "Get Started" or "Sign Up"
2. Choose your role:
   - **Property Manager**: For managing multiple properties
   - **Homeowner**: For monitoring your own properties
   - **Tenant**: For paying rent and reporting issues
3. Fill in your details and create account
4. You'll be automatically logged in to your dashboard!

## 📚 Project Structure

```
property-portal/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication, error handling
│   ├── utils/              # Helper functions
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
│
└── frontend/               # React application
    ├── public/             # Static files
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── services/       # API calls
    │   ├── context/        # Global state
    │   ├── App.js          # Main app component
    │   └── index.js        # Entry point
    ├── package.json        # Frontend dependencies
    └── tailwind.config.js  # Tailwind CSS configuration
```

## 🛠️ Development Tips

### Running Both Servers

You need TWO terminal windows:
- **Terminal 1**: Backend (`cd backend && npm run dev`)
- **Terminal 2**: Frontend (`cd frontend && npm start`)

### Making Changes

- **Backend changes**: Server auto-restarts with nodemon
- **Frontend changes**: Browser auto-refreshes with React hot reload

### Stopping the Servers

Press `Ctrl+C` in each terminal window to stop the servers.

## 🐛 Troubleshooting

### MongoDB Connection Error

**Problem**: `Error connecting to MongoDB`

**Solutions**:
1. Check if MongoDB is running (if using local MongoDB)
2. Verify your connection string in `.env`
3. Make sure your IP is whitelisted in MongoDB Atlas (if using Atlas)
4. Check username/password in connection string

### Port Already in Use

**Problem**: `Port 5000 is already in use`

**Solutions**:
1. Change PORT in backend/.env to another number (e.g., 5001)
2. Or kill the process using the port

### Frontend Can't Connect to Backend

**Problem**: API requests failing

**Solutions**:
1. Make sure backend is running on port 5000
2. Check CORS settings in backend/server.js
3. Verify FRONTEND_URL in backend/.env matches your frontend URL

### Dependencies Installation Failed

**Problem**: `npm install` errors

**Solutions**:
1. Delete `node_modules` folder and `package-lock.json`
2. Run `npm install` again
3. Make sure you have latest Node.js version

## 🎯 Next Steps

Now that you have the authentication system running (Milestone 1 ✓), you can:

1. Test user registration and login
2. Explore the dashboard
3. Review the code structure
4. Start building Milestone 2: Property Management Core

Check the `Development_Milestones.docx` for detailed tasks!

## 📞 Need Help?

If you encounter any issues:
1. Check this guide again carefully
2. Review the error messages in the terminal
3. Make sure all prerequisites are installed
4. Verify environment variables are set correctly

## 🎉 Congratulations!

You've successfully set up the Property Management Portal! 
The foundation is ready - authentication, routing, and beautiful UI are all working.

Happy coding! 🚀
