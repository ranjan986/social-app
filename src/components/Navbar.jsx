import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Globe, MessageSquare, Trophy } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar glass">
            <div className="container nav-content">
                <Link to="/" className="logo">
                    SocialPlane
                </Link>

                {user ? (
                    <>
                        <div className="nav-links">
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/reels" className="nav-link" style={{ color: '#ec4899', fontWeight: 'bold' }}>Reels</Link>
                            <Link to="/community" className="nav-link">Community</Link>
                            <Link to="/questions" className="nav-link">
                                <MessageSquare size={18} style={{ display: 'inline', marginRight: '0.3rem' }} />
                                Questions
                            </Link>
                            <Link to="/leaderboard" className="nav-link">
                                <Trophy size={18} style={{ display: 'inline', marginRight: '0.3rem' }} />
                                Leaderboard
                            </Link>
                            <Link to="/subscription" className="nav-link">Subscription</Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Globe size={18} />
                                <span>EN</span>
                            </div>

                            <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} />
                                <span>{user.name || 'Profile'}</span>
                            </Link>

                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="nav-links">
                        <Link to="/login" className="btn btn-primary">Login</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
