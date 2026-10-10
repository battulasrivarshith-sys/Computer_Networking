# 🔐 Vault — Secure Password Manager (MERN Stack)

A full-stack password manager with authentication, built with the **MERN** stack
(**M**ongoDB, **E**xpress.js, **R**eact, **N**ode.js). Users can register, sign in,
and manage website credentials (website, username, password, notes) through a
clean React UI backed by REST APIs.

## ✨ Features

- **Authentication** — register / login with bcrypt-hashed passwords (12 salt rounds) and JWT sessions
- **Encryption at rest** — every stored password is encrypted with **AES-256-GCM** (authenticated encryption) before it touches MongoDB
- **Full CRUD** — add, view, update, and delete credentials
- **Search** — debounced, case-insensitive search across website and username
- **Password generator** — cryptographically secure (`crypto.getRandomValues`) with a live strength meter
- **Role-based access** — `user` and `admin` roles; only admins can view platform-wide stats
- **Security hardening** — Helmet security headers, CORS allow-list, rate limiting on auth endpoints, generic error messages, per-user data isolation

## 🏗️ Architecture

```
┌────────────────────────────┐         ┌────────────────────────────┐
│  React SPA (Vite, :5173)   │  HTTP   │  Express API (Node, :5000) │
│  - Login / Register pages  │ ──────► │  - /api/auth (JWT + bcrypt) │
│  - Dashboard (CRUD + search)│  JSON   │  - /api/passwords (CRUD)   │
│  - Password generator      │ ◄────── │  - AES-256-GCM encrypt/    │
└────────────────────────────┘  JWT    │    decrypt, RBAC           │
                                        └─────────────┬──────────────┘
                                                      │ Mongoose
                                            ┌─────────▼──────────┐
                                            │     MongoDB        │
                                            │  - users           │
                                            │  - passwordentries │
                                            └────────────────────┘
```

## 📁 Project Structure

```
secure-password-manager/
├── server/                     # Node.js + Express backend
│   ├── index.js                # App entry: middleware, routes, error handling
│   ├── config/db.js            # MongoDB connection (Mongoose)
│   ├── middleware/auth.js      # JWT authentication + role authorization
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt pre-save hash)
│   │   └── PasswordEntry.js    # Credential schema (encrypted password)
│   ├── routes/
│   │   ├── auth.js             # POST /register, /login, GET /me
│   │   └── passwords.js        # CRUD + GET /admin/stats (admin only)
│   ├── utils/crypto.js         # AES-256-GCM encrypt/decrypt helpers
│   ├── test/smoke.js           # Crypto + HTTP smoke tests (no DB needed)
│   └── .env.example
├── client/                     # React frontend (Vite)
│   ├── vite.config.js          # Dev server + /api proxy
│   └── src/
│       ├── api/client.js       # Fetch wrapper (attaches JWT)
│       ├── context/AuthContext.jsx  # Session state (login/register/logout)
│       ├── components/         # AuthForm, PasswordCard, PasswordFormModal, StrengthMeter
│       ├── pages/              # Login, Register, Dashboard
│       └── utils/password.js   # Password generator + strength heuristic
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB** — either a local instance (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd server
cp .env.example .env        # then edit .env with your values
npm install
npm run dev                 # starts on http://localhost:5000
```

Generate strong secrets for `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # starts on http://localhost:5173
```

Open http://localhost:5173, register an account, and start adding credentials.

### 3. Smoke tests (optional, no MongoDB required)

```bash
cd server
npm run smoke
```

## 🔌 API Reference

| Method | Endpoint                    | Auth   | Description                              |
|--------|-----------------------------|--------|------------------------------------------|
| GET    | `/api/health`               | No     | Health check                             |
| POST   | `/api/auth/register`        | No     | Create account → `{ token, user }`       |
| POST   | `/api/auth/login`           | No     | Sign in → `{ token, user }`              |
| GET    | `/api/auth/me`              | Bearer | Current user profile                     |
| GET    | `/api/passwords?search=`    | Bearer | List own credentials (decrypted)         |
| POST   | `/api/passwords`            | Bearer | Create credential (password encrypted)   |
| GET    | `/api/passwords/:id`        | Bearer | Fetch one credential                     |
| PUT    | `/api/passwords/:id`        | Bearer | Update credential                        |
| DELETE | `/api/passwords/:id`        | Bearer | Delete credential                        |
| GET    | `/api/passwords/admin/stats`| Admin  | Platform-wide user/entry counts (RBAC)   |

All protected endpoints expect the header: `Authorization: Bearer <token>`.

## 🔒 Security Notes

- Passwords are **never stored in plaintext**: bcrypt (12 rounds) for account passwords, AES-256-GCM for vault entries
- GCM authentication tags detect tampering; each encryption uses a fresh random IV
- Login responses use a generic "Invalid email or password" message to avoid user enumeration
- Auth endpoints are rate-limited (100 requests / 15 min per IP)
- Every credential query is scoped to `req.user._id` — users can only ever see their own data
- The global error handler never leaks stack traces to clients

### Creating an admin user

Roles default to `user`. To promote an account to admin (e.g. for the stats endpoint):

```js
// In the MongoDB shell or Compass:
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## 🎯 Project Objectives Mapping

| Objective | Where it's implemented |
|-----------|------------------------|
| MERN stack development | React SPA + Express REST API + MongoDB (Mongoose) |
| CRUD with MongoDB | `routes/passwords.js` + `models/PasswordEntry.js` |
| REST APIs with Node/Express | `server/routes/*` |
| React frontend | `client/src/*` |
| Authentication & role-based access | JWT middleware, bcrypt, `authorize('admin')` |
| Clear display of results | Dashboard with search, cards, modals, strength meter |
