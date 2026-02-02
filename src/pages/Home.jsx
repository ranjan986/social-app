import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import StoryList from '../components/StoryList';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Share2, Image, Video, X, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const Home = () => {
    // ... (existing state)
    const { user, t } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [newPostType, setNewPostType] = useState('post'); // 'post' or 'reel'
    const [loading, setLoading] = useState(true);

    // Upload States
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null); // 'image' or 'video'
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);

    const friendCount = user?.friends?.length || 0;
    const canPost = friendCount > 0;

    // Comment Logic
    const [activePostId, setActivePostId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // ... (useEffect and fetchPosts same)

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ... (handleFileSelect, clearFile, handlePost, handleLike, isVideo same)
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setFileType(file.type.startsWith('video') ? 'video' : 'image');
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() && !selectedFile) return;

        setUploading(true);
        let mediaUrl = null;

        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                mediaUrl = uploadRes.data.url;
            }

            await api.post('/posts', {
                caption: newPost,
                media: mediaUrl ? [mediaUrl] : [],
                type: newPostType
            });

            setNewPost('');
            setNewPostType('post');
            clearFile();
            fetchPosts();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to post');
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/posts/${postId}`);
            fetchPosts();
        } catch (err) {
            console.error(err);
            alert("Failed to delete post");
        }
    };

    const handleLike = async (postId) => {
        try {
            await api.put(`/posts/${postId}/like`);
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const isVideo = (url) => {
        return url.match(/\.(mp4|webm|mov|mkv)$/i) || url.includes('/video/');
    };

    const toggleComments = (postId) => {
        if (activePostId === postId) {
            setActivePostId(null);
        } else {
            setActivePostId(postId);
            setCommentText('');
            setShowEmojiPicker(false);
        }
    };

    const handleComment = async (e, postId) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            await api.post(`/posts/${postId}/comment`, { text: commentText });
            setCommentText('');
            setShowEmojiPicker(false);
            fetchPosts();
        } catch (err) {
            console.error(err);
            alert("Failed to add comment");
        }
    };

    const handleShare = (post) => {
        const shareData = {
            title: 'Check out this post!',
            text: post.caption,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            navigator.clipboard.writeText(`${post.caption} - Shared from SocialPlane`);
            alert("Post content copied to clipboard!");
        }
    };

    const onEmojiClick = (emojiObject) => {
        setCommentText(prev => prev + emojiObject.emoji);
    };

    return (
        <div className="home-layout">
            <main style={{ minWidth: 0, width: '100%' }}>
                <StoryList />
                {/* Create Post Widget */}
                {/* ... (Create post widget code same) */}
                <div className="card glass" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div style={{ width: '100%' }}>
                            <textarea
                                className="input-field"
                                placeholder={canPost ? t('createPost') : "You need at least 1 friend to post."}
                                rows="3"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                disabled={!canPost || uploading}
                                style={{ resize: 'none', background: 'rgba(0,0,0,0.2)' }}
                            />

                            {/* Preview */}
                            {previewUrl && (
                                <div style={{ position: 'relative', marginTop: '1rem', display: 'inline-block' }}>
                                    <button onClick={clearFile} style={{ position: 'absolute', top: -10, right: -10, background: 'red', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'white', zIndex: 10 }}>
                                        <X size={14} />
                                    </button>

                                    {fileType === 'video' ? (
                                        <div style={{ position: 'relative' }}>
                                            <video src={previewUrl} style={{ maxHeight: '200px', borderRadius: '0.5rem' }} controls />
                                            <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input
                                                    type="checkbox"
                                                    id="postAsReel"
                                                    checked={newPostType === 'reel'}
                                                    onChange={(e) => setNewPostType(e.target.checked ? 'reel' : 'post')}
                                                />
                                                <label htmlFor="postAsReel" style={{ fontSize: '0.8rem', color: 'white', cursor: 'pointer' }}>Post as Reel</label>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={previewUrl} alt="Preview" style={{ maxHeight: '200px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*,video/*"
                                onChange={handleFileSelect}
                            />
                            <button className="btn btn-outline" onClick={() => fileInputRef.current.click()} disabled={!canPost || uploading} style={{ border: 'none', padding: '0.5rem' }}>
                                <Image size={20} />
                            </button>
                            <button className="btn btn-outline" onClick={() => fileInputRef.current.click()} disabled={!canPost || uploading} style={{ border: 'none', padding: '0.5rem' }}>
                                <Video size={20} />
                            </button>
                        </div>

                        <button className="btn btn-primary" onClick={handlePost} disabled={(!newPost && !selectedFile) || !canPost || uploading}>
                            {uploading ? t('posting') : t('post')}
                        </button>
                    </div>
                    {!canPost && <p style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '0.5rem' }}>Add friends to unlock posting permissions.</p>}
                </div>


                {/* Feed */}
                {loading ? <p>Loading feed...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {posts.length === 0 ? <p className="text-muted">No posts yet. Be the first!</p> : posts.map(post => {
                            const mediaItem = post.media && post.media.length > 0 ? post.media[0] : null;
                            const isVid = mediaItem && isVideo(mediaItem);

                            return (

                                <div key={post._id} className="card fade-in">
                                    {/* Post Header */}
                                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <Link to={`/user/${post.user?._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {post.user?.avatar ? (
                                                    <img src={post.user.avatar} alt={post.user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                        {post.user?.name?.[0] || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 style={{ margin: 0 }}>{post.user?.name || 'Unknown User'}</h4>
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </Link>
                                        </div>
                                        {user?._id === post.user?._id && (
                                            <button onClick={() => handleDeletePost(post._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Caption & Media */}
                                    <div style={{ padding: '0 16px' }}>
                                        {post.caption && <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{post.caption}</p>}
                                    </div>

                                    {mediaItem && (
                                        <div style={{ width: '100%', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                            {isVid ? (
                                                <video
                                                    src={mediaItem}
                                                    controls
                                                    style={{ width: '100%', maxHeight: '600px', backgroundColor: '#000', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <img
                                                    src={mediaItem}
                                                    alt="Post"
                                                    style={{ width: '100%', maxHeight: '700px', objectFit: 'contain' }} // Maintain aspect ratio better
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="card-footer" style={{ display: 'flex', gap: '1.5rem', borderTop: 'none' }}>
                                        <button onClick={() => handleLike(post._id)} style={{ background: 'none', border: 'none', color: post.likes?.includes(user?._id) ? '#ec4899' : '#fff', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Heart size={24} fill={post.likes?.includes(user?._id) ? '#ec4899' : 'none'} />
                                        </button>
                                        <button onClick={() => toggleComments(post._id)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <MessageCircle size={24} strokeWidth={2} />
                                        </button>
                                        <button onClick={() => handleShare(post)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Share2 size={24} />
                                        </button>
                                    </div>

                                    {/* Likes Count */}
                                    <div style={{ padding: '0 16px', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
                                        {post.likes?.length || 0} likes
                                    </div>

                                    {/* Comments Section */}
                                    {activePostId === post._id && (
                                        <div style={{ padding: '0 16px 16px 16px' }}>
                                            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                                                {post.comments?.length > 0 ? (
                                                    post.comments.map((comment, index) => {
                                                        const currentUserId = user?._id || user?.id;
                                                        const commentUserId = comment.user?._id || comment.user?.id || comment.user;
                                                        const postUserId = post.user?._id || post.user?.id || post.user;

                                                        const canDelete = String(currentUserId) === String(commentUserId) || String(currentUserId) === String(postUserId);

                                                        return (
                                                            <div key={index} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }} className="group">
                                                                <div>
                                                                    <span style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{comment.user?.name || 'Unknown'}: </span>
                                                                    <span style={{ color: '#cbd5e1' }}>{comment.text}</span>
                                                                </div>
                                                                {/* Delete Icon - Visible if Owner or Post Owner */}
                                                                {canDelete && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm("Delete this comment?")) {
                                                                                api.delete(`/posts/${post._id}/comment/${comment._id}`)
                                                                                    .then(() => fetchPosts())
                                                                                    .catch(err => alert("Failed to delete"));
                                                                            }
                                                                        }}
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px', opacity: 1 }}
                                                                        className="hover:opacity-100"
                                                                    >
                                                                        <X size={14} color="#ef4444" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No comments yet.</p>
                                                )}
                                            </div>

                                            <div style={{ position: 'relative' }}>
                                                {showEmojiPicker && (
                                                    <div style={{ position: 'absolute', bottom: '50px', zIndex: 10 }}>
                                                        <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} />
                                                    </div>
                                                )}

                                                <form onSubmit={(e) => handleComment(e, post._id)} style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                        style={{ padding: '0.5rem' }}
                                                    >
                                                        <Smile size={20} />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        className="input-field"
                                                        placeholder="Write a comment..."
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        style={{ padding: '0.5rem' }}
                                                    />
                                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                                        Post
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <aside>
                {/* Stats same */}
                <div className="card glass" style={{ position: 'sticky', top: '100px' }}>
                    <h3>Community Stats</h3>
                    <p style={{ color: '#94a3b8' }}>Active Users: 1,245</p>
                    <p style={{ color: '#94a3b8' }}>Posts Today: 342</p>

                    <div style={{ marginTop: '2rem' }}>
                        <h4>Your Plan</h4>
                        <div style={{ background: 'var(--gradient-primary)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>{user?.subscription?.plan || 'FREE'}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Home;
