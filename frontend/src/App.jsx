import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductCreate from './pages/ProductCreate';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminOrders from './pages/AdminOrders';
import { ROUTES } from './constants/routes';

export default function App() {
  const { user, login, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-1">
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.LOGIN} element={<Login onLogin={login} />} />
          <Route path={ROUTES.REGISTER} element={<Register onLogin={login} />} />
          <Route path={ROUTES.PRODUCTS} element={<Products user={user} />} />
          <Route path={ROUTES.CREATE_PRODUCT}
            element={
              <AdminRoute user={user}>
                <ProductCreate />
              </AdminRoute>
            } />
          <Route path={ROUTES.CART}
            element={
              <ProtectedRoute user={user}>
                <Cart />
              </ProtectedRoute>
            } />
          <Route path={ROUTES.CHECKOUT}
            element={
              <ProtectedRoute user={user}>
                <Checkout />
              </ProtectedRoute>
            } />
          <Route path={ROUTES.ORDERS}
            element={
              <ProtectedRoute user={user}>
                <Orders />
              </ProtectedRoute>
            } />
          <Route path={ROUTES.ADMIN_ORDERS}
            element={
              <AdminRoute user={user}>
                <AdminOrders />
              </AdminRoute>
            } />
        </Routes>
      </main>
      <footer className="bg-white p-4 text-center text-sm text-gray-600">Demo frontend</footer>
    </div>
  );
}
