# NodeJS E-commerce demo

Features:
- JWT auth (register/login)
- Products with stock
- Cart per user (no stock change)
- Checkout reserves stock atomically (MongoDB transactions)
- Mock payment endpoint to mark order as PAID and permanently decrement stock
- Auto-cancel order after 15 minutes using Agenda job queue (stored in MongoDB)
- Admin endpoints to change order status

## Install
1. `npm install`
2. copy `.env.example` to `.env` and update
3. `npm run dev`

## Endpoints (summary)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/cart` (auth)
- `GET /api/cart` (auth)
- `POST /api/orders/checkout` (auth)
- `POST /api/orders/:id/pay` (auth)
- `PATCH /api/admin/orders/:id/status` (admin)
