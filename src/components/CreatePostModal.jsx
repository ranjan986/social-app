import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import api from '../api';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMedia(file);

        // Determine type based on MIME
        if (file.type.startsWith('image/')) {
            setMediaType('image');
        } else if (file.type.startsWith('video/')) {
            setMediaType('video');
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!media) {
            alert("Please select an image or video");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Media
            const formData = new FormData();
            formData.append('file', media);

            const uploadRes = await api.post('/upload', formData);
            const mediaUrl = uploadRes.data.url;

            // 2. Create Post
            // Determine post type (reel if video, post if image for now)
            const type = mediaType === 'video' ? 'reel' : 'post';

            await api.post('/posts', {
                caption,
                media: [mediaUrl],
                type
            });

            setCaption('');
            setMedia(null);
            setMediaPreview(null);
            if (onPostCreated) onPostCreated();
            onClose();
            alert('Post created successfully!');
        } catch (err) {
            console.error("Create post failed", err);
            alert(err.response?.data?.message || "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 1200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div className="create-post-modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '12px', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    position: 'relative'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Create new post</h3>
                    <button onClick={onClose} style={{
                        position: 'absolute', right: '12px', background: 'none', border: 'none',
                        color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        Cancel
                    </button>
                    {loading && (
                        <div style={{ position: 'absolute', left: '12px' }}>
                            <Loader2 className="animate-spin" size={20} />
                        </div>
                    )}
                </div>

                {/* Body */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>

                    {/* Media Preview / Selection */}
                    <div style={{
                        aspectRatio: '1/1', background: '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderBottom: '1px solid var(--border-color)',
                        position: 'relative'
                    }}>
                        {mediaPreview ? (
                            mediaType === 'video' ? (
                                <video src={mediaPreview} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <img src={mediaPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            )
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <ImageIcon size={64} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
                                <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Drag photos and videos here</p>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="btn btn-primary"
                                >
                                    Select from computer
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                        />

                        {mediaPreview && !loading && (
                            <button
                                onClick={() => { setMedia(null); setMediaPreview(null); }}
                                style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: 'rgba(0,0,0,0.6)', color: 'white',
                                    border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer'
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Caption Input */}
                    {mediaPreview && (
                        <div style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <textarea
                                    className="input-field"
                                    placeholder="Write a caption..."
                                    rows={4}
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    style={{ border: 'none', resize: 'none', fontSize: '1rem' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {mediaPreview && (
                    <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sharing...' : 'Share'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePostModal;
