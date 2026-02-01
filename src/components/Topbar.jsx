import { useState } from 'react';
import { Search, Bell, MessageCircle, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Topbar = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(`/community?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="topbar" style={{
            height: '60px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 900
        }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search for friends..."
                    className="input-field"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    style={{
                        paddingLeft: '40px',
                        background: 'var(--input-bg)',
                        border: 'none',
                        borderRadius: '20px',
                        height: '40px'
                    }}
                />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                </button>

                <Link to="/notifications" style={{ position: 'relative', color: 'var(--text-main)' }}>
                    <Bell size={24} />
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        background: '#ef4444',
                        borderRadius: '50%'
                    }}></span>
                </Link>

                <Link to="/questions" style={{ color: 'var(--text-main)' }}>
                    <MessageCircle size={24} />
                </Link>

                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'var(--text-main)' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        overflow: 'hidden'
                    }}>
                        {user?.avatar ? (
                            <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            user?.name?.[0] || 'U'
                        )}
                    </div>
                    <span style={{ fontWeight: '600' }}>{user?.name}</span>
                </Link>
            </div>
        </div>
    );
};

export default Topbar;
