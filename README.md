# SalesPing ⚡
### Mini Sales Outreach & Follow-up Tracker

A full-stack MERN application to track sales leads and manage follow-up sequences.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)

---

## Backend Setup

```bash
cd backend
npm install

# Create .env from example
cp .env.example .env
# Fill in your MONGO_URI and JWT_SECRET

npm run dev   # runs on http://localhost:5000
```

### Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/salesping
JWT_SECRET=some_very_long_random_secret_here
CLIENT_URL=http://localhost:5173
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:5173
```

---

## 🏗️ Tech Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Frontend  | React 18, Vite, React Router v6           |
| UI        | Custom CSS (dark theme), Lucide icons     |
| Charts    | Recharts                                  |
| Backend   | Node.js, Express.js                       |
| Database  | MongoDB Atlas + Mongoose                  |
| Auth      | JWT + bcryptjs                            |
| Toasts    | react-hot-toast                           |

---

## 📡 API Reference

### Auth
| Method | Endpoint          | Description     |
|--------|-------------------|-----------------|
| POST   | /api/auth/signup  | Register user   |
| POST   | /api/auth/login   | Login user      |
| GET    | /api/auth/me      | Get current user|

### Leads
| Method | Endpoint            | Description            |
|--------|---------------------|------------------------|
| GET    | /api/leads          | Get all leads (filter) |
| POST   | /api/leads          | Create lead            |
| GET    | /api/leads/stats    | Dashboard stats        |
| GET    | /api/leads/:id      | Get single lead        |
| PUT    | /api/leads/:id      | Update lead            |
| DELETE | /api/leads/:id      | Delete lead            |

### Sequences
| Method | Endpoint                    | Description               |
|--------|-----------------------------|---------------------------|
| POST   | /api/sequences              | Add follow-up step        |
| GET    | /api/sequences/lead/:leadId | Get steps for a lead      |
| GET    | /api/sequences/upcoming     | Get upcoming follow-ups   |
| PUT    | /api/sequences/:id          | Update step (done/skip)   |
| DELETE | /api/sequences/:id          | Delete step               |

---

## 🚢 Deployment

| Service   | Platform       |
|-----------|----------------|
| Backend   | Render (free)  |
| Frontend  | Vercel (free)  |
| Database  | MongoDB Atlas  |

### Deploy Backend to Render
1. Push code to GitHub
2. New Web Service → connect repo
3. Root directory: `backend`
4. Build: `npm install` | Start: `npm start`
5. Add environment variables

### Deploy Frontend to Vercel
1. New Project → import repo
2. Root directory: `frontend`
3. Add env: `VITE_API_URL=https://your-render-url.onrender.com`

---

## ✨ Features

- 🔐 JWT Authentication (signup/login)
- 📋 Lead management with CRUD
- 🎯 Status tracking: New → Contacted → Replied → Converted
- 📅 Follow-up sequence timeline per lead
- 📊 Dashboard with Recharts (pie + bar charts)
- 🔍 Search + filter leads by status, source, priority
- 📱 Responsive dark UI
- ⚡ Toast notifications
- 🔄 Auto-assigns step numbers for sequences
