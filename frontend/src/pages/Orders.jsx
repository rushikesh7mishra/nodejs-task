import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o._id} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <div className="font-semibold">Order {o._id}</div>
              <div className="text-sm text-slate-500">Status: <span className="font-medium">{o.status}</span></div>
              <div className="text-sm text-slate-500">Total: ₹{o.totalAmount}</div>
            </div>
            <div className="text-right">
              <div className="text-sm">Items: {o.items.length}</div>
              <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
