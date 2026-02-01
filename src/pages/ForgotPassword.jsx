import { useState, useEffect } from 'react';
import api from '../api';
import { Mail, ArrowLeft, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const ForgotPassword = () => {
    const [method, setMethod] = useState('email'); // 'email' or 'phone'
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle');

    // Phone / OTP States
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);

    useEffect(() => {
        if (window.location.hostname === 'localhost') {
            auth.settings.appVerificationDisabledForTesting = true;
        }

        // Cleanup global verifier on mount/unmount
        if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear(); } catch (e) { }
            window.recaptchaVerifier = null;
        }
        return () => {
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch (e) { }
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    // Setup ReCaptcha
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            const container = document.getElementById('recaptcha-container');
            if (container) container.innerHTML = '';

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
            });
        }
    };

    const handleSendPhoneOtp = async () => {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        try {
            // Must be in E.164 format (e.g., +919999999999)
            const phoneNumber = inputValue.includes('+') ? inputValue : `+91${inputValue}`;

            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setShowOtp(true);
            setMessage(`OTP Initiated. If using a Test Number, enter your Test Code (No SMS will be sent).`);
            setStatus('success');
        } catch (error) {
            console.error(error);
            let msg = error.message;
            if (error.code === 'auth/billing-not-enabled' || error.code === 'auth/too-many-requests') {
                // Demo Mode Fallback
                setMessage(`⚠️ Limit Reached/Billing disabled. DEMO MODE ACTIVATED.\nUse Code: 123456 to reset.`);
                setStatus('success'); // Yellow/Green warning
                setConfirmationResult({
                    confirm: async (code) => {
                        if (code === '123456') return { user: { phoneNumber: inputValue } };
                        throw new Error('Invalid Demo Code');
                    }
                });
                setShowOtp(true);
                return;
            } else if (error.code === 'auth/quota-exceeded') {
                msg = "SMS Quota Exceeded.";
            } else if (error.code === 'auth/captcha-check-failed') {
                msg = "Recaptcha verification failed. Please try again.";
            }
            setMessage("Failed: " + msg);
            setStatus('error');

            // Clear recaptcha
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            await confirmationResult.confirm(otp);
            // Validated!
            // Now call backend to reset password knowing user verified phone
            const phoneNumber = inputValue.includes('+') ? inputValue : `+91${inputValue}`;
            const res = await api.post('/auth/reset-password-mobile-verified', { phone: phoneNumber });

            setMessage(`Success! ${res.data.message} ${res.data.newPassword ? `Your new password is: ${res.data.newPassword}` : ''}`);
            setStatus('success');
            setShowOtp(false); // Done
        } catch (error) {
            setMessage("Invalid OTP.");
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setStatus('idle');

        if (method === 'phone') {
            await handleSendPhoneOtp();
            return;
        }

        // Email flow matches old backend logic
        try {
            const res = await api.post('/auth/forgot-password', { email: inputValue });
            setMessage(res.data.message);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card glass fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Reset Password</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <button
                        className={`btn ${method === 'email' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => { setMethod('email'); setMessage(''); setShowOtp(false); }}
                    >
                        Email
                    </button>
                    <button
                        className={`btn ${method === 'phone' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => { setMethod('phone'); setMessage(''); setShowOtp(false); }}
                    >
                        Phone (Firebase)
                    </button>
                </div>

                {message && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        background: status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                        color: status === 'success' ? '#6ee7b7' : '#fcd34d'
                    }}>
                        {message}
                    </div>
                )}

                {/* Recaptcha Container for Firebase */}
                <div id="recaptcha-container"></div>

                {!showOtp ? (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">{method === 'email' ? 'Email Address' : 'Phone Number'}</label>
                            <div style={{ position: 'relative' }}>
                                {method === 'email' ?
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} /> :
                                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                }
                                <input
                                    type={method === 'email' ? "email" : "text"}
                                    className="input-field"
                                    placeholder={method === 'email' ? "you@example.com" : "+919999999999"}
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Processing...' : (method === 'phone' ? 'Send OTP' : 'Send Reset Link')}
                        </button>
                    </form>
                ) : (
                    <div>
                        <div className="input-group">
                            <label className="input-label">Enter OTP</label>
                            <input
                                type="text"
                                className="input-field"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                            />
                            <p style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.5rem' }}>
                                <b>Test Mode:</b> If using a Test Number, enter your fixed Test Code. No SMS is sent.
                            </p>
                        </div>
                        <button onClick={handleVerifyOtp} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Reset Password'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
