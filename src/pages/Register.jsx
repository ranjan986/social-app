import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import api from '../api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await googleLogin(result.user);
            navigate('/');
        } catch (err) {
            console.error("Google Signup Error:", err);
            setError(err.message || 'Google signup failed');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-bg-card p-10 rounded-xl border-t-4 border-secondary shadow-2xl animate-fade-in">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-tr from-[#0095f6] to-[#e1306c] bg-clip-text text-transparent tracking-tight">SocialPlane</h1>
                    <h2 className="text-xl font-medium text-text-main mt-2">Create Account</h2>
                </div>

                {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 text-sm border border-red-500/20">⚠️ {error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-medium">Full Name</label>
                        <div className="relative">
                            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                name="name"
                                type="text"
                                className="w-full pl-12 h-12 bg-input-bg rounded-lg border border-transparent focus:border-secondary focus:ring-0 text-text-main outline-none transition-all placeholder-text-muted/50"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-medium">Email Address</label>
                        <div className="relative">
                            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                name="email"
                                type="email"
                                className="w-full pl-12 h-12 bg-input-bg rounded-lg border border-transparent focus:border-secondary focus:ring-0 text-text-main outline-none transition-all placeholder-text-muted/50"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-medium">Phone Number</label>
                        <div className="relative">
                            <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                name="phone"
                                type="text"
                                className="w-full pl-12 h-12 bg-input-bg rounded-lg border border-transparent focus:border-secondary focus:ring-0 text-text-main outline-none transition-all placeholder-text-muted/50"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Mobile number"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Password</label>
                        <div className="relative">
                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                name="password"
                                type="password"
                                className="w-full pl-12 h-12 bg-input-bg rounded-lg border border-transparent focus:border-secondary focus:ring-0 text-text-main outline-none transition-all placeholder-text-muted/50"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-base transition-colors shadow-lg shadow-primary/20">
                        Sign Up
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
                        Sign up with Google
                    </button>

                    <div className="mt-8 text-center text-base">
                        <span className="text-text-muted">Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-primary-hover">Login</Link></span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
