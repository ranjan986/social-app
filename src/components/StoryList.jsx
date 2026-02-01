import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StoryList = () => {
    const { user } = useAuth();
    const [stories, setStories] = useState([]);
    const [selectedStoryUser, setSelectedStoryUser] = useState(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchStories();
    }, []);

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
    };

    const closeStory = () => {
        setSelectedStoryUser(null);
        setCurrentStoryIndex(0);
    };

    const nextStory = () => {
        if (!selectedStoryUser) return;
        if (currentStoryIndex < selectedStoryUser.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else {
            closeStory();
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
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'black', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={closeStory}>
                    <div style={{
                        width: '100%', maxWidth: '400px', height: '100%',
                        position: 'relative', display: 'flex', flexDirection: 'column'
                    }} onClick={(e) => e.stopPropagation()}>

                        {/* Progress Bars */}
                        <div style={{
                            position: 'absolute', top: '10px', left: '10px', right: '10px',
                            display: 'flex', gap: '5px', zIndex: 10
                        }}>
                            {selectedStoryUser.stories.map((st, idx) => (
                                <div key={st._id} style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                                    <div style={{
                                        width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? '50%' : '0%', // Mock progress
                                        height: '100%', background: 'white', borderRadius: '2px'
                                    }}></div>
                                </div>
                            ))}
                        </div>

                        {/* Story Content */}
                        <div style={{ flex: 1, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} onClick={nextStory}>
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

                            {/* User Info Overlay */}
                            <div style={{ position: 'absolute', top: '25px', left: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                    src={selectedStoryUser.user.avatar}
                                    style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                                />
                                <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedStoryUser.user.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryList;
