import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProductCreate() {
  const [form, setForm] = useState({ name: '', description: '', price: 0, availableStock: 0 });
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/products', form);
      nav('/products');
    } catch (error) {
      setErr(error?.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Create Product</h2>
        {err && <div className="text-red-600 mb-3">{err}</div>}

        <form onSubmit={submit} className="space-y-4">
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400" />
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-indigo-400" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:parseFloat(e.target.value)})} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400" />
            <input type="number" placeholder="Stock" value={form.availableStock} onChange={e=>setForm({...form,availableStock:parseInt(e.target.value||0)})} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="flex justify-end">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
