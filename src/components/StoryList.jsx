import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Plus, Heart, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StoryList = () => {
    const { user } = useAuth();
    const [stories, setStories] = useState([]);
    const [selectedStoryUser, setSelectedStoryUser] = useState(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const fileInputRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);

    // Constants
    const STORY_DURATION = 5000; // 5 seconds per image
    const UPDATE_INTERVAL = 50;

    useEffect(() => {
        fetchStories();
    }, []);

    // Auto-advance logic
    useEffect(() => {
        if (!selectedStoryUser || isPaused) return;

        const currentStory = selectedStoryUser.stories[currentStoryIndex];
        const isVideo = currentStory.type === 'video';

        if (isVideo) return;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    nextStory();
                    return 0;
                }
                return prev + (100 / (STORY_DURATION / UPDATE_INTERVAL));
            });
        }, UPDATE_INTERVAL);

        return () => clearInterval(timer);
    }, [selectedStoryUser, currentStoryIndex, isPaused]);

    // Track View
    useEffect(() => {
        if (selectedStoryUser) {
            const story = selectedStoryUser.stories[currentStoryIndex];
            if (story) {
                api.post(`/stories/${story._id}/view`).catch(err => console.error(err));
                setProgress(0);
            }
        }
    }, [selectedStoryUser, currentStoryIndex]);

    const fetchStories = async () => {
        try {
            const res = await api.get('/stories/feed');
            setStories(res.data);
        } catch (err) {
            console.error("Failed to fetch stories", err);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await api.post('/stories', {
                media: uploadRes.data.url,
                type: file.type.startsWith('video') ? 'video' : 'image'
            });

            fetchStories();
            alert("Story added!");
        } catch (err) {
            console.error(err);
            alert("Failed to add story");
        }
    };

    const handleStoryClick = (userStories) => {
        setSelectedStoryUser(userStories);
        setCurrentStoryIndex(0);
        setProgress(0);
        setIsPaused(false);
        setShowViewers(false);
    };

    const closeStory = () => {
        setSelectedStoryUser(null);
        setCurrentStoryIndex(0);
        setProgress(0);
        setShowViewers(false);
    };

    const nextStory = () => {
        if (!selectedStoryUser) return;
        if (currentStoryIndex < selectedStoryUser.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
        } else {
            closeStory();
        }
    };

    const prevStory = () => {
        if (!selectedStoryUser) return;
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        } else {
            setProgress(0);
        }
    };

    const handleTap = (e) => {
        const width = window.innerWidth;
        const x = e.clientX || (e.touches && e.touches[0].clientX);

        if (x < width / 3) {
            prevStory();
        } else {
            nextStory();
        }
    };

    // Pause Handlers
    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);

    const handleLike = async (e, storyId) => {
        e.stopPropagation();
        try {
            const res = await api.put(`/stories/${storyId}/like`);
            const updatedStory = res.data;

            // Update in local state
            setStories(prevStories => prevStories.map(group => {
                const storyIndex = group.stories.findIndex(s => s._id === storyId);
                if (storyIndex > -1) {
                    const newStories = [...group.stories];
                    newStories[storyIndex] = updatedStory;
                    return { ...group, stories: newStories };
                }
                return group;
            }));

            // Update selected view if open
            if (selectedStoryUser) {
                const newStories = [...selectedStoryUser.stories];
                const idx = newStories.findIndex(s => s._id === storyId);
                if (idx > -1) {
                    newStories[idx] = updatedStory;
                    setSelectedStoryUser({ ...selectedStoryUser, stories: newStories });
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e, storyId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this story?")) return;

        try {
            await api.delete(`/stories/${storyId}`);

            // Remove from state
            const storyDeletedCallback = () => {
                fetchStories(); // Simplest way to re-group
                if (selectedStoryUser && selectedStoryUser.stories.length === 1) {
                    closeStory();
                } else if (selectedStoryUser) {
                    // Optimistic update for viewer
                    const newStories = selectedStoryUser.stories.filter(s => s._id !== storyId);
                    setSelectedStoryUser({ ...selectedStoryUser, stories: newStories });
                    if (currentStoryIndex >= newStories.length) setCurrentStoryIndex(0);
                }
            };
            storyDeletedCallback();

        } catch (err) {
            console.error(err);
            alert("Failed to delete story");
        }
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,video/*"
                onChange={handleFileSelect}
            />

            <div style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                padding: '16px 0',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }} className="story-scroll">

                {/* Add Story Button (Self) */}
                <div onClick={() => fileInputRef.current.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', cursor: 'pointer' }}>
                    <div style={{ position: 'relative', width: '62px', height: '62px', marginBottom: '4px' }}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="You" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '1px solid #000' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user?.name?.[0]}
                            </div>
                        )}
                        <div style={{
                            position: 'absolute', bottom: 0, right: 0,
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px', height: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--bg-dark)'
                        }}>
                            <Plus size={14} />
                        </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#fff' }}>Your Story</span>
                </div>

                {/* Friends Stories */}
                {stories.map((s, i) => (
                    <div key={i} onClick={() => handleStoryClick(s)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', cursor: 'pointer' }}>
                        <div style={{
                            width: '66px', height: '66px',
                            borderRadius: '50%',
                            padding: '2px',
                            background: 'var(--gradient-insta)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '4px'
                        }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg-dark)', overflow: 'hidden', background: '#000' }}>
                                {s.user.avatar ? (
                                    <img src={s.user.avatar} alt={s.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {s.user.name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#fff', maxWidth: '70px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {s.user._id === user?.id ? 'Your Story' : s.user.name.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>

            {/* Story Viewer Overlay */}
            {selectedStoryUser && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'black', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseDown={handlePause}
                    onMouseUp={handleResume}
                    onTouchStart={handlePause}
                    onTouchEnd={handleResume}
                    onClick={closeStory} // Close if clicked outside
                >
                    <div style={{
                        width: '100%', maxWidth: '400px', height: '100%',
                        position: 'relative', display: 'flex', flexDirection: 'column'
                    }} onClick={(e) => { e.stopPropagation(); handleTap(e); }}>

                        {/* Progress Bars */}
                        <div style={{
                            position: 'absolute', top: '10px', left: '10px', right: '10px',
                            display: 'flex', gap: '5px', zIndex: 10
                        }}>
                            {selectedStoryUser.stories.map((st, idx) => (
                                <div key={st._id} style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%',
                                        height: '100%', background: 'white', borderRadius: '2px',
                                        transition: idx === currentStoryIndex ? 'width 0.05s linear' : 'none'
                                    }}></div>
                                </div>
                            ))}
                        </div>

                        {/* Story Content */}
                        <div style={{ flex: 1, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {selectedStoryUser.stories[currentStoryIndex].type === 'video' ? (
                                <video
                                    src={selectedStoryUser.stories[currentStoryIndex].media}
                                    autoPlay
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onEnded={nextStory}
                                />
                            ) : (
                                <img
                                    src={selectedStoryUser.stories[currentStoryIndex].media}
                                    alt="Story"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}

                            {/* User Info */}
                            <div style={{ position: 'absolute', top: '25px', left: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                    src={selectedStoryUser.user.avatar}
                                    style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                                />
                                <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedStoryUser.user.name}</span>
                            </div>

                            {/* Actions Overlay */}
                            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '15px', zIndex: 20 }}>
                                <button
                                    onClick={(e) => handleLike(e, selectedStoryUser.stories[currentStoryIndex]._id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <Heart
                                        size={28}
                                        fill={selectedStoryUser.stories[currentStoryIndex].likes?.includes(user?._id) ? "#ef4444" : "none"}
                                        color={selectedStoryUser.stories[currentStoryIndex].likes?.includes(user?._id) ? "#ef4444" : "white"}
                                    />
                                    {selectedStoryUser.stories[currentStoryIndex].likes?.length > 0 && (
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedStoryUser.stories[currentStoryIndex].likes.length}</span>
                                    )}
                                </button>
                            </div>

                            {/* Owner Actions: Delete & Views */}
                            {selectedStoryUser.user._id === user?._id && (
                                <>
                                    <button
                                        onClick={(e) => handleDelete(e, selectedStoryUser.stories[currentStoryIndex]._id)}
                                        style={{ position: 'absolute', top: '25px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 20 }}
                                    >
                                        <Trash2 size={20} color="white" />
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowViewers(!showViewers); }}
                                        style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <Eye size={24} color="white" />
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedStoryUser.stories[currentStoryIndex].viewers?.length || 0}</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Viewers List Drawer */}
                        {showViewers && (
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                height: '50%', background: 'rgba(0,0,0,0.9)',
                                borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
                                padding: '20px', zIndex: 30, overflowY: 'auto'
                            }} onClick={(e) => e.stopPropagation()}>
                                <h3 style={{ color: 'white', margin: '0 0 15px 0' }}>Viewers</h3>
                                {selectedStoryUser.stories[currentStoryIndex].viewers?.length > 0 ? (
                                    <div style={{ color: 'white' }}>
                                        {/* In a real app, populate with user data. Currently just IDs unless populated */}
                                        {selectedStoryUser.stories[currentStoryIndex].viewers.map(viewerId => (
                                            <div key={viewerId} style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
                                                User {viewerId.slice(-4)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#888' }}>No views yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryList;
