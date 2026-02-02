import { useState } from 'react';
import api from '../api';
import { Check, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PLANS = [
    { name: 'FREE', price: 0, limit: '1 Question/day' },
    { name: 'BRONZE', price: 100, limit: '5 Questions/day' },
    { name: 'SILVER', price: 300, limit: '10 Questions/day' },
    { name: 'GOLD', price: 1000, limit: 'Unlimited Questions' },
];

const Subscription = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSubscribe = async (plan) => {
        if (plan.price === 0) return;

        // 1. Time Check (UI side, also enforced in backend)
        const now = new Date();
        const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const hour = istTime.getHours();

        if (hour < 10 || hour >= 11) {
            setMsg(`⚠️ Payments are ONLY allowed between 10 AM - 11 AM IST. Current Time (IST): ${istTime.toLocaleTimeString()}`);
            return;
        }

        setLoading(true);
        setMsg('');

        try {
            // 2. Create Order
            const { data: order } = await api.post('/subscription/create-order', { plan: plan.name });

            // 3. Open Razorpay
            const options = {
                key: order.key, // From Backend
                amount: order.amount,
                currency: order.currency,
                name: "SocialPlane",
                description: `${plan.name} Subscription`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        setMsg("Verifying Payment...");
                        const verifyRes = await api.post('/subscription/verify', {
                            plan: plan.name,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        setMsg("✅ " + verifyRes.data.message);
                        alert("Success! " + verifyRes.data.message);
                        // Refresh user logic would go here
                    } catch (verifyErr) {
                        setMsg("❌ Payment Verification Failed: " + verifyErr.message);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: {
                    color: "#8b5cf6"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                setMsg("❌ Payment Failed: " + response.error.description);
            });
            rzp1.open();

        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || 'Payment initiation failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Choose Your Plan</h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '3rem' }}>Unlock more questions and features.</p>

            {msg && <div style={{ textAlign: 'center', padding: '1rem', background: msg.includes('Success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', marginBottom: '2rem', color: 'white' }}>{msg}</div>}

            <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Clock size={20} />
                <span>Payment Window: 10:00 AM - 11:00 AM IST</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => (
                    <div key={plan.name} className="card glass fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                        {user?.subscription?.plan === plan.name && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem' }}>CURRENT</div>
                        )}

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ec4899' }}>
                            ₹{plan.price}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/mo</span>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', width: '100%' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                                <Check size={16} color="#10b981" /> {plan.limit}
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                                <Check size={16} color="#10b981" /> Email Support
                            </li>
                        </ul>

                        <button
                            className={`btn ${user?.subscription?.plan === plan.name ? 'btn-outline' : 'btn-primary'}`}
                            style={{ width: '100%', marginTop: 'auto' }}
                            onClick={() => handleSubscribe(plan)}
                            disabled={loading || user?.subscription?.plan === plan.name}
                        >
                            {user?.subscription?.plan === plan.name ? 'Active' : 'Subscribe'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Subscription;
