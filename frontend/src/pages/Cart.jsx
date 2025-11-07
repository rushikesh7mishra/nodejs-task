import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const load = async () => {
    try {
      const res = await api.get('/cart');
      console.log('CART RESPONSE', res.data);
      setCart(res.data || { items: [] });
    } catch (e) {
      setErr('Failed to load cart');
    }
  };

  useEffect(() => { load(); }, []);

  const updateByProduct = async (productId, qty) => {
    try {
      await api.post('/cart', { productId, quantity: qty });
      await load();
    } catch (e) {
      alert('Update failed');
    }
  };
  const updateItemQuantity = async (cartItemId, qty) => {
    try {
      await api.put(`/cart/item/${cartItemId}`, { quantity: qty });
      await load();
    } catch (e) {
      alert('Update failed');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/item/${cartItemId}`);
      await load();
    } catch (e) {
      alert('Remove failed');
    }
  };

  const total = (cart.items || []).reduce((s, it) => {
    const price = it?.product?.price ?? 0;
    const qty = Number(it?.quantity || 0);
    return s + (price * qty);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Cart</h2>
      {err && <div className="text-red-600 mb-4">{err}</div>}

      {(!cart.items || cart.items.length) === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="mb-4">Your cart is empty.</p>
          <Link to={ROUTES.PRODUCTS} className="text-indigo-600 underline">Shop now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(cart.items || []).map((it) => {
            const prod = it.product;
            const removed = !prod;
            return (
              <div key={it._id || prod?._id || Math.random()} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    {removed ? 'Removed' : 'Img'}
                  </div>
                  <div>
                    <div className="font-semibold">{removed ? 'Product removed' : prod.name}</div>
                    <div className="text-sm text-gray-500">₹{removed ? '--' : prod.price}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => updateItemQuantity(it._id, parseInt(e.target.value || 1))}
                    className="w-20 border px-2 py-1 rounded"
                    disabled={removed}
                  />
                  <button onClick={() => removeItem(it._id)} className="text-red-500">Remove</button>
                </div>
              </div>
            );
          })}

          <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-lg font-semibold">Total: ₹{total}</div>
            <div className="flex gap-3">
              <button onClick={() => nav(ROUTES.PRODUCTS)} className="px-4 py-2 border rounded-md">Continue Shopping</button>
              <button onClick={() => nav(ROUTES.CHECKOUT)} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
