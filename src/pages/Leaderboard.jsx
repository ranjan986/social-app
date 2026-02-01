import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, Award } from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        if (user?.id) {
            fetchUserRank();
        }
    }, [user]);

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/leaderboard/top');
            setLeaders(res.data);
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRank = async () => {
        try {
            const res = await api.get(`/leaderboard/user/${user.id}`);
            setUserRank(res.data);
        } catch (err) {
            console.error('Failed to fetch user rank:', err);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy size={24} style={{ color: '#ffd700' }} />;
        if (rank === 2) return <Medal size={24} style={{ color: '#c0c0c0' }} />;
        if (rank === 3) return <Medal size={24} style={{ color: '#cd7f32' }} />;
        return null;
    };

    const getPlanColor = (plan) => {
        const colors = {
            FREE: '#94a3b8',
            BRONZE: '#cd7f32',
            SILVER: '#c0c0c0',
            GOLD: '#ffd700'
        };
        return colors[plan] || '#94a3b8';
    };

    return (
        <div className="container">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <Trophy size={48} style={{ color: '#fbbf24', marginBottom: '1rem' }} />
                    <h1 style={{ marginBottom: '0.5rem' }}>Leaderboard</h1>
                    <p style={{ color: '#94a3b8' }}>Top contributors ranked by points</p>
                </div>

                {/* User's Current Rank */}
                {userRank && (
                    <div className="card" style={{ marginBottom: '2rem', background: '#262626', border: '1px solid #404040' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                            <div>
                                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Your Rank</h3>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                                    Out of {userRank.totalUsers} users
                                </p>
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ec4899' }}>
                                #{userRank.rank}
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="card" style={{ background: '#000', border: '1px solid #262626' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            Loading leaderboard...
                        </div>
                    ) : leaders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            No users found
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #262626' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.9rem' }}>Rank</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.9rem' }}>User</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.9rem' }}>Plan</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.9rem' }}>Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaders.map((leader) => (
                                        <tr
                                            key={leader._id}
                                            style={{
                                                borderBottom: '1px solid #262626',
                                                background: leader._id === user?.id ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {getRankIcon(leader.rank)}
                                                    <span style={{
                                                        fontWeight: leader.rank <= 3 ? 'bold' : 'normal',
                                                        fontSize: leader.rank <= 3 ? '1.2rem' : '1rem',
                                                        color: '#fff'
                                                    }}>
                                                        #{leader.rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <Link to={`/user/${leader._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                                                    {leader.avatar ? (
                                                        <img src={leader.avatar} alt={leader.name} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{
                                                            width: '35px',
                                                            height: '35px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {leader.name?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: '500', color: '#fff' }}>{leader.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                            {leader.email.replace(/(.{3})(.*)(?=@)/, "$1***")}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '0.25rem',
                                                    background: `${getPlanColor(leader.plan)}20`,
                                                    color: getPlanColor(leader.plan),
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {leader.plan}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <Award size={16} style={{ color: '#fbbf24' }} />
                                                    <span style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 'bold',
                                                        color: '#fbbf24'
                                                    }}>
                                                        {leader.points}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#fcd34d'
                }}>
                    <p style={{ margin: 0 }}>
                        💡 <strong>How to climb the leaderboard:</strong> Answer questions (+5 points), get upvotes (+5 bonus at 5 upvotes), and stay active daily!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
