import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const token = res.data.token;
      onLogin(token);
      nav('/');
    } catch (error) {
      setErr(error?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">Create account</h2>
        <p className="text-sm text-slate-500 mb-6">Start shopping — it’s quick and easy.</p>

        <form onSubmit={submit} className="space-y-4">
          {err && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{err}</div>}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1 block w-full rounded-md border-gray-200 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              className="mt-1 block w-full rounded-md border-gray-200 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="mt-1 block w-full rounded-md border-gray-200 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-4 py-2 rounded-md shadow transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          By creating an account you agree to our <span className="underline">Terms</span>.
        </p>
      </div>
    </div>
  );
}
