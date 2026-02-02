import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Heart, MessageCircle, Share2, Music, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reels = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const res = await api.get('/posts/reels');
            setReels(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading Reels...</div>;

    return (
        <div style={{
            height: '100vh',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            background: 'black',
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, // Overlay entire page
            zIndex: 100 // Above Navbar in some designs, or user can navigate back
        }} className="reels-container">
            {reels.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', textAlign: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '3rem' }}>🎬</div>
                    <h2>No Reels Yet</h2>
                    <p style={{ color: '#94a3b8' }}>Be the first to share a short video!</p>
                    <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', background: '#ec4899', border: 'none' }}>
                        Create a Reel
                    </Link>
                </div>
            )}

            {reels.map((reel) => (
                <ReelItem key={reel._id} reel={reel} />
            ))}
        </div>
    );
};

const ReelItem = ({ reel }) => {
    const videoRef = useRef(null);
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(reel.likes?.length || 0);

    // Initialize like state
    useEffect(() => {
        if (user && reel.likes) {
            const isLiked = reel.likes.some(id => String(id) === String(user._id || user.id));
            setLiked(isLiked);
        }
    }, [user, reel.likes]);

    // Simple Intersection Observer to play/pause
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play();
                } else {
                    videoRef.current?.pause();
                }
            },
            { threshold: 0.6 }
        );

        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    const toggleLike = async () => {
        if (!user) {
            alert("Please login to like");
            return;
        }

        const prevLiked = liked;
        const prevCount = likeCount;

        // Optimistic Update
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);

        try {
            await api.put(`/posts/${reel._id}/like`);
        } catch (err) {
            console.error(err);
            // Revert on error
            setLiked(prevLiked);
            setLikeCount(prevCount);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            scrollSnapAlign: 'start',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#111'
        }}>
            {/* Video Background */}
            <video
                ref={videoRef}
                src={reel.media[0]} // Assuming single video for reel
                style={{ height: '100%', width: '100%', objectFit: 'cover', maxWidth: '500px' }}
                loop
                playsInline
            // muted // Start muted usually, but let's try auto
            />

            {/* Gradient Overlay */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                pointerEvents: 'none'
            }}></div>

            {/* Overlay Info */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '16px', right: '80px',
                color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <img
                        src={reel.user.avatar}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.5)' }}
                    />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{reel.user.name}</span>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.6)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Follow</button>
                </div>
                <p style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.4' }}>{reel.caption}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Music size={12} /> <span>Original Audio</span>
                    </div>
                </div>
            </div>

            {/* Actions Sidebar */}
            <div style={{
                position: 'absolute', bottom: '20px', right: '12px',
                display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', color: 'white',
                zIndex: 10
            }}>
                <div onClick={toggleLike} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Heart size={28} fill={liked ? '#ff3040' : 'transparent'} color={liked ? '#ff3040' : 'white'} strokeWidth={2} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{likeCount}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <MessageCircle size={28} strokeWidth={2} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{reel.comments.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Share2 size={28} strokeWidth={2} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Share</span>
                </div>
                <div style={{ width: '30px', height: '30px', border: '2px solid white', borderRadius: '6px', overflow: 'hidden', marginTop: '10px' }}>
                    <img src={reel.user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>
        </div>
    );
};

export default Reels;
