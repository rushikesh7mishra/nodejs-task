import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/orders'); // replace with admin endpoint if available
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      load();
    } catch (e) {
      alert('Update failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Admin Orders</h2>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o._id} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <div className="font-semibold">Order {o._id}</div>
              <div className="text-sm text-slate-500">Status: <span className="font-medium">{o.status}</span></div>
              <div className="text-sm text-slate-500">Total: ₹{o.totalAmount}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>updateStatus(o._id,'SHIPPED')} className="px-3 py-1 bg-blue-600 text-white rounded">Ship</button>
              <button onClick={()=>updateStatus(o._id,'DELIVERED')} className="px-3 py-1 bg-green-600 text-white rounded">Deliver</button>
              <button onClick={()=>updateStatus(o._id,'CANCELLED')} className="px-3 py-1 bg-red-500 text-white rounded">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
