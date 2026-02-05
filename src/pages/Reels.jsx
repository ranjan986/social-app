import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Heart, MessageCircle, Share2, Music, ArrowLeft, Volume2, VolumeX, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reels = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Comments State
    const [activeCommentReel, setActiveCommentReel] = useState(null); // The reel currently showing comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

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

    const handleOpenComments = (reel) => {
        setActiveCommentReel(reel);
        setComments(reel.comments || []);
    };

    const handleCloseComments = () => {
        setActiveCommentReel(null);
        setComments([]);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/posts/${activeCommentReel._id}/comment`, { text: newComment });
            // Update comments locally
            const updatedReel = res.data;
            setComments(updatedReel.comments);
            setNewComment("");

            // Update the reel in the main list to reflect comment count change
            setReels(prev => prev.map(r => r._id === updatedReel._id ? updatedReel : r));
        } catch (err) {
            console.error("Failed to comment", err);
        }
    };

    if (loading) return (
        <div className="h-screen w-full bg-black flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header / Back Button - Absolute so it floats over */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
                    <ArrowLeft size={28} />
                </button>
                <div className="text-white font-bold text-lg">Reels</div>
                <div className="w-7"></div> {/* Spacer for center alignment */}
            </div>

            {/* Reels Container */}
            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide h-full w-full">
                {reels.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-white gap-4">
                        <div className="text-6xl">🎬</div>
                        <h2 className="text-2xl font-bold">No Reels Yet</h2>
                        <p className="text-gray-400">Be the first to share a short video!</p>
                        <Link to="/" className="px-6 py-2 bg-pink-500 rounded-full font-semibold mt-4">
                            Create a Reel
                        </Link>
                    </div>
                )}

                {reels.map((reel) => (
                    <ReelItem
                        key={reel._id}
                        reel={reel}
                        user={user}
                        onOpenComments={() => handleOpenComments(reel)}
                    />
                ))}
            </div>

            {/* Comments Modal / Drawer */}
            {activeCommentReel && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0" onClick={handleCloseComments}></div>

                    <div className="relative w-full max-w-md bg-[#1e1e1e] rounded-t-2xl h-[70vh] flex flex-col shadow-2xl transform transition-transform duration-300">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-white font-semibold">Comments ({comments.length})</h3>
                            <button onClick={handleCloseComments} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {comments.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">No comments yet. Start the conversation!</div>
                            ) : (
                                comments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                            {/* Ideally user avatar here, dealing with population if not present */}
                                            {comment.user.avatar ? (
                                                <img src={comment.user.avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-white">?</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-white text-sm font-semibold">{comment.user.name || "User"}</span>
                                                <span className="text-gray-500 text-xs">Recently</span>
                                            </div>
                                            <p className="text-gray-300 text-sm mt-0.5">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-800 bg-[#1e1e1e]">
                            <div className="flex items-center gap-2 bg-[#262626] rounded-full px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    className={`${newComment.trim() ? 'text-blue-500' : 'text-gray-500'} font-semibold text-sm`}
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReelItem = ({ reel, user, onOpenComments }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(reel.likes?.length || 0);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showHeart, setShowHeart] = useState(false); // For double tap animation
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (user && reel.likes) {
            setLiked(reel.likes.includes(user._id));
        }
    }, [user, reel]);

    // Intersection Observer for Auto Play/Pause
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().then(() => {
                        setIsPlaying(true);
                    }).catch(e => console.log("Autoplay prevented", e));
                } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                    videoRef.current.currentTime = 0; // Reset video when out of view
                }
            },
            { threshold: 0.6 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(percent);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const handleDoubleTap = (e) => {
        e.stopPropagation();
        if (!liked) {
            toggleLike();
        }

        // Show heart animation
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    };

    const toggleLike = async () => {
        if (!user) return alert("Please login to like");

        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

        try {
            await api.put(`/posts/${reel._id}/like`);
        } catch (err) {
            setLiked(wasLiked);
            setLikeCount(prev => wasLiked ? prev : prev + 1); // Revert logic corrected
        }
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: `Watch this reel by ${reel.user.name}`,
                url: window.location.href, // Or a specific reel URL if you implement routing per reel
            });
        } catch (err) {
            // Fallback
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full snap-start flex items-center justify-center bg-[#111] overflow-hidden"
        >
            {/* Video Player */}
            <div
                className="relative w-full h-full max-w-lg mx-auto"
                onClick={togglePlay}
                onDoubleClick={handleDoubleTap}
            >
                <video
                    ref={videoRef}
                    src={reel.media[0]}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={isMuted}
                    onTimeUpdate={handleTimeUpdate}
                />

                {/* Double Tap Heart Animation */}
                {showHeart && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-bounce">
                        <Heart size={100} fill="white" className="text-white opacity-80" />
                    </div>
                )}

                {/* Play/Pause Icon Overlay (Optional: fade out) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                        <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

            {/* Top Right Controls (Mute) */}
            <div className="absolute top-20 right-4 z-20">
                <button onClick={toggleMute} className="p-2 bg-black/30 rounded-full backdrop-blur-md text-white">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-4 left-4 right-16 z-20 text-white">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                    <img
                        src={reel.user.avatar || "https://via.placeholder.com/40"}
                        alt={reel.user.name}
                        className="w-9 h-9 rounded-full border border-white/50 object-cover"
                    />
                    <span className="font-semibold text-sm hover:underline cursor-pointer">{reel.user.name}</span>
                    <button className="px-3 py-1 border border-white/60 rounded-lg text-xs font-semibold backdrop-blur-sm hover:bg-white/20 transition">Follow</button>
                </div>

                {/* Caption */}
                <p className="text-sm mb-4 line-clamp-2">{reel.caption}</p>

                {/* Audio Info */}
                <div className="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                    <Music size={12} />
                    <div className="overflow-hidden w-24 whitespace-nowrap">
                        <span className="animate-marquee inline-block">Original Audio • {reel.user.name}</span>
                    </div>
                </div>
            </div>

            {/* Sidebar Actions */}
            <div className="absolute bottom-6 right-3 z-30 flex flex-col items-center gap-6">
                {/* Like */}
                <button onClick={toggleLike} className="flex flex-col items-center gap-1 group">
                    <Heart
                        size={28}
                        className={`transition-transform duration-200 group-active:scale-75 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        strokeWidth={2}
                    />
                    <span className="text-xs font-medium text-white">{likeCount}</span>
                </button>

                {/* Comment */}
                <button onClick={onOpenComments} className="flex flex-col items-center gap-1">
                    <MessageCircle size={28} className="text-white hover:text-gray-200" strokeWidth={2} />
                    <span className="text-xs font-medium text-white">{reel.comments?.length || 0}</span>
                </button>

                {/* Share */}
                <button onClick={handleShare} className="flex flex-col items-center gap-1">
                    <Share2 size={28} className="text-white hover:text-gray-200" strokeWidth={2} />
                    <span className="text-xs font-medium text-white">Share</span>
                </button>

                {/* Mini Profile / More */}
                <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden mt-2">
                    <img src={reel.user.avatar || "https://via.placeholder.com/40"} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
                <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default Reels;
