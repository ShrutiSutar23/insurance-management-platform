# InsureManage — Insurance Management Platform

A full-stack web application for managing insurance operations — policies, claims, premium payments, and documents — with distinct experiences for staff (Admin/Agent) and customers.

**🔗 Live demo:** https://insurance-management-platform-ten.vercel.app
**🔗 API:** https://insurance-backend-16p0.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after periods of inactivity. The first request may take 30–50 seconds while the server wakes up.

---

## Overview

InsureManage digitizes the core workflows of an insurance company: customer onboarding, policy issuance, premium tracking, claim processing, and document management — replacing manual, paperwork-heavy processes with a secure, role-based web platform.

The platform serves three types of users, each with a distinct set of permissions and views:

- **Administrator** — manages employees and customers, generates business reports, oversees all policies and claims, manages system-wide settings.
- **Insurance Agent** — registers customers, creates and renews policies, reviews and approves/rejects claims.
- **Customer** — self-registers (pending admin approval), requests new policies or renewals, submits claims, pays premiums, and manages their documents — all scoped strictly to their own data.

---

## Features

### Customer Management
- Self-registration with admin approval workflow
- Admin/Agent can directly create Customer, Agent, or Admin accounts
- Search, view, and edit customer profiles

### Policy Management
- Agents create and issue policies with custom premium and coverage terms
- Customers can request new policies or renewals; agents review and fulfill requests
- Cancel and renew policies with business-rule validation (e.g., cancelled policies can't be renewed)

### Premium Tracking
- Automatic first-premium generation when a policy is issued
- Staff can record future premium dues
- Automatic overdue detection based on due dates
- Customers can pay dues directly ("Pay Now") with instant status updates

### Claim Management
- Customers submit claims against active policies only
- Agents/Admins review and approve or reject claims
- Full claim history per policy and per customer

### Document Management
- Upload, view, download, and delete identity/policy/claim documents
- Files stored on disk with metadata tracked in the database

### Reports Dashboard
- Real-time statistics: active/cancelled policies, claim status breakdown, premium collection, customer growth, monthly policy trends

### Notifications
- In-app notification system alerting staff of new requests/claims and customers of policy updates and payment confirmations

### Security
- JWT-based authentication with role-based access control on every endpoint
- Passwords hashed with bcrypt
- Input validation across all forms (amounts, dates, email format, etc.)
- Customer-scoped API endpoints — customers can only ever access their own data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios |
| Backend | Python, Flask, Flask-RESTful patterns via Blueprints |
| Database | PostgreSQL (hosted on Supabase) |
| ORM | SQLAlchemy with Flask-Migrate (Alembic) |
| Authentication | Flask-JWT-Extended, Flask-Bcrypt |
| Icons | Lucide React |
| Hosting | Render (backend), Vercel (frontend) |

---

## Project Structure

```
insurance-management-platform/
├── backend/
│   ├── app/
│   │   ├── models.py           # SQLAlchemy models (Users, Customers, Policies, Claims, etc.)
│   │   ├── config.py           # App configuration
│   │   ├── utils.py            # Role-based access decorator, notification helpers
│   │   └── routes/             # Blueprints — one file per module
│   ├── migrations/             # Alembic migration history
│   ├── requirements.txt
│   ├── Procfile                # Render start command
│   └── run.py                  # App entry point
│
└── frontend/
    ├── src/
    │   ├── pages/               # Staff-facing pages (Dashboard, Policies, Claims, etc.)
    │   ├── pages/customer/      # Customer-facing pages (My Policies, My Claims, etc.)
    │   ├── components/          # Sidebar, CustomerLayout, ProtectedRoute, NotificationBell
    │   ├── context/             # AuthContext (login state, JWT storage)
    │   ├── api/                 # Axios instance with auth interceptors
    │   └── data/                # Static policy type info (benefits, icons)
    └── vite.config.js
```

---

## Database Schema

Core tables and relationships:

- **Users** → login credentials, role (`admin` / `agent` / `customer`), approval status
- **Customers** → profile info, linked 1:1 to a User
- **Policies** → belongs to a Customer (1:many)
- **Claims** → belongs to a Policy (1:many)
- **PremiumPayments** → belongs to a Policy (1:many)
- **Documents** → belongs to a Customer (1:many)
- **PolicyRequests** → customer-initiated requests for new/renewed policies
- **Notifications** → per-user notification feed

---

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Create a .env file with:
# DATABASE_URL=your_postgres_connection_string
# JWT_SECRET_KEY=your_secret_key

flask --app run.py db upgrade
python run.py
```
Backend runs at `http://127.0.0.1:5000`

### Frontend
```bash
cd frontend
npm install

# Create a .env.local file with:
# VITE_API_URL=http://127.0.0.1:5000

npm run dev
```
Frontend runs at `http://localhost:5173`

---

## Roles & Test Flow

To explore the full workflow:

1. **Sign up** as a new customer at `/signup` — account will be pending
2. **Log in as Admin**, go to **Approvals**, approve the new account
3. As the **customer**, log in and request a new policy from **My Policies**
4. As **Admin/Agent**, go to **Policy Requests**, create the policy with real terms
5. As the **customer**, pay the auto-generated premium from **My Payments**
6. Submit a **claim** from **My Claims**
7. As **Admin/Agent**, review and approve/reject the claim from **Claims**
8. Check the **Dashboard** for updated business-wide statistics

---

## Future Improvements

- Sum insured / coverage limits with automatic capping on claims
- Linking uploaded documents to specific claims
- Automated policy expiry notifications (scheduled jobs)
- Real payment gateway integration

---

## Author

Built as a full-stack learning project covering enterprise application architecture, role-based authentication, REST API design, relational database modeling, and full-stack deployment.