import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { User, MapPin, Calendar, MessageSquare, Heart, Lock, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser, updateUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [friendStatus, setFriendStatus] = useState('none'); // none, sent, connected

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

    const handleAddFriend = async () => {
        try {
            await api.post(`/users/add-friend/${id}`);
            setFriendStatus('connected');
            // Update current user state to include new friend
            const updatedFriends = [...(currentUser.friends || []), id];
            updateUser({ ...currentUser, friends: updatedFriends });
            alert('Friend added successfully!');
            fetchProfile(); // Refresh
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add friend');
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>Loading profile...</div>;
    if (error) return <div className="container" style={{ textAlign: 'center', color: '#ef4444', padding: '5rem' }}>{error}</div>;

    return (
        <div className="container">
            <div className="card glass fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
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

                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h1 style={{ margin: 0, fontSize: '2rem' }}>{profileUser.name}</h1>
                            {profileUser.isPrivate && <Lock size={20} color="#94a3b8" title="Private Profile" />}
                        </div>
                        <p style={{ color: '#94a3b8', margin: '0 0 1rem 0' }}>{profileUser.email.replace(/(.{3})(.*)(?=@)/, "$1***")}</p>

                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold' }}>{profileUser.points || 0}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Points</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold' }}>{profileUser.friends?.length || profileUser.friendsCount || 0}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Friends</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold' }}>{posts.length}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Posts</span>
                            </div>
                        </div>

                        {id !== currentUser?.id && (
                            <button
                                onClick={handleAddFriend}
                                disabled={friendStatus === 'connected'}
                                className={`btn ${friendStatus === 'connected' ? 'btn-outline' : 'btn-primary'}`}
                                style={{ padding: '0.5rem 1.5rem' }}
                            >
                                {friendStatus === 'connected' ? (
                                    <><Check size={18} /> Friends</>
                                ) : (
                                    <><UserPlus size={18} /> Add Friend</>
                                )}
                            </button>
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
