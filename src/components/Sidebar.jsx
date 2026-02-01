import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Compass, MessageSquare, Heart, PlusSquare, User, Menu, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [showMore, setShowMore] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { icon: <Home size={28} strokeWidth={isActive('/') ? 3 : 2} />, label: "Home", path: "/" },
        { icon: <Search size={28} />, label: "Search", path: "/community" }, // Redirects to Community for finding friends
        { icon: <Compass size={28} strokeWidth={isActive('/community') ? 3 : 2} />, label: "Explore", path: "/community" },
        { icon: <Film size={28} strokeWidth={isActive('/reels') ? 3 : 2} />, label: "Reels", path: "/reels" },
        { icon: <MessageSquare size={28} strokeWidth={isActive('/questions') ? 3 : 2} />, label: "Messages", path: "/questions" }, // Using Questions as Messages placeholder
        { icon: <Heart size={28} />, label: "Notifications", path: "/notifications" },
    ];

    return (
        <div className="sidebar" style={{
            position: 'fixed',
            top: 0, left: 0,
            height: '100vh',
            width: '244px', // Narrower pro standard
            borderRight: '1px solid var(--border-color)',
            padding: '2rem 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 1000, // High z-index to ensure visibility
            backgroundColor: 'var(--bg-dark)'
        }}>
            <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            <div>
                {/* Logo */}
                <Link to="/" className="logo" style={{ display: 'block', marginBottom: '2.5rem', paddingLeft: '1rem', fontSize: '1.8rem' }}>
                    SocialPlane
                </Link>

                {/* Nav Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="nav-link-item"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                textDecoration: 'none',
                                transition: 'background 0.2s',
                                fontWeight: isActive(item.path) ? 'bold' : 'normal'
                            }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '1.1rem' }}>{item.label}</span>
                        </Link>
                    ))}

                    {/* Create Button (Custom Handler) */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="nav-link-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '12px',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            width: '100%'
                        }}
                    >
                        <PlusSquare size={28} />
                        <span style={{ fontSize: '1.1rem' }}>Create</span>
                    </button>

                    <Link
                        to="/profile"
                        className="nav-link-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.8rem 1rem',
                            borderRadius: '8px',
                            color: isActive('/profile') ? 'white' : 'var(--text-main)',
                            fontWeight: isActive('/profile') ? 'bold' : 'normal',
                            textDecoration: 'none'
                        }}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} style={{ width: '28px', height: '28px', borderRadius: '50%', border: isActive('/profile') ? '2px solid white' : 'none' }} />
                        ) : (
                            <User size={28} strokeWidth={isActive('/profile') ? 3 : 2} />
                        )}
                        <span style={{ fontSize: '1.1rem' }}>Profile</span>
                    </Link>
                </div>
            </div>


            {/* Bottom Menu */}
            <div style={{ padding: '0 1rem', position: 'relative' }}>
                {showMore && (
                    <div className="glass" style={{
                        position: 'absolute', bottom: '100%', left: '1rem', right: '1rem',
                        background: '#262626',
                        borderRadius: '0.75rem',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                        <button onClick={toggleTheme} style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-main)',
                            padding: '0.8rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderBottom: '1px solid var(--border-color)'
                        }}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <button onClick={logout} style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            padding: '0.8rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }} className="btn-logout">
                            Log out
                        </button>
                    </div>
                )}
                <div onClick={() => setShowMore(!showMore)} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '12px 12px', borderRadius: '8px', transition: 'background 0.2s', color: 'var(--text-main)' }}>
                    <Menu size={28} />
                    <span style={{ fontSize: '1.1rem' }}>More</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
