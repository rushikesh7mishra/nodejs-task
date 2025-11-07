import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function getExpiresAt(order) {
  const created = new Date(order.createdAt).getTime();
  return created + 15 * 60 * 1000;
}
function formatRemaining(ms) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);        
  const [error, setError] = useState('');
  const nav = useNavigate();
  const intervalRef = useRef(null);
  const pollRef = useRef(null);

  const loadFromServer = async () => {
    setError('');
    try {
      const res = await api.get('/orders');
      setOrders(Array.isArray(res.data) ? res.data : (res.data?.orders || []));
    } catch (e) {
      console.error('Failed to load orders', e);
      setError('Failed to load orders');
    }
  };

  useEffect(() => {
    (async () => { await loadFromServer(); })();

    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);

    pollRef.current = setInterval(() => {
      loadFromServer().catch(() => {});
    }, 10000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(pollRef.current);
    };
  }, []);

  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      await loadFromServer();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="space-y-4">
        {orders.length === 0 && <div className="text-slate-600">You have no orders yet.</div>}

        {orders.map(o => {
          const expiresAt = getExpiresAt(o);
          const remaining = expiresAt - now;
          const isPending = o.status === 'PENDING_PAYMENT';
          return (
            <div key={o._id} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <div className="font-semibold">Order {o._id}</div>
                <div className="text-sm text-slate-500">
                  Status: <span className="font-medium">{o.status}</span>
                </div>
                <div className="text-sm text-slate-500">Total: ₹{o.totalAmount}</div>
                <div className="text-xs text-slate-400 mt-1">Created: {new Date(o.createdAt).toLocaleString()}</div>

                {isPending && (
                  <div className="mt-2 text-sm text-amber-700">
                    Time left to pay: <span className="font-mono">{formatRemaining(remaining)}</span>
                    {remaining <= 0 && <span className="ml-2 text-red-600">— order will be cancelled shortly</span>}
                  </div>
                )}
              </div>

              <div className="text-right flex flex-col justify-center gap-2">
                <div className="text-sm">Items: {o.items.length}</div>
                <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString()}</div>

                {isPending ? (
                  <>
                    <button
                      onClick={() => nav(`/checkout?orderId=${o._id}`)}
                      className="mt-2 px-3 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      Pay Now
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
