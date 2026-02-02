import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { X, Globe, Shield, Clock, Gift, ChevronRight, LogOut, Check } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const { user, updateUser, logout, t } = useAuth();
    const [activeTab, setActiveTab] = useState('main'); // main, language, privacy, history, points

    // Privacy State
    const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);

    // Language State
    const [lang, setLang] = useState(user?.preferredLanguage || 'en');
    const [pendingLang, setPendingLang] = useState('');
    const [otp, setOtp] = useState('');
    const [showLangOtp, setShowLangOtp] = useState(false);
    const [otpType, setOtpType] = useState('mobile');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [verifying, setVerifying] = useState(false);

    // History State
    const [history, setHistory] = useState([]);

    // Points State
    const [transferAmount, setTransferAmount] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset states when opening
            setActiveTab('main');
            setIsPublic(user?.isPublic ?? true);
            setLang(user?.preferredLanguage || 'en');
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/users/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch login history", err);
        }
    };

    const togglePrivacy = async () => {
        try {
            const newStatus = !isPublic;
            const res = await api.put('/users/privacy', { isPublic: newStatus });
            setIsPublic(newStatus);
            updateUser(res.data.user);
            // Don't alert standard toggle, maybe just a toast or silent update
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update privacy');
        }
    };

    const handleLanguageChange = async (newLang) => {
        if (newLang === lang) return;
        setPendingLang(newLang);

        if (newLang === 'fr') {
            try {
                await api.post('/language/request-change', { language: newLang });
                setOtpType('email');
                setShowLangOtp(true);
            } catch (err) {
                alert(err.response?.data?.message || "Failed to initiate language change");
            }
        } else {
            setOtpType('mobile');
            if (!user.phone) {
                alert("Please add a phone number to your profile first.");
                return;
            }

            try {
                if (!window.recaptchaVerifier) {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-settings', {
                        'size': 'invisible'
                    });
                }
                const phoneNumber = user.phone.includes('+') ? user.phone : `+91${user.phone}`;
                const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
                setConfirmationResult(confirmation);
                setShowLangOtp(true);
            } catch (error) {
                console.error("Firebase Auth Error:", error);
                if (error.code === 'auth/billing-not-enabled') {
                    // Demo mode callback
                    setConfirmationResult({
                        confirm: async (code) => {
                            if (code === '123456') return true;
                            throw new Error('Invalid Code');
                        }
                    });
                    setShowLangOtp(true);
                    alert("Demo Mode: Use 123456");
                } else {
                    alert("Authentication Failed: " + error.message);
                }

                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                }
            }
        }
    };

    const verifyLanguageOtp = async () => {
        setVerifying(true);
        try {
            if (otpType === 'mobile') {
                await confirmationResult.confirm(otp);
                await api.post('/language/update-verified', { language: pendingLang });
            } else {
                await api.post('/language/verify-change', { language: pendingLang, otp });
            }
            setLang(pendingLang);
            updateUser({ ...user, preferredLanguage: pendingLang });
            setShowLangOtp(false);
            setOtp('');
            alert('Language updated!');
        } catch (err) {
            alert("Verification Failed");
        } finally {
            setVerifying(false);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/points/transfer', { recipientEmail, amount: Number(transferAmount) });
            alert("Points transferred!");
            setTransferAmount('');
            setRecipientEmail('');
        } catch (err) {
            alert(err.response?.data?.message || "Transfer failed");
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-card)',
                width: '100%',
                maxWidth: '400px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-color)',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {activeTab !== 'main' ? (
                        <button onClick={() => setActiveTab('main')} className="btn btn-ghost" style={{ padding: '4px' }}>
                            ← Back
                        </button>
                    ) : (
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('settings')}</h3>
                    )}
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
                    <div id="recaptcha-container-settings"></div>

                    {activeTab === 'main' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="settings-item" onClick={() => setActiveTab('language')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Globe size={20} /> {t('language')}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                    {lang.toUpperCase()} <ChevronRight size={16} />
                                </div>
                            </button>

                            <button className="settings-item" onClick={() => setActiveTab('points')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Gift size={20} /> Transfer Points
                                </div>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </button>

                            <button className="settings-item" onClick={() => setActiveTab('history')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Clock size={20} /> Login Activity
                                </div>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </button>

                            <div className="settings-item" style={{ justifyContent: 'space-between', cursor: 'default' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Shield size={20} /> Private Account
                                </div>
                                <label className="switch" style={{ transform: 'scale(0.8)' }}>
                                    <input type="checkbox" checked={!isPublic} onChange={togglePrivacy} />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '16px 0' }}></div>

                            <button className="settings-item" onClick={logout} style={{ color: '#ef4444' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <LogOut size={20} /> {t('logout')}
                                </div>
                            </button>
                        </div>
                    )}

                    {activeTab === 'language' && (
                        <div>
                            {!showLangOtp ? (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {['en', 'es', 'hi', 'pt', 'zh', 'fr'].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => handleLanguageChange(l)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                background: lang === l ? 'rgba(0, 149, 246, 0.1)' : 'transparent',
                                                border: lang === l ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                                color: lang === l ? 'var(--primary)' : 'var(--text-main)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{l === 'en' ? 'English' : l === 'es' ? 'Spanish' : l}</span>
                                            {lang === l && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <p style={{ marginBottom: '12px' }}>Enter OTP sent to your {otpType}:</p>
                                    <input
                                        className="input-field"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        placeholder="OTP Code"
                                        style={{ marginBottom: '16px' }}
                                    />
                                    <button onClick={verifyLanguageOtp} className="btn btn-primary" style={{ width: '100%' }} disabled={verifying}>
                                        {verifying ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {history.map((h, i) => (
                                <div key={i} style={{ padding: '12px', background: 'var(--input-bg)', borderRadius: '8px', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '500' }}>{h.browser} on {h.os}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {new Date(h.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'points' && (
                        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', background: 'var(--input-bg)', borderRadius: '8px', textAlign: 'center' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>{user.points}</span>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Current Balance</p>
                            </div>

                            <input
                                className="input-field"
                                placeholder="Recipient Email"
                                value={recipientEmail}
                                onChange={e => setRecipientEmail(e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Amount"
                                value={transferAmount}
                                onChange={e => setTransferAmount(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary">Transfer Points</button>
                        </form>
                    )}
                </div>

                <style>{`
                    .settings-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px;
                        background: transparent;
                        border: none;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        color: var(--text-main);
                        cursor: pointer;
                        width: 100%;
                        font-size: 1rem;
                        transition: background 0.2s;
                    }
                    .settings-item:hover {
                        background: rgba(255,255,255,0.05);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default SettingsModal;
