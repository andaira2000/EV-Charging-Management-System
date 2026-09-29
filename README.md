<h1 align="center">⚡ EV Charging Management System</h1>

<p align="center">
  A full-stack platform that connects <strong>EV drivers</strong> with <strong>charging station operators</strong>.<br>
  Operators list their stations. Drivers find them on a live map, book a time slot and pay through Stripe.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django REST Framework">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe">
</p>

<p align="center">
  <a href="https://ev-charging-management-system.vercel.app/"><img src="https://img.shields.io/badge/▶_Live_demo-ev--charging--management--system.vercel.app-00C853?style=flat&labelColor=0B3D2E" alt="Live demo on Vercel"></a>
</p>

https://github.com/user-attachments/assets/c539d881-1e4f-452f-a72d-35e3e923e527

<p align="center"><sub>Find a station, reserve a slot, pay with Stripe. <a href="https://ev-charging-management-system.vercel.app/">Try it yourself →</a></sub></p>

## Try it

Pick a station on the map, choose a start and end time, and hit **Reserve**. If the slot is free, you land on a Stripe checkout for exactly the energy you booked. If you don't pay within 30 minutes, the slot goes back to everyone else. Every open map sees the change instantly.

```bash
git clone https://github.com/andaira2000/EV-Charging-Management-System.git
cd EV-Charging-Management-System
```

<p align="center"><sub>Django API on <code>:8000</code>, Next.js dashboard on <code>:3000</code>. Setup details are in <a href="#quick-start">Quick Start</a>.</sub></p>

## What it does for you

**If you drive an EV:**

- **Where can I charge?** Every station appears on a Leaflet map with its connector type, charging speed, power and price per kWh. Filter by minimum power, distance and status.
- **Will it be free when I get there?** Reservations are time-slotted, and overlapping bookings are rejected before you pay. The map updates live over WebSockets when someone else books or cancels.
- **It's taken right now.** Hit **Notify me** and you get an email the moment the current booking ends.
- **How much will it cost?** The price is calculated up front as `power (kW) × hours × price per kWh`, so there are no surprises at checkout.
- **How do I pay?** Through Stripe Checkout. The app never sees your card details. Every payment shows up on your **Payments** page, with a downloadable PDF invoice.

**If you operate stations:**

- **How do I get listed?** Add a station by address. It is geocoded to map coordinates automatically.
- **Something broke?** Mark a station `available`, `out_of_order` or `maintenance`.
- **Which stations are popular?** The **Analytics** page shows the most visited station.
- **Who manages what?** Each operator sees and edits only their own stations.

## What it will not do

