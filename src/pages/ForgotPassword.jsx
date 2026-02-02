import { useState } from 'react';
import api from '../api';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setStatus('idle');

        try {
            const res = await api.post('/auth/forgot-password', { email });
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
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md glass rounded-xl border border-border-color p-8 animate-fade-in relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

                <Link to="/login" className="inline-flex items-center gap-2 text-text-muted hover:text-text-main mb-8 transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                    <p className="text-text-muted text-sm">
                        Enter your email address and we'll send you a new password.
                    </p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 text-sm flex items-center gap-3 ${status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-main ml-1">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                className="w-full bg-input-bg border border-border-color focus:border-primary rounded-lg px-4 py-3 pl-10 text-text-main placeholder-text-muted transition-all outline-none"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Processing...
                            </span>
                        ) : 'Send Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
