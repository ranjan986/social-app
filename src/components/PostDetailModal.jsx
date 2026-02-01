import { useState } from 'react';
import { X, Heart, MessageCircle, Send, MoreHorizontal, Trash2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PostDetailModal = ({ post, isOpen, onClose, onDelete }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [localPost, setLocalPost] = useState(post);
    const [showOptions, setShowOptions] = useState(false);

    if (!isOpen || !post) return null;

    const isOwner = user?._id === post.user?._id || user?.id === post.user?._id;

    const handleLike = async () => {
        try {
            await api.put(`/posts/${post._id}/like`);
            // Optimistic update
            const userId = user._id || user.id;
            const updatedLikes = localPost.likes.includes(userId)
                ? localPost.likes.filter(id => id !== userId)
                : [...localPost.likes, userId];

            setLocalPost({ ...localPost, likes: updatedLikes });
        } catch (err) {
            console.error("Like failed", err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const res = await api.post(`/posts/${post._id}/comment`, { text: comment });
            // Since API returns updated post with comments, verify structure
            // Assuming res.data is the updated post populated with comments
            // Usually we need to refetch to get populated user info or rely on simplistic response
            // For now, let's append loosely to UI
            const newComment = {
                user: { name: user.name, avatar: user.avatar },
                text: comment,
                createdAt: new Date()
            };

            setLocalPost({
                ...localPost,
                comments: [...(localPost.comments || []), newComment]
            });
            setComment('');
        } catch (err) {
            console.error("Comment failed", err);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }} onClick={onClose}>

            {/* Close Button Mobile */}
            <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', color: 'white', background: 'none', border: 'none', zIndex: 1400 }} className="hide-on-desktop">
                <X size={28} />
            </button>

            <div style={{
                background: 'black',
                width: '100%', maxWidth: '1000px',
                height: '90vh', maxHeight: '600px',
                display: 'flex', borderRadius: '4px', overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* Left: Media */}
                <div style={{
                    flex: '1.5', background: 'black',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRight: '1px solid var(--border-color)'
                }} className="modal-media-container">
                    {localPost.type === 'reel' || (localPost.media?.[0]?.endsWith('.mp4')) ? (
                        <video src={localPost.media?.[0]} controls style={{ maxWidth: '100%', maxHeight: '100%', width: '100%' }} />
                    ) : (
                        <img src={localPost.media?.[0]} alt="Post" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )}
                </div>

                {/* Right: Info */}
                <div style={{
                    flex: '1', background: 'var(--bg-card)',
                    display: 'flex', flexDirection: 'column', minWidth: '350px'
                }} className="modal-info-container">

                    {/* Header */}
                    <div style={{
                        padding: '16px', borderBottom: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
                                <img src={localPost.user?.avatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} style={{ width: '100%', height: '100%' }} />
                            </div>
                            <span style={{ fontWeight: '600' }}>{localPost.user?.name}</span>
                        </div>
                        {isOwner && (
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setShowOptions(!showOptions)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                    <MoreHorizontal />
                                </button>
                                {showOptions && (
                                    <div style={{
                                        position: 'absolute', top: '100%', right: 0,
                                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                        borderRadius: '8px', zIndex: 10, minWidth: '120px'
                                    }}>
                                        <button
                                            onClick={() => { onDelete(post._id); onClose(); }}
                                            style={{
                                                width: '100%', padding: '12px', border: 'none', background: 'transparent',
                                                color: '#ef4444', fontWeight: 'bold', textAlign: 'left', cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => setShowOptions(false)}
                                            style={{
                                                width: '100%', padding: '12px', border: 'none', background: 'transparent',
                                                color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Comments Area (Scrollable) */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                        {/* Caption */}
                        {localPost.caption && (
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={localPost.user?.avatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} style={{ width: '100%', height: '100%' }} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: '600', marginRight: '8px' }}>{localPost.user?.name}</span>
                                    <span>{localPost.caption}</span>
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        {localPost.comments?.map((c, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                    {/* Assuming comment has user populated, handled loosely */}
                                    <img src={c.user?.avatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} style={{ width: '100%', height: '100%' }} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: '600', marginRight: '8px' }}>{c.user?.name || 'User'}</span>
                                    <span>{c.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                            <button onClick={handleLike} style={{ background: 'none', border: 'none', color: localPost.likes.includes(user._id || user.id) ? '#ef4444' : 'var(--text-main)', cursor: 'pointer' }}>
                                <Heart size={24} fill={localPost.likes.includes(user._id || user.id) ? '#ef4444' : 'none'} />
                            </button>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <MessageCircle size={24} />
                            </button>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <Send size={24} />
                            </button>
                        </div>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                            {localPost.likes.length} likes
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(localPost.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Add Comment Input */}
                    <form onSubmit={handleComment} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex' }}>
                        <input
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)' }}
                        />
                        <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', opacity: comment.trim() ? 1 : 0.5 }} disabled={!comment.trim()}>
                            Post
                        </button>
                    </form>
                </div>

                <style>{`
                    @media (max-width: 768px) {
                        .modal-info-container {
                            display: none !important; /* Hide details on mobile for simplicity or stack them */
                        }
                        .modal-media-container {
                            flex: 1;
                            border-right: none;
                        }
                        /* Ideally we want a vertical stack on mobile, but for exact Instagram "Popup" on desktop, this is fine. Mobile usually navigates to new screen. 
                           For strict popup logic, we'd stack them.
                        */
                    }
                `}</style>
            </div>
        </div>
    );
};

export default PostDetailModal;
