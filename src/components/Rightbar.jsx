import { UserPlus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api';

const Rightbar = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await api.get('/users');
                // Take first 5 users as suggestions
                setSuggestions(res.data.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch suggestions", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    const handleFollow = async (userId) => {
        try {
            await api.post(`/users/${userId}/request`);
            // Remove from suggestions list
            setSuggestions(suggestions.filter(user => user._id !== userId));
            alert("Friend request sent!");
        } catch (err) {
            console.error("Failed to send request", err);
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    const trends = [
        { id: 1, tag: '#WebDevelopment', posts: '12.5k' },
        { id: 2, tag: '#ReactJS', posts: '8.2k' },
        { id: 3, tag: '#Design', posts: '5.1k' },
    ];

    return (
        <div className="rightbar" style={{
            width: '320px',
            height: '100vh',
            position: 'fixed',
            right: 0,
            top: 0,
            padding: '2rem 1.5rem',
            borderLeft: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-dark)',
            overflowY: 'auto'
        }}>
            {/* Search Placeholder if needed in Sidebar, but we have Topbar now */}

            {/* Suggestions */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '600' }}>Suggested for you</h3>
                    <Link to="/community" style={{ fontSize: '0.8rem', color: '#ec4899', textDecoration: 'none' }}>See all</Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? (
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Loading users...</p>
                    ) : suggestions.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No suggestions available.</p>
                    ) : (
                        suggestions.map(user => (
                            <Link to={`/user/${user._id}`} key={user._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'var(--input-bg)',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                        color: '#fff',
                                        flexShrink: 0
                                    }}>
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            user.name ? user.name[0] : 'U'
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Suggested based on interests</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent navigation
                                        handleFollow(user._id);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#3b82f6',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Friend
                                </button>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Trends */}
            <div className="card" style={{ padding: '1rem', background: 'var(--bg-card)', border: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <TrendingUp size={20} color="#fbbf24" />
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Trending Now</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {trends.map(trend => (
                        <div key={trend.id}>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{trend.tag}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{trend.posts} posts</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Links */}
            <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: '#525252' }}>
                <span>Privacy</span>•<span>Terms</span>•<span>Advertising</span>•<span>Cookies</span>
                <p style={{ width: '100%', marginTop: '0.5rem' }}>© 2026 SocialPlane From User</p>
            </div>
        </div>
    );
};

export default Rightbar;
