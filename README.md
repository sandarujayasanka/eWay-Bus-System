
# eWay Bus – Smart Bus Booking Platform

## Overview
eWay Bus is a full-stack platform that helps passengers explore routes, check schedules, and book bus tickets online in Sri Lanka. It includes:
- Backend API (Ballerina + MySQL)
- Frontend web app (React + Tailwind)
- Admin tools to manage buses, routes, users, and bookings

Monorepo layout:
```
backend/    # Ballerina backend service
frontend/    # React frontend (Vite)
```

## Prerequisites
- Ballerina
- Node.js
- MySQL (local)

## Quick Start (Local)
1) Clone the repo

2) Backend setup
   - cd `backend`
   - Run: `bal run`

3) Frontend setup
   - cd `frontend`
   - `npm install`
   - Run: `npm run dev`

4) Open the app: http://localhost:5173

## Running Locally

### Backend (Ballerina)
```
cd backend
bal run
```
The API listens on http://localhost:8081.

### Frontend (Vite)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## First-time Flow
1) Register a user via UI (`/register`).
2) Log in; token and user are stored in localStorage.
3) Admins can manage buses, routes, and bookings via the Admin Dashboard.
4) Passengers can search routes, pick buses, and book tickets.

## Roles and Permissions
- Roles: `passenger`, `admin`
- Passengers can browse routes, view buses, and make bookings.
- Admins can manage all system data (users, buses, routes, bookings).

## License
This project is part of the eWay Bus platform for modernizing bus travel in Sri Lanka.
