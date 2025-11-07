#  MyShop - nodejs-task

MyShop - nodejs-task with **Express + MongoDB (backend)** and **React + Vite (frontend)**.  
Includes cart, checkout, Razorpay payments, order auto-cancel (Agenda), and JWT authentication.

---

## 🚀 Features

✅ User authentication (Register / Login)  
✅ Admin panel for product CRUD  
✅ Shopping cart with quantity management  
✅ Checkout flow that **reserves stock**  
✅ **Auto-cancel unpaid orders** after 15 min (Agenda job)  
✅ Razorpay test-mode payment & signature verification  
✅ REST APIs with Joi validation  
✅ Modern React frontend with Tailwind CSS  
✅ Simple Postman collection for testing

---

## ⚙️ Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   Create .env
   npm run dev

## ⚙️ Frontend Setup

1. **Install dependencies**
   ```bash
   cd Frontend
   npm install
   Create .env
   npm run dev

| Method | Endpoint                  | Description                  |
| :----: | ------------------------- | ---------------------------- |
|  POST  | `/auth/register`          | Register user                |
|  POST  | `/auth/login`             | Login (returns token)        |
|   GET  | `/products`               | List products                |
|  POST  | `/products`               | Create (admin only)          |
|   PUT  | `/products/:id`           | Update (admin)               |
| DELETE | `/products/:id`           | Delete (admin)               |
|   GET  | `/cart`                   | Get user cart                |
|  POST  | `/cart`                   | Add/update item              |
| DELETE | `/cart/item/:itemId`      | Remove item                  |
|  POST  | `/orders/checkout`        | Reserve stock & create order |
|  POST  | `/orders/razorpay/create` | Create Razorpay order        |
|  POST  | `/orders/:id/verify`      | Verify payment signature     |
|   GET  | `/orders`                 | User orders                  |


| Command         | Location | Action                        |
| --------------- | -------- | ----------------------------- |
| `npm run dev`   | backend  | Start backend (nodemon)       |
| `npm start`     | backend  | Start production server       |
| `npm run dev`   | frontend | Start React dev server        |
| `npm run build` | frontend | Build frontend for production |

