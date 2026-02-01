import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Login, 2: OTP
    const [error, setError] = useState('');

    const { login, verifyOtp, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await googleLogin(result.user);
            navigate('/');
        } catch (err) {
            console.error("Google Login UI Error:", err);
            setError(err.message || 'Google Login failed');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await login(email, password);
            // Wait, standard login throws if failed? 
            // api.post implementation in context should handle errors or rethrow.
            // I need to update AuthContext to throw or return error. 
            // Assuming api.js throws on 401.

            if (res.requiresOtp) {
                setStep(2);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleOtp = async (e) => {
        e.preventDefault();
        try {
            await verifyOtp(email, otp);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-bg-card p-10 rounded-xl border-t-4 border-primary shadow-2xl animate-fade-in">
                {/* Logo Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-tr from-[#0095f6] to-[#e1306c] bg-clip-text text-transparent tracking-tight">SocialPlane</h1>
                    <p className="text-text-muted text-base">{step === 1 ? 'Welcome back! Login to continue.' : 'Verify your identity.'}</p>
                </div>

                {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 text-sm border border-red-500/20 flex items-center gap-2">⚠️ {error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleLogin}>
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium">Email Address</label>
                            <div className="relative">
                                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="email"
                                    className="w-full pl-12 h-12 bg-input-bg rounded-lg border border-transparent focus:border-primary focus:ring-0 text-text-main outline-none transition-all placeholder-text-muted/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium">Password</label>
                                <Link to="/forgot-password" className="text-sm text-primary font-semibold hover:text-primary-hover">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="password"
                                    className="w-full pl-12 h-12 bg-input-bg rounded-lg border border-transparent focus:border-primary focus:ring-0 text-text-main outline-none transition-all placeholder-text-muted/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-base transition-colors shadow-lg shadow-primary/20">
                            Log In
                        </button>

                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-border-color"></div>
                            <span className="text-text-muted text-sm font-medium">OR</span>
                            <div className="flex-1 h-px bg-border-color"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 border border-slate-300 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5" />
                            Continue with Google
                        </button>

                        <div className="mt-8 text-center text-base">
                            <span className="text-text-muted">Don't have an account? </span>
                            <Link to="/register" className="text-primary font-semibold hover:text-primary-hover">Sign up</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleOtp}>
                        <div className="mb-8 text-center">
                            <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-full">
                                <ShieldCheck size={48} className="text-primary" />
                            </div>
                            <p className="text-text-muted text-base leading-relaxed">
                                We've sent a 6-digit code to your email.<br />Please enter it below to verify your identity.
                            </p>
                        </div>

                        <div className="mb-8">
                            <input
                                type="text"
                                className="w-full h-16 bg-input-bg rounded-lg border-2 border-border-color focus:border-primary text-center text-3xl font-bold tracking-[0.5em] text-text-main outline-none transition-all"
                                value={otp}
                                placeholder="------"
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        <button type="submit" className="w-full py-3.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-base transition-colors shadow-lg shadow-primary/20">
                            Verify & Enter
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
