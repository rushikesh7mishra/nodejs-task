import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setOpen(false);
    onLogout?.();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            <Link to={ROUTES.HOME} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold">M</div>
              <span className="font-semibold text-lg text-slate-900">MyShop</span>
            </Link>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-4">
              <Link to={ROUTES.PRODUCTS} className="text-sm text-slate-600 hover:text-slate-900 transition">Products</Link>
              <Link to={ROUTES.CART} className="text-sm text-slate-600 hover:text-slate-900 transition">Cart</Link>
              <Link to={ROUTES.ORDERS} className="text-sm text-slate-600 hover:text-slate-900 transition">My Orders</Link>
              {user?.role === 'admin' && (
                <Link to={ROUTES.ADMIN_ORDERS} className="text-sm text-slate-600 hover:text-slate-900 transition">Admin Orders</Link>
              )}
            </div>
          </div>

          {/* Right: Auth / actions */}
          <div className="flex items-center gap-4">
            {/* Desktop auth actions */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Link to={ROUTES.LOGIN} className="text-sm text-indigo-600 hover:underline">Login</Link>
                  <Link to={ROUTES.REGISTER} className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition">Register</Link>
                </>
              ) : (
                <>
                  <div className="text-sm text-slate-700">Hi, <span className="font-medium">{user.name || user.email || user.role}</span></div>
                  <button onClick={handleLogout} className="text-sm text-red-500 hover:opacity-90">Logout</button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={() => setOpen(prev => !prev)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <svg className={`w-6 h-6 transition-transform ${open ? 'transform rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      <div className={`md:hidden bg-white border-t ${open ? 'block' : 'hidden'}`}>
        <div className="px-4 pt-4 pb-6 space-y-3">
          <div className="flex flex-col gap-2">
            <Link to={ROUTES.PRODUCTS} onClick={() => setOpen(false)} className="block text-base text-slate-700 py-2 rounded hover:bg-slate-50">Products</Link>
            <Link to={ROUTES.CART} onClick={() => setOpen(false)} className="block text-base text-slate-700 py-2 rounded hover:bg-slate-50">Cart</Link>
            <Link to={ROUTES.ORDERS} onClick={() => setOpen(false)} className="block text-base text-slate-700 py-2 rounded hover:bg-slate-50">My Orders</Link>
            {user?.role === 'admin' && (
              <Link to={ROUTES.ADMIN_ORDERS} onClick={() => setOpen(false)} className="block text-base text-slate-700 py-2 rounded hover:bg-slate-50">Admin Orders</Link>
            )}
          </div>

          <div className="pt-2 border-t mt-2">
            {!user ? (
              <div className="flex flex-col gap-2 mt-3">
                <Link to={ROUTES.LOGIN} onClick={() => setOpen(false)} className="block text-center py-2 rounded-md text-indigo-600">Login</Link>
                <Link to={ROUTES.REGISTER} onClick={() => setOpen(false)} className="block bg-indigo-600 text-white py-2 rounded-md text-center">Register</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-3">
                <div className="text-sm text-slate-700 text-center">Signed in as <span className="font-medium">{user.name || user.email || user.role}</span></div>
                <div className="flex gap-2 justify-center">
                  <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded-md">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
screenY