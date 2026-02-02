import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopNav = () => {
    return (
        <div className="top-nav" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--bg-dark)',
            borderBottom: '1px solid var(--border-color)',
            padding: '0 16px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px', // Prevent sticking
            width: '100%' // Ensure full width for right alignment
        }}>
            <Link to="/" className="logo" style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--text-main)',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
            }}>
                SocialPlane
            </Link>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
                <Link to="/notifications" style={{ color: 'var(--text-main)', display: 'flex' }}>
                    <Heart size={24} />
                </Link>
                <Link to="/questions" style={{ color: 'var(--text-main)', display: 'flex' }}>
                    <MessageCircle size={24} />
                </Link>
            </div>
        </div>
    );
};

export default TopNav;
