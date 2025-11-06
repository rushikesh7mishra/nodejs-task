import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Welcome to MyShop</h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-8">Simple demo frontend for Node.js backend — browse products, add to cart and checkout with Razorpay.</p>
        <Link to={ROUTES.PRODUCTS} className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold shadow">
          Browse Products
        </Link>
      </div>
    </div>
  );
}
