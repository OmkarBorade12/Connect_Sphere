# ConnectSphere

A real-time collaboration platform inspired by Microsoft Teams.

## Features
- **Real-Time Messaging**: Built with Socket.IO.
- **Teams & Channels**: Organize conversations.
- **Modern UI**: Clean, white theme with Teams-like aesthetics.

## Prerequisites
- Node.js (v18 or higher recommended)

## Setup & Run

### Quick Start (Run Everything)
To launch the entire application (Backend + Frontend) with one command:
```bash
node run_app.js
```
This will start the server and automatically open your browser.

### Manual Setup
#### 1. Server (Backend)
The backend handles real-time connections, authentication, and database storage.
*Note: This project is configured to use **SQLite** by default for zero-config local testing (acting as a relational DB as per diagram). To use **MySQL**, edit `server/db.js` and update the dialect/credentials.*

Open a terminal:
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:3001`.

### 2. Client (Frontend)
The frontend is the user interface.
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
The application will open at `http://localhost:5173` (or similar).

## Usage
1. Enter your name in the login screen.
2. Click **Join Team**.
3. Select channels from the sidebar to chat!
