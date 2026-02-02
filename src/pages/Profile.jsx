import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Camera, Trash2, Edit2, Grid, Play, Settings, MapPin, Link as LinkIcon } from 'lucide-react';
import SettingsModal from '../components/SettingsModal';

const Profile = () => {
    const { user, updateUser, t } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'reels'

    // Profile Edit State
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [newBio, setNewBio] = useState(user?.bio || '');
    const [uploading, setUploading] = useState(false);



    useEffect(() => {
        const fetchUserPosts = async () => {
            const userId = user?._id || user?.id; // Handle specific ID mismatch
            if (!userId) return;
            try {
                const res = await api.get(`/posts/user/${userId}`);
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch user posts", err);
            } finally {
                setLoadingPosts(false);
            }
        };

        if (user) {
            fetchUserPosts();
            setNewName(user.name || '');
            setNewBio(user.bio || '');
        }
    }, [user]);

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            alert("Failed to delete post");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        try {
            const uploadRes = await api.post('/upload', formData);
            const updateRes = await api.put('/users/update', { avatar: uploadRes.data.url });
            updateUser(updateRes.data.user);
        } catch (err) {
            alert('Failed to update avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!newName.trim()) return;
        try {
            const res = await api.put('/users/update', { name: newName, bio: newBio });
            updateUser(res.data.user);
            setShowEditProfile(false);
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    const filteredPosts = posts.filter(post => {
        if (activeTab === 'posts') return post.type !== 'reel';
        if (activeTab === 'reels') return post.type === 'reel';
        return true;
    });

    return (
        <div style={{ maxWidth: '935px', margin: '0 auto', padding: '20px' }}>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* Profile Header */}
            <div className="profile-header">
                {/* Avatar Column */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                        <img
                            src={user?.avatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                            alt="Profile"
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                        <label style={{
                            position: 'absolute', bottom: '0', right: '10px',
                            background: 'var(--primary)', color: 'white',
                            borderRadius: '50%', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', border: '2px solid var(--bg-dark)'
                        }}>
                            {uploading ? <div className="loader"></div> : <Camera size={16} />}
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                        </label>
                    </div>
                </div>

                {/* Info Column */}
                <div className="info-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Top Row: Username + Edit + Settings */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '300', margin: 0 }}>{user?.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</h2>

                        {showEditProfile ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="input-field"
                                    style={{ padding: '6px 12px', width: '150px' }}
                                />
                                <button onClick={handleUpdateProfile} className="btn btn-primary" style={{ padding: '6px 12px' }}>Save</button>
                                <button onClick={() => setShowEditProfile(false)} className="btn btn-outline" style={{ padding: '6px 12px' }}>Cancel</button>
                            </div>
                        ) : (
                            <button onClick={() => setShowEditProfile(true)} className="btn" style={{
                                background: 'var(--input-bg)',
                                color: 'var(--text-main)',
                                padding: '6px 16px',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>{t('editProfile')}</button>
                        )}

                        <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                            <Settings size={24} />
                        </button>
                    </div>

                    {/* Middle Row: Stats */}
                    <div className="stats-row" style={{ display: 'flex', gap: '40px', fontSize: '1rem' }}>
                        <span><strong>{posts.length}</strong> {t('posts')}</span>
                        <span><strong>{user?.friends?.length || 0}</strong> {t('friends')}</span>
                        <span><strong>{user?.points || 0}</strong> {t('points')}</span>
                    </div>

                    {/* Bottom Row: Name + Bio */}
                    <div>
                        <div style={{ fontWeight: '600' }}>{user?.name}</div>
                        {showEditProfile ? (
                            <textarea
                                className="input-field"
                                value={newBio}
                                onChange={(e) => setNewBio(e.target.value)}
                                placeholder="Write your bio..."
                                style={{
                                    width: '100%',
                                    marginTop: '8px',
                                    minHeight: '60px',
                                    resize: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        ) : (
                            <div style={{ color: 'var(--text-main)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                                {user?.bio || "Creating content & building dreams ✨\nDM for collab 📩"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '60px' }}>
                <button
                    onClick={() => setActiveTab('posts')}
                    style={{
                        background: 'none', border: 'none', borderTop: activeTab === 'posts' ? '1px solid var(--text-main)' : '1px solid transparent',
                        padding: '16px 0', color: activeTab === 'posts' ? 'var(--text-main)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginTop: '-1px', fontSize: '0.8rem', letterSpacing: '1px'
                    }}
                >
                    <Grid size={12} /> {t('posts').toUpperCase()}
                </button>
                <button
                    onClick={() => setActiveTab('reels')}
                    style={{
                        background: 'none', border: 'none', borderTop: activeTab === 'reels' ? '1px solid var(--text-main)' : '1px solid transparent',
                        padding: '16px 0', color: activeTab === 'reels' ? 'var(--text-main)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginTop: '-1px', fontSize: '0.8rem', letterSpacing: '1px'
                    }}
                >
                    <Play size={12} /> {t('reels').toUpperCase()}
                </button>
            </div>

            {/* Content Grid */}
            <div className="profile-grid">
                {loadingPosts ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
                ) : posts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
                        <div style={{ border: '2px solid var(--text-main)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', opacity: 0.5 }}>
                            <Camera size={30} />
                        </div>
                        <h2>No Posts Yet</h2>
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <div key={post._id} style={{ position: 'relative', aspectRatio: '1/1', background: '#000', cursor: 'pointer' }} className="group">
                            {post.type === 'reel' || (post.media && post.media[0] && post.media[0].endsWith('.mp4')) ? (
                                <video
                                    src={post.media?.[0]}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <img
                                    src={post.media?.[0]}
                                    alt="Post"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}

                            {/* Type Indicator */}
                            {(post.type === 'reel' || post.media?.[0]?.endsWith('.mp4')) && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                    <Play size={18} fill="white" color="white" />
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="hover-overlay" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.3)',
                                display: 'none', // Controlled by CSS hover
                                alignItems: 'center', justifyContent: 'center', gap: '20px',
                                color: 'white', fontWeight: 'bold'
                            }}>
                                <span>❤️ {post.likes?.length || 0}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id); }}
                                    style={{ background: 'white', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}
                                >
                                    <Trash2 size={16} color="black" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Profile;