- **Hold a slot you never paid for.** An unpaid reservation is deleted by a background Celery task after 30 minutes.
- **Double-book a station.** The checkout request is atomic and checks for overlapping reservations before it creates one.
- **Charge you twice.** The Stripe webhook locks the reservation and ignores it if it is already paid.
- **Let anyone edit anyone's station.** Only a `seller` can add, update or delete stations.
- **Store plain-text passwords or card numbers.** Passwords are kept only as salted hashes (Django's PBKDF2), and card details never leave Stripe.

## Features

| Feature                    | Description                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live Station Map**       | React-Leaflet map of all stations with filters, details, and **Reserve** / **Notify me** buttons on each marker                               |
| **Real-Time Availability** | Django Channels WebSocket (`/ws/reservations/`) pushes an update to every open map when a reservation is created or cancelled                 |
| **Role-Based Accounts**    | `buyer` (driver) or `seller` (operator), chosen at sign-up. Sellers get the station management pages                                           |
| **JWT Authentication**     | Sign up and sign in against the Django API. It issues signed JWTs (simplejwt, valid for 1 day), kept in cookies and validated by Next.js middleware on protected routes |
| **Station Management**     | Operators create, update and delete stations: location, speed (fast/slow), power (kW), price per kWh, connector (Type 1, Type 2, CCS, CHAdeMO) |
| **Stripe Payments**        | A checkout session in GBP priced from the booked energy. A signed webhook (`checkout.session.completed`) marks the reservation as paid          |

<details>
<summary><b>Everything else it does</b></summary>

| Feature                     | Description                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Reservations Page**       | Drivers see their bookings and can cancel them                                                         |
| **Payments & Invoices**     | Payment history per user, with a PDF invoice generated in the browser (jsPDF)                          |
| **Availability Emails**     | "Notify me" schedules a Celery task for the end of the current booking and sends an email via SMTP      |
| **Unpaid Booking Cleanup**  | `cleanup_unpaid_reservation` is scheduled with Celery + Redis 30 minutes after each booking             |
| **Analytics**               | Most visited station, by number of reservations                                                        |
| **Auto Geocoding**          | Station addresses are turned into latitude/longitude through the OpenCage Geocoding API                  |
| **Health Check**            | `GET /health/` returns `{"status": "ok"}`, used as Render's health check                                |
| **Typed Backend**           | `mypy` config plus `djangorestframework-stubs` for type-checked Django code                             |

</details>

## Quick Start

You need **Python 3.10+**, **Node.js 18+**, a **PostgreSQL** database (a free [Neon](https://neon.tech) project works), **Redis**, a **Stripe** account (test mode is fine), an **OpenCage** API key and an **SMTP** account for emails.

```bash
# 1. Backend
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 2. Create backend/.env (see "Environment variables" below)

# 3. Create the tables and start the API (Daphne serves HTTP + WebSockets)
python manage.py migrate
daphne -b 127.0.0.1 -p 8000 myproject.asgi:application

# 4. Start the background worker (separate terminal, Redis must be running)
celery -A myproject worker -l info

# 5. Forward Stripe webhooks to the API (separate terminal)
stripe listen --forward-to http://127.0.0.1:8000/stripe-webhook/

# 6. Frontend (separate terminal)
cd frontend
cp .env.example .env.local       # see "Environment variables" below
npm install
npm run dev                      # http://localhost:3000
```

<details>
<summary><b>Environment variables</b></summary>

**`backend/.env`**

```bash
# Also signs the login JWTs. Generate one with:
# python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY=

# PostgreSQL (e.g. Neon's direct, non-pooled connection string)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Celery
CELERY_BROKER_URL=redis://127.0.0.1:6379/1

# Email (e.g. SendGrid SMTP)
EMAIL_HOST=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_PORT=587                 # required, even if you don't send emails
DEFAULT_FROM_EMAIL=
SENDGRID_API_KEY=

# Geocoding
OPENCAGE_URL=https://api.opencagedata.com/geocode/v1/json
OPENCAGE_API_KEY=

CORS_ALLOW_ALL_ORIGINS=True
```

**`frontend/.env.local`** (copy from [`frontend/.env.example`](frontend/.env.example); git-ignored)

```bash
# true → use the local backend, false → use the deployed one
NEXT_PUBLIC_IS_LOCAL=true
NEXT_PUBLIC_LOCAL_SERVER_URL=http://127.0.0.1:8000
NEXT_PUBLIC_DEPLOYED_SERVER_URL=https://ev-charging-management-system.onrender.com
NEXT_PUBLIC_LOCAL_SERVER_URL_SOCKET=ws://127.0.0.1:8000
NEXT_PUBLIC_DEPLOYED_SERVER_URL_SOCKET=wss://ev-charging-management-system.onrender.com
```

</details>

## How It Works

```
Driver picks a station + time slot on the map
        │
        ▼
┌──────────────────────────┐
│  POST /create-checkout-  │  JWT → user profile
│  session/                │  Overlap check (atomic)
└────────────┬─────────────┘
             │
     ┌───────┼──────────────────────┐
     ▼       ▼                      ▼
Reservation  WebSocket push      Celery task scheduled
(is_paid=0)  → every open map    (+30 min)
             refreshes              │
             │                      ▼
             ▼               Still unpaid? → delete
     Stripe Checkout (GBP)   reservation
             │
             ▼
  Webhook: checkout.session.completed
             │
             ▼
  Reservation is_paid = True + Payment record
```

## Deployment

```
            ┌──────────────────────┐
 Browser ──▶│  Vercel              │  Next.js frontend
            │  ev-charging-...app  │
            └──────────┬───────────┘
                       │ HTTPS + WSS
            ┌──────────▼───────────┐
            │  Render (Docker)     │  Daphne + Celery + Redis
            │  ev-charging-...com  │  in one container
            └──────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  Neon (PostgreSQL)  Stripe        OpenCage
```

- **Frontend:** deployed on Vercel from the `frontend/` directory. Every push to `main` that touches `frontend/` builds a new production version. The `NEXT_PUBLIC_*` variables are set in Vercel's project settings and baked in at build time, so changing them needs a redeploy.
- **Backend:** a Render web service built from [`backend/Dockerfile`](backend/Dockerfile), with `backend` as its root directory. Every push to `main` that touches `backend/` deploys automatically. Render calls `GET /health/` to check that a new version is up before switching traffic to it.
- **Container:** [`backend/start.sh`](backend/start.sh) runs `migrate`, then starts Redis, a Celery worker and Daphne on Render's `$PORT` (`8000` locally) in one container.
- **Configuration:** the backend's environment variables (see [Environment variables](#quick-start)) are set in Render's dashboard, not in a file.
- **Database:** PostgreSQL on Neon, in the same region as the Render service (Frankfurt).
- **Free plan:** the Render instance sleeps after 15 minutes without traffic, so the first request after that can take up to a minute.

## API

All endpoints except health, sign-up, login and the Stripe webhook require `Authorization: Bearer <access token>`, using the `access` token returned by `/login/`.

```
GET    /health/                                   → Health check

POST   /signup/                                   → Create a user (password stored hashed)
POST   /login/                                    → Authenticate, returns a JWT access token + profile
POST   /validate-token/                           → Check a token (used by Next.js middleware)

POST   /charging-stations/add/                    → Add a station (seller)
GET    /charging-stations/user/                   → My stations (seller)
GET    /charging-stations/all/                    → All stations (map)
PUT    /charging-stations/<station_id>/update/    → Update a station (seller)
DELETE /charging-stations/<station_id>/delete/    → Delete a station (seller)

POST   /create-reservation/                       → Create a reservation
GET    /get-user-reservations/                    → My reservations
GET    /get-all-reservations/                     → Booked time slots, grouped by station
PUT    /reservations/<reservation_id>/update/     → Change a reservation
DELETE /reservations/<reservation_id>/cancel/     → Cancel a reservation
GET    /reservations/most-visited/                → Most visited station (analytics)

POST   /create-checkout-session/                  → Reserve a slot + open Stripe Checkout
POST   /stripe-webhook/                           → Stripe payment confirmation
GET    /payments/                                 → My payment history

POST   /notifications/request/                    → Email me when this station frees up

WS     /ws/reservations/                          → Live availability updates
```

## Project Structure

```
EV-Charging-Management-System/
├── backend/                          # Django REST API + Channels (Render)
│   ├── Dockerfile
│   ├── start.sh                      # migrate, then Redis + Celery + Daphne
│   ├── requirements.txt
│   ├── myproject/
│   │   ├── settings.py               # Reads config from .env
│   │   ├── urls.py                   # All API routes
│   │   ├── asgi.py                   # HTTP + WebSocket routing
│   │   └── celery.py
│   └── myapp/
│       ├── models.py                 # UserProfile, ChargingStation, Reservation, Payment, NotificationRequest
│       ├── consumers.py              # WebSocket consumer
│       ├── routing.py                # /ws/reservations/
│       ├── tasks.py                  # Unpaid cleanup + availability emails
│       ├── utils.py                  # OpenCage geocoding
│       └── views/                    # auth, stations, reservations, stripe, payments, notifications, health
└── frontend/                         # Next.js 14 dashboard (Vercel)
    ├── .env.example                  # Template for .env.local (backend URLs)
    └── src/
        ├── middleware.ts             # Cookie-based route protection
        ├── server/requests.ts        # All API calls
        ├── hooks/useReservationUpdates.tsx   # WebSocket listener
        ├── app/                      # dashboard, manage-charging-stations, reservations, payments, analytics, auth...
        └── components/
            ├── Dashboard/            # Station map
            ├── Map/                  # Filters, Reserve + Notify me buttons
            ├── ManageChargingStations/
            ├── Reservations/
            ├── Payments/             # Payment history + PDF invoices
            └── Auth/                 # Sign in / sign up forms
```

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-37814A?style=flat&logo=celery&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Render-000?style=flat&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?style=flat&logo=vercel&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat&logo=stripe&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white)

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + MUI, hosted on Vercel
- **Maps**: Leaflet + React-Leaflet
- **Backend**: Django + Django REST Framework, served by Daphne
- **Real-time**: Django Channels (WebSockets)
- **Auth**: Django password hashing + JWTs (`djangorestframework-simplejwt`)
- **Database**: PostgreSQL on Neon (`psycopg`, `dj-database-url`)
- **Background jobs**: Celery + Redis
- **Payments**: Stripe Checkout + webhooks
- **Email**: Django `send_mail` over SMTP (SendGrid)
- **Geocoding**: OpenCage Geocoding API
- **Infrastructure**: Docker on Render (backend), Vercel (frontend)

## FAQ

**Who is a "buyer" and who is a "seller"?**
A **buyer** is an EV driver who reserves and pays for charging slots. A **seller** is a station operator who lists and manages stations. You pick the role with a checkbox at sign-up.

**How is the price calculated?**
`power_capacity (kW) × duration (hours) × price_per_kwh`, charged in GBP through Stripe. A 2-hour slot on a 22 kW station at £0.50/kWh costs 22 × 2 × 0.50 = **£22.00**.

**What happens if I close the Stripe tab without paying?**
Nothing is charged. The reservation stays unpaid, and after 30 minutes the Celery worker deletes it. This only works if the Celery worker and Redis are running. On Render's free plan, Redis runs inside the container, so if the instance sleeps or restarts during those 30 minutes, the cleanup task is lost and the reservation stays until it is removed by hand.

**The map doesn't update live.**
The WebSocket uses Django Channels' in-memory channel layer, so live updates only reach clients connected to the same backend process. Make sure the backend runs under Daphne, not `python manage.py runserver`, which doesn't serve WebSockets in this setup, and that the frontend's socket URL in `frontend/.env.local` matches it.

**The map shows no stations.**
Check that `NEXT_PUBLIC_IS_LOCAL` points the frontend at the backend you are running, that you are signed in (the dashboard route is protected) and that at least one station has been added by a seller.
