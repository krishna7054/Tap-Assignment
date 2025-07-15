# 🏃‍♂️ Smart Jogging Tracker & Safety Companion

A **MERN Stack** web application that tracks your jogging sessions in real time, displays a live path on a map, calculates speed & distance, and includes smart safety features like an emergency SOS button. Built using modern web APIs such as the **Geolocation API**, **Canvas API**, **Network Information API**, and **Leaflet Maps** for a rich and responsive experience.

---

## 🚀 Features

### 📍 Real-time Jogging Tracker
- Uses **Geolocation API** to get your live location.
- Draws jogging path dynamically using **Canvas API** and **Leaflet Maps**.
- Automatically calculates:
  - Distance jogged
  - Duration
  - Average speed

### 🧠 Smart Web APIs
- **Geolocation API** – Tracks user’s live position.
- **Canvas API** – Renders a simplified path overview.
- **Network Information API** – Monitors connection status for reliability alerts.
- **Leaflet.js** – Renders interactive maps.
- **Intersection Observer API** *(optional/Future Changes)* – Used for lazy-loading session history.

### 📶 Network Status Alerts
- Detects network quality.
- Shows a live alert if you're offline or on a slow network (like 2G).

### 🚨 Emergency SOS Button
- Sends an alert message with your **Google Maps location link**.
- Triggers via WhatsApp.

### 🗂 Jogging Session History
- View all past jogging sessions.
- Each session stores route, time, distance, and average speed.

### 🔐 Authentication
- Secure login/signup with JWT-based tokens.
- Auth-protected dashboard and session tracking.

---

## 🧰 Tech Stack

- **Frontend:** React.js, TailwindCSS, Shadcn/UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Maps & Visualization:** Leaflet.js, Canvas API
- **Other Tools:** Axios, Lucide Icons, React Router, Toast Notifications

---

## 🔌 REST API Endpoints

### 🔐 Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user |

### 🏃 Jogging Session Routes
| Method | Endpoint           | Description |
|--------|--------------------|-------------|
| POST   | `/api/sessions`     | Save new jogging session |
| GET    | `/api/sessions/:id` | Get all sessions for a user |

---

## 🧪 Installation

### 1. Clone the repository
```bash
git clone https://github.com/krishna7054/Tap-Assignment.git
cd Tap-Assignment
```

### 2. Setup the backend (Express + MongoDB)
```bash
cd server
npm install
```
- Create a .env file in the server folder:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
- Run the backend:
```bash
node server.js
```
### 3. Setup the frontend (React)
```bash
cd ../client
npm install
```
- Run the frontend:
```bash
npm run dev
```
## 📸 Screenshots