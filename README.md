# UniCodeIDE — Learn. Code. Build. All in One Place.

UniCodeIDE is an enterprise-grade cloud-native learning management platform and browser IDE engineered for computer science departments, universities, and technical colleges.

---

## 🚀 Architecture Overview

### Technology Stack
* **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v7, Lucide Icons, native `fetch()`.
* **Backend**: Node.js, Express.js (ES Modules), MongoDB & Mongoose.
* **Security & Auth**: JWT (`jsonwebtoken`), password hashing (`bcryptjs`), multi-tenant tenant isolation, and Role-Based Access Control (RBAC).

---

## 🏛 Four Application Roles (RBAC)

1. **Super Admin (`SUPER_ADMIN`)**
   * Platform-wide administration, university tenant onboarding, global telemetries, and billing foundation.
   * Default route: `/app/super-admin/dashboard`

2. **University Admin (`UNIVERSITY_ADMIN`)**
   * Campus administration: departments, faculty rosters, student batches, and institutional accreditation reports.
   * Default route: `/app/university-admin/dashboard`

3. **Teacher (`TEACHER`)**
   * Curriculum authoring, assignments, proctored coding exams, and live classroom monitoring.
   * Default route: `/app/teacher/dashboard`

4. **Student (`STUDENT`)**
   * Course learning tracks, cloud coding IDE, homework submissions, and coding exams.
   * Default route: `/app/student/dashboard`

---

## 📂 Project Structure

```text
UniCodeIDE/
├── backend/                  # Node.js + Express + MongoDB Service
│   ├── src/
│   │   ├── config/           # DB & environment variables
│   │   ├── controllers/      # Auth & user business logic
│   │   ├── middleware/       # JWT auth & RBAC route guards
│   │   ├── models/           # Mongoose schemas (User, University)
│   │   ├── routes/           # REST endpoints (/api/auth)
│   │   ├── utils/            # JWT & response helpers
│   │   ├── validators/       # Input sanitization & validation
│   │   ├── app.js            # Express app configuration
│   │   ├── server.js         # HTTP server bootstrap
│   │   └── seed.js           # Database seed script
│   ├── .env.example          # Backend environment variables template
│   └── package.json
│
├── src/                      # React Frontend Application
│   ├── auth/                 # RBAC utilities, Role Guards & ProtectedRoute
│   ├── components/
│   │   ├── common/           # Brand Logo & shared assets
│   │   ├── dashboard/        # Sidebar, Topbar, StatCard, QuickActions, EmptyState
│   │   ├── navigation/       # Public Navbar, Footer, ThemeToggle
│   │   └── ui/               # Reusable Button, Badge, Card, PageHeader, StaticPage
│   ├── context/              # ThemeContext & AuthContext
│   ├── layouts/              # PublicLayout & AuthenticatedLayout
│   ├── pages/
│   │   ├── auth/             # Login, Register, ForgotPassword
│   │   ├── dashboard/        # 4 Role Dashboard Shells
│   │   ├── errors/           # 404 NotFound, 500 ServerError, 403 Unauthorized
│   │   └── public/           # Marketing Home, About, Features, Pricing, Docs, FAQ
│   ├── services/             # Native fetch API client & authService
│   ├── App.jsx               # App routing & RBAC route guards
│   └── index.css             # Tailwind CSS v4 tokens & Geist typography
│
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚡ Running Locally

### 1. Frontend
```bash
npm install
npm run dev
```
Accessible at: `http://localhost:5173`

### 2. Backend
In a separate terminal:
```bash
cd backend
npm install
npm run dev
```
API running at: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

---

## 🔑 Fast Testing Demo Accounts (Pre-seeded)

Use any of these credentials on `/login` or click the **Fast Demo Access** buttons directly on the sign-in form:

| Role | Email | Password | Target Dashboard |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@unicodeide.edu` | `password123` | `/app/super-admin/dashboard` |
| **University Admin** | `admin@meridian.edu` | `password123` | `/app/university-admin/dashboard` |
| **Teacher** | `teacher@meridian.edu` | `password123` | `/app/teacher/dashboard` |
| **Student** | `student@meridian.edu` | `password123` | `/app/student/dashboard` |
