# Roblox Item Auction Platform

Full-stack auction web app using **Node.js + Express + MongoDB** backend and **HTML/CSS/Bootstrap/Vanilla JS** frontend.

## Features
- JWT + bcrypt authentication
- Role-based access (`user`, `admin`)
- Admin approval workflow (pending users)
- Auction creation, listing, bidding, bid history
- Anti-sniping (extend by 60 seconds on late bids)
- Auto-close ended auctions + winner selection
- User profiles (wins, active bids, approval status)
- Admin dashboard (stats, bid monitor, moderation)
- Security: Helmet, Mongo sanitize, CSRF protection, rate limiting
- Search/filter/sort/pagination + countdown timers + dark mode
- Mock email verification endpoint

## Project Structure (MVC)
```
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
public/
  css/
  js/
  *.html
```

## Setup Instructions

### 1) Install dependencies
```bash
npm install
```

### 2) MongoDB setup
- Install MongoDB locally and start it.
- Default URI used: `mongodb://127.0.0.1:27017`

### 3) Configure environment
```bash
cp .env.example .env
```
Update `.env` values, especially `JWT_SECRET`.

### 4) Seed admin user
```bash
npm run seed-admin
```

### 5) Run application
```bash
npm run dev
```
or
```bash
npm start
```

Open: `http://localhost:3000`

## Main Pages
- `/` landing page
- `/register`, `/login`
- `/dashboard`, `/profile`
- `/auctions`, `/auction-detail?id=<auctionId>`
- `/admin`, `/pending-approvals`, `/create-auction`

## Important API Endpoints
- `POST /api/auth/register`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/auctions`, `GET /api/auctions/:id`
- `POST /api/auctions/:id/bids`
- `GET /api/admin/stats`
- `GET /api/admin/pending-users`
- `PATCH /api/admin/users/:id/status`
- `POST /api/admin/auctions`

## Notes
- New users are created as `approved: false` and cannot bid until approved by admin.
- Users must also verify email via mock verification link before bidding.
- CSRF token required for protected routes (`/api/users/*`, `/api/admin/*`). Fetch token from `/api/csrf-token`.
