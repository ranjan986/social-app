import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Assume we have an endpoint to get current user data. 
                // If not, we rely on what we stored or add an endpoint.
                // Assuming backend has /auth/me or similar. 
                // Based on routes I saw, maybe not? I saw 'login', 'register'.
                // I'll check authRoutes.js later. For now, let's persist user in localStorage too or try to fetch.
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });

        if (res.data.message.includes('OTP')) {
            return { requiresOtp: true, message: res.data.message };
        }

        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
        }

        return { success: true, data: res.data };
    };

    const googleLogin = async (googleUser) => {
        try {
            const res = await api.post('/auth/google-login', {
                email: googleUser.email,
                name: googleUser.displayName,
                avatar: googleUser.photoURL,
                uid: googleUser.uid
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setUser(res.data.user);
            }
            return { success: true, data: res.data };
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const verifyOtp = async (email, otp) => {
        const res = await api.post('/auth/verify-login-otp', { email, otp });

        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
        }

        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const fetchUserData = async () => {
        try {
            const res = await api.get('/users/me');
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            return res.data;
        } catch (error) {
            console.error("Failed to fetch user data", error);
            return null;
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyOtp, logout, loading, updateUser, fetchUserData, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};
