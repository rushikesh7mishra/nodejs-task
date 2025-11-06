import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const handleRazorpay = async () => {
    setErr('');
    setLoading(true);
    try {
      console.log('[Checkout] creating razorpay order on backend...');
      const res = await api.post('/orders/razorpay/create'); // backend endpoint
      console.log('[Checkout] backend create response:', res.data);

      const { razorpayOrderId, amount, currency, orderId: myOrderId, key } = res.data;
      setOrderId(myOrderId);

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'MyShop',
        description: `Order ${myOrderId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          console.log('[Checkout][handler] payment success callback from Razorpay:', response);
          try {
            const verifyRes = await api.post(`/orders/${myOrderId}/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: myOrderId
            });
            console.log('[Checkout] backend verification response:', verifyRes.data);
            alert('Payment successful');
            nav('/orders');
          } catch (err) {
            console.error('[Checkout] Payment verification failed:', err?.response?.data || err);
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-3">Checkout</h2>
        {err && <div className="text-red-600 mb-3">{err}</div>}

        {!orderId ? (
          <div className="space-y-4">
            <p className="text-slate-600">Click below to create an order and reserve stock. You will have 15 minutes to pay before auto-cancel.</p>
            <button onClick={handleRazorpay} disabled={loading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md">
              {loading ? 'Please wait...' : 'Pay with Razorpay'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Order created: <strong>{orderId}</strong></p>
            <p>Click Pay to simulate payment (mock endpoint).</p>
            <button onClick={async ()=>{ try { await api.post(`/orders/${orderId}/pay`); alert('Paid'); nav('/orders'); } catch(e){alert('Pay failed')} }} className="w-full bg-green-600 text-white px-4 py-2 rounded-md">Pay Now</button>
          </div>
        )}
      </div>
    </div>
  );
}
