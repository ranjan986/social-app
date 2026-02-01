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
            justifyContent: 'space-between'
        }}>
            <Link to="/" className="logo">
                SocialPlane
            </Link>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/notifications" style={{ color: 'var(--text-main)' }}>
                    <Heart size={24} />
                </Link>
                <Link to="/questions" style={{ color: 'var(--text-main)' }}>
                    <MessageCircle size={24} />
                </Link>
            </div>
        </div>
    );
};

export default TopNav;
