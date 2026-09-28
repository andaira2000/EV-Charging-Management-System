<h1 align="center">⚡ EV Charging Management System</h1>

<p align="center">
  A full-stack platform that connects <strong>EV drivers</strong> with <strong>charging station operators</strong>.<br>
  Operators list their stations. Drivers find them on a live map, book a time slot and pay through Stripe.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django REST Framework">
  <img src="https://img.shields.io/badge/AWS_Cognito-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS Cognito">
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe">
</p>

<p align="center">
  <a href="https://ev-charging-management-system.vercel.app/"><img src="https://img.shields.io/badge/▶_Live_demo-ev--charging--management--system.vercel.app-00C853?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0B3D2E" alt="Live demo on Vercel"></a>
</p>

https://github.com/user-attachments/assets/c539d881-1e4f-452f-a72d-35e3e923e527

<p align="center"><sub>Find a station, reserve a slot, pay with Stripe. <a href="https://ev-charging-management-system.vercel.app/">Try it yourself →</a></sub></p>

## Your turn

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
- **Store passwords or card numbers.** Authentication is delegated to AWS Cognito, and payment to Stripe.

## Features

| Feature                    | Description                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live Station Map**       | React-Leaflet map of all stations with filters, details, and **Reserve** / **Notify me** buttons on each marker                               |
| **Real-Time Availability** | Django Channels WebSocket (`/ws/reservations/`) pushes an update to every open map when a reservation is created or cancelled                 |
| **Role-Based Accounts**    | `buyer` (driver) or `seller` (operator), chosen at sign-up. Sellers get the station management pages                                           |
| **Cognito Authentication** | Sign up and sign in against an AWS Cognito user pool. JWTs are kept in cookies and validated by Next.js middleware on protected routes        |
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
| **Health Check**            | `GET /health/` returns `{"status": "ok"}` for the AWS load balancer                                     |
| **Typed Backend**           | `mypy` config plus `djangorestframework-stubs` and `boto3-stubs` for type-checked Django code           |

</details>

## Quick Start

You need **Python 3.10+**, **Node.js 18+**, **MySQL**, **Redis**, an **AWS Cognito** user pool, a **Stripe** account (test mode is fine), an **OpenCage** API key and an **SMTP** account for emails.

```bash
# 1. Backend
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt requests

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
npm install
npm run dev                      # http://localhost:3000
```

<details>
<summary><b>Environment variables</b></summary>

**`backend/.env`**

```bash
SECRET_KEY=

# MySQL
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=3306

# AWS Cognito
COGNITO_AWS_REGION=
COGNITO_USER_POOL=
COGNITO_AUDIENCE=              # app client ID
COGNITO_CLIENT_SECRET=

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
EMAIL_PORT=587
DEFAULT_FROM_EMAIL=
SENDGRID_API_KEY=

# Geocoding
OPENCAGE_URL=https://api.opencagedata.com/geocode/v1/json
OPENCAGE_API_KEY=

CORS_ALLOW_ALL_ORIGINS=True
```

**`frontend/.env`**

```bash
NEXT_PUBLIC_IS_LOCAL=true      # false → use the deployed backend
NEXT_PUBLIC_LOCAL_SERVER_URL=http://127.0.0.1:8000
NEXT_PUBLIC_DEPLOYED_SERVER_URL=https://ev-backend-django.click
NEXT_PUBLIC_LOCAL_SERVER_URL_SOCKET=ws://127.0.0.1:8000
NEXT_PUBLIC_DEPLOYED_SERVER_URL_SOKET=wss://ev-backend-django.click
```

</details>

## How It Works

```
Driver picks a station + time slot on the map
        │
        ▼
┌──────────────────────────┐
│  POST /create-checkout-  │  Cognito JWT → user profile
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
            │  AWS ECS (Fargate)   │  Docker: Daphne + Celery + Redis
            │  ev-backend-django   │  env file loaded from S3
            └──────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   AWS RDS (MySQL)  AWS Cognito     Stripe
```

- **Frontend:** deployed on Vercel from the `frontend/` directory.
- **Backend:** every push to `main` that touches `backend/**` runs [`.github/workflows/aws.yml`](.github/workflows/aws.yml). It builds `backend/Dockerfile`, pushes the image to Amazon ECR and deploys it to the ECS service with [`backend/task-definition.json`](backend/task-definition.json).
- **Container:** [`backend/start.sh`](backend/start.sh) starts Redis, a Celery worker and Daphne on port `8000` in one container. Environment variables come from a `.env` file stored in S3.
- **Secrets:** the workflow needs `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as GitHub repository secrets.

## API

All endpoints except health, sign-up, login and the Stripe webhook require `Authorization: Bearer <Cognito JWT>`.

```
GET    /health/                                   → Health check

POST   /signup/                                   → Register via Cognito + create user profile
POST   /login/                                    → Authenticate, returns Cognito tokens + role
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
├── .github/workflows/aws.yml         # Build + deploy backend to AWS ECS
├── backend/                          # Django REST API + Channels
│   ├── Dockerfile
│   ├── start.sh                      # Redis + Celery + Daphne
│   ├── task-definition.json          # ECS task definition
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
    ├── .env                          # Local vs deployed backend URLs
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
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-37814A?style=flat&logo=celery&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazonaws&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?style=flat&logo=vercel&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat&logo=stripe&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white)

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + MUI, hosted on Vercel
- **Maps**: Leaflet + React-Leaflet
- **Backend**: Django + Django REST Framework, served by Daphne
- **Real-time**: Django Channels (WebSockets)
- **Auth**: AWS Cognito (`django-cognito-jwt`, `boto3`)
- **Database**: MySQL on AWS RDS
- **Background jobs**: Celery + Redis
- **Payments**: Stripe Checkout + webhooks
- **Email**: Django `send_mail` over SMTP (SendGrid)
- **Geocoding**: OpenCage Geocoding API
- **Infrastructure**: Docker, Amazon ECR + ECS, GitHub Actions

## FAQ

**Who is a "buyer" and who is a "seller"?**
A **buyer** is an EV driver who reserves and pays for charging slots. A **seller** is a station operator who lists and manages stations. You pick the role with a checkbox at sign-up.

**How is the price calculated?**
`power_capacity (kW) × duration (hours) × price_per_kwh`, charged in GBP through Stripe. A 2-hour slot on a 22 kW station at £0.50/kWh costs 22 × 2 × 0.50 = **£22.00**.

**What happens if I close the Stripe tab without paying?**
Nothing is charged. The reservation stays unpaid, and after 30 minutes the Celery worker deletes it. This only works if the Celery worker and Redis are running.

**The map doesn't update live.**
The WebSocket uses Django Channels' in-memory channel layer, so live updates only reach clients connected to the same backend process. Make sure the backend runs under Daphne, not `python manage.py runserver`, which doesn't serve WebSockets in this setup, and that the frontend's socket URL in `frontend/.env` matches it.

**The map shows no stations.**
Check that `NEXT_PUBLIC_IS_LOCAL` points the frontend at the backend you are running, that you are signed in (the dashboard route is protected) and that at least one station has been added by a seller.
