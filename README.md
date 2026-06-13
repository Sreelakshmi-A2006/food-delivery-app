# Food Delivery App

A full-stack React and Node.js food delivery application featuring an integrated custom payment gateway.

## Prerequisites

- **React.js**: For the frontend user interface
- **Node.js**: v16.x or higher (for backend and package management)
- **MongoDB**: Database instance (local or Atlas cloud cluster)
- **Git**: Version control
- **Antigravity**: AI coding assistant for automated environment configuration and testing

---

## Installation Steps

1. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install Client Dependencies**:
   ```bash
   cd client
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory with:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

---

## Running the Application

### 1. Manual Startup
Start the backend server:
```bash
cd server
npm run dev
```

Start the frontend client:
```bash
cd client
npm start
```
The client will open automatically at `http://localhost:3000`.

### 2. Startup using Antigravity
You can ask your Antigravity coding assistant to spin up the application:
- Prompt Antigravity: *"Please run the server and client dev servers in the background."*
- Antigravity will automatically handle the concurrent startup of the Express server (port 5000) and React dev server (port 3000) as async workspace tasks.
