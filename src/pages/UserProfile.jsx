import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { User, MapPin, Calendar, MessageSquare, Heart, Lock, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser, updateUser, t } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [friendStatus, setFriendStatus] = useState('none'); // none, sent, received, connected

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/users/profile/${id}`);
            setProfileUser(res.data);

            // Check friend status
            if (currentUser?.friends?.includes(id)) {
                setFriendStatus('connected');
            } else if (currentUser?.sentFriendRequests?.includes(id)) {
                setFriendStatus('sent');
            } else if (currentUser?.friendRequests?.includes(id)) {
                setFriendStatus('received');
            }

            // Fetch posts if public or friend
            if (res.data.isPublic || id === currentUser?.id || currentUser?.friends?.includes(id)) {
                const postsRes = await api.get(`/posts/user/${id}`);
                setPosts(postsRes.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (action) => {
        try {
            if (action === 'request') {
                await api.post(`/users/${id}/request`);
                setFriendStatus('sent');
                // Update local user state
                const updatedSent = [...(currentUser.sentFriendRequests || []), id];
                updateUser({ ...currentUser, sentFriendRequests: updatedSent });
            } else if (action === 'accept') {
                await api.post(`/users/${id}/accept`);
                setFriendStatus('connected');
                const updatedFriends = [...(currentUser.friends || []), id];
                // Remove from requests
                const updatedRequests = (currentUser.friendRequests || []).filter(reqId => reqId !== id);
                updateUser({ ...currentUser, friends: updatedFriends, friendRequests: updatedRequests });
                fetchProfile();
            } else if (action === 'reject') {
                await api.delete(`/users/${id}/reject`);
                setFriendStatus('none');
                const updatedRequests = (currentUser.friendRequests || []).filter(reqId => reqId !== id);
                updateUser({ ...currentUser, friendRequests: updatedRequests });
            } else if (action === 'cancel') {
                await api.delete(`/users/${id}/cancel`);
                setFriendStatus('none');
                const updatedSent = (currentUser.sentFriendRequests || []).filter(reqId => reqId !== id);
                updateUser({ ...currentUser, sentFriendRequests: updatedSent });
            }
        } catch (err) {
            console.error("Friend request error:", err);
            alert('Request failed: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>Loading profile...</div>;
    if (error) return <div className="container" style={{ textAlign: 'center', color: '#ef4444', padding: '5rem' }}>{error}</div>;

    return (
        <div className="container">
            <div className="card glass fade-in" style={{ marginBottom: '2rem' }}>
                <div className="profile-header" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            {profileUser.avatar ? (
                                <img
                                    src={profileUser.avatar}
                                    alt={profileUser.name}
                                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                                />
                            ) : (
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '3rem', fontWeight: 'bold'
                                }}>
                                    {profileUser.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="info-col">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h1 style={{ margin: 0, fontSize: '2rem' }}>{profileUser.name}</h1>
                            {profileUser.isPrivate && <Lock size={20} color="#94a3b8" title="Private Profile" />}
                        </div>
                        <p style={{ color: '#94a3b8', margin: '0 0 1rem 0' }}>{profileUser.email.replace(/(.{3})(.*)(?=@)/, "$1***")}</p>

                        {profileUser.bio && (
                            <div style={{ color: 'var(--text-main)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                                {profileUser.bio}
                            </div>
                        )}

                        <div className="stats-row" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold' }}>{profileUser.points || 0}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'capitalize' }}>{t('points')}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold' }}>{profileUser.friends?.length || profileUser.friendsCount || 0}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t('friends')}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold' }}>{posts.length}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'capitalize' }}>{t('posts')}</span>
                            </div>
                        </div>

                        {id !== currentUser?.id && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {friendStatus === 'connected' ? (
                                    <button className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', cursor: 'default' }}>
                                        <Check size={18} /> Friends
                                    </button>
                                ) : friendStatus === 'sent' ? (
                                    <button onClick={() => handleConnect('cancel')} className="btn btn-outline" style={{ padding: '0.5rem 1.5rem' }}>
                                        Cancel Request
                                    </button>
                                ) : friendStatus === 'received' ? (
                                    <>
                                        <button onClick={() => handleConnect('accept')} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                                            Accept
                                        </button>
                                        <button onClick={() => handleConnect('reject')} className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', borderColor: '#ef4444', color: '#ef4444' }}>
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => handleConnect('request')} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                                        <UserPlus size={18} /> Add Friend
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <h2 style={{ marginBottom: '1.5rem' }}>Posts</h2>

            {profileUser.isPrivate && friendStatus !== 'connected' && id !== currentUser?.id ? (
                <div className="card glass" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Lock size={48} style={{ marginBottom: '1rem', color: '#94a3b8' }} />
                    <h3>This Account is Private</h3>
                    <p style={{ color: '#94a3b8' }}>Follow this user to see their posts and updates.</p>
                </div>
            ) : posts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {posts.map(post => (
                        <div key={post._id} className="card glass">
                            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{post.caption}</p>
                            {post.media && (
                                <img
                                    src={post.media}
                                    alt="Post content"
                                    style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }}
                                />
                            )}
                            <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Heart size={16} /> {post.likes?.length || 0}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <MessageSquare size={16} /> {post.comments?.length || 0}
                                </span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                    No posts yet.
                </div>
            )}
        </div>
    );
};

export default UserProfile;
