import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopNav = () => {
    const { unreadNotifications } = useAuth();
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
                <Link to="/notifications" style={{ color: 'var(--text-main)', display: 'flex', position: 'relative' }}>
                    <Heart size={24} />
                    {unreadNotifications > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </div>
                    )}
                </Link>
                <Link to="/questions" style={{ color: 'var(--text-main)', display: 'flex' }}>
                    <MessageCircle size={24} />
                </Link>
            </div>
        </div>
    );
};

export default TopNav;
