import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { translations } from '../utils/translations';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    fetchUnreadNotifications(); // Fetch notifications on load
                }
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    };

    const fetchUnreadNotifications = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadNotifications(res.data.count);
        } catch (error) {
            console.error("Failed to fetch notification count", error);
        }
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
            fetchUnreadNotifications();
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
                fetchUnreadNotifications();
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
            fetchUnreadNotifications();
        }

        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUnreadNotifications(0);
    };

    const fetchUserData = async () => {
        try {
            const res = await api.get('/users/me');
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            fetchUnreadNotifications(); // Also refresh notifications
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

    const t = (key) => {
        const lang = user?.preferredLanguage || 'en';
        return translations[lang]?.[key] || translations['en'][key] || key;
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyOtp, logout, loading, updateUser, fetchUserData, googleLogin, unreadNotifications, fetchUnreadNotifications, t }}>
            {children}
        </AuthContext.Provider>
    );
};
