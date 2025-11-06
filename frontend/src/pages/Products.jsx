import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function Products({ user }) {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      setErr('Failed to load products');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Products</h2>
        {user?.role === 'admin' && <Link to={ROUTES.CREATE_PRODUCT} className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-md hover:bg-slate-800">Create</Link>}
      </div>

      {err && <div className="text-red-500 mb-4">{err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
            <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400">
              {/* placeholder for image; replace with <img src=... /> if available */}
              <span className="text-sm">Image</span>
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg text-slate-900 mb-1">{p.name}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{p.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">₹{p.price}</div>
                <div className="text-xs text-slate-400">Available: {p.availableStock}</div>
              </div>

              <button
                onClick={async () => {
                  try {
                    await api.post('/cart', { productId: p._id, quantity: 1 });
                    alert('Added to cart');
                  } catch (e) {
                    alert(e?.response?.data?.message || 'Failed to add to cart');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md shadow"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
