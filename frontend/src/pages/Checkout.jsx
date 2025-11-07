import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

function formatRemaining(ms) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  const qs = new URLSearchParams(location.search);
  const queryOrderId = qs.get('orderId');

  const loadOrder = async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      setOrderId(id);
    } catch (e) {
      console.error('failed load order', e);
      setErr(e?.response?.data?.message || 'Failed to load order');
    }
  };

  useEffect(() => {
    if (queryOrderId) {
      loadOrder(queryOrderId);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, [queryOrderId]);

  useEffect(() => {
    if (!orderId) return;
    const poll = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
        if (res.data.status === 'PAID') {
          clearInterval(pollRef.current);
        }
        if (res.data.status === 'CANCELLED') {
          clearInterval(pollRef.current);
        }
      } catch (e) {
        console.error('poll order failed', e);
      }
    };
    pollRef.current = setInterval(poll, 5000);
    (async () => await poll())();
    return () => clearInterval(pollRef.current);
  }, [orderId]);

  const getRemainingMs = () => {
    if (!order || !order.createdAt) return 0;
    const created = new Date(order.createdAt).getTime();
    return created + 15 * 60 * 1000 - Date.now();
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setErr(prev => prev);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleRazorpay = async () => {
    setErr('');
    setLoading(true);
    try {
      const res = await api.post('/orders/razorpay/create');
      const { razorpayOrderId, amount, currency, orderId: myOrderId, key } = res.data;
      setOrderId(myOrderId);

      await loadOrder(myOrderId);

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'MyShop',
        description: `Order ${myOrderId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            await api.post(`/orders/${myOrderId}/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: myOrderId
            });
            alert('Payment successful');
            nav('/orders');
          } catch (err) {
            console.error('Payment verification failed', err);
            alert('Payment verification failed: ' + (err?.response?.data?.message || err.message));
          }
        },
        prefill: { name: '', email: '' },
        theme: { color: '#4f46e5' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('[Checkout] Razorpay payment.failed event:', response);
        api.post('/debug/razorpay-failure', { clientResponse: response, frontendTimestamp: new Date().toISOString() }).catch(()=>{});
        const desc = response?.error?.description || response?.error?.reason || 'Payment failed';
        alert('Payment failed: ' + desc);
      });

      rzp.open();
    } catch (e) {
      console.error('[Checkout] failed to create razorpay order:', e);
      setErr(e?.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const quickPayMock = async () => {
    if (!orderId) return;
    try {
      await api.post(`/orders/${orderId}/pay`);
      alert('Payment (mock) successful');
      nav('/orders');
    } catch (e) {
      console.error('mock pay failed', e);
      alert('Mock pay failed: ' + (e?.response?.data?.message || e.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-3">Checkout</h2>
        {err && <div className="text-red-600 mb-3">{err}</div>}

        {!orderId ? (
          <div className="space-y-4">
            <p className="text-slate-600">
              Click below to create an order. This will reserve stock for 15 minutes — pay before the timer runs out or the order will be cancelled.
            </p>
            <button onClick={handleRazorpay} disabled={loading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md">
              {loading ? 'Please wait...' : 'Pay with Razorpay'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-slate-600">Order ID</div>
              <div className="font-mono break-all">{orderId}</div>
              <div className="mt-2">
                <div className="text-sm text-slate-600">Status: <span className="font-medium">{order?.status}</span></div>
                <div className="text-sm text-slate-600">
                  Total: <span className="font-semibold">₹{order?.totalAmount}</span>
                </div>
                {order?.status === 'PENDING_PAYMENT' && (
                  <div className="mt-2 text-amber-700">
                    Time left to pay: <span className="font-mono">{formatRemaining(getRemainingMs())}</span>
                  </div>
                )}
                {order?.status === 'CANCELLED' && <div className="mt-2 text-red-600">This order was cancelled (payment not received in time).</div>}
                {order?.status === 'PAID' && <div className="mt-2 text-green-600">Payment received — thank you!</div>}
              </div>
            </div>

            {order?.status === 'PENDING_PAYMENT' && (
              <div className="space-y-2">
                <button onClick={handleRazorpay} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md">Pay with Razorpay</button>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => nav('/products')} className="px-4 py-2 border rounded-md">Continue Shopping</button>
              <button onClick={() => nav('/orders')} className="px-4 py-2 bg-slate-900 text-white rounded-md">My Orders</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
