import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Film, PlusSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = ({ onCreateClick }) => {
    const { user } = useAuth();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="bottom-nav glass" style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            height: '60px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1300,
            background: 'var(--bg-dark)'
        }}>
            <Link to="/" style={{ color: isActive('/') ? 'white' : 'var(--text-main)' }}>
                <Home size={28} strokeWidth={isActive('/') ? 3 : 2} />
            </Link>

            <Link to="/community" style={{ color: isActive('/community') ? 'white' : 'var(--text-main)' }}>
                <Compass size={28} strokeWidth={isActive('/community') ? 3 : 2} />
            </Link>

            <Link to="/reels" style={{ color: isActive('/reels') ? 'white' : 'var(--text-main)' }}>
                <Film size={28} strokeWidth={isActive('/reels') ? 3 : 2} />
            </Link>

            <div
                onClick={onCreateClick}
                style={{ color: 'var(--text-main)', cursor: 'pointer' }}
            >
                <PlusSquare size={28} strokeWidth={2} />
            </div>

            <Link to="/profile" style={{ color: isActive('/profile') ? 'white' : 'var(--text-main)' }}>
                {user?.avatar ? (
                    <img src={user.avatar} style={{ width: '28px', height: '28px', borderRadius: '50%', border: isActive('/profile') ? '2px solid white' : 'none' }} />
                ) : (
                    <User size={28} strokeWidth={isActive('/profile') ? 3 : 2} />
                )}
            </Link>
        </div>
    );
};

export default BottomNav;
