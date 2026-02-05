import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const FriendsListModal = ({ isOpen, onClose, userId }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            fetchFriends();
        }
    }, [isOpen, userId]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users/${userId}/friends`);
            setFriends(res.data);
        } catch (err) {
            console.error("Failed to fetch friends", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="bg-bg-card border border-border-color rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative animate-fade-in">
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-4 text-text-main">Friends</h2>

                {loading ? (
                    <div className="text-center py-8 text-text-muted">Loading friends...</div>
                ) : friends.length === 0 ? (
                    <div className="text-center py-8 text-text-muted">No friends found.</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {friends.map(friend => (
                            <Link
                                key={friend._id}
                                to={`/user/${friend._id}`}
                                onClick={onClose}
                                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-text-main no-underline"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                    {friend.avatar ? (
                                        <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-primary">{friend.name?.[0]}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold">{friend.name}</p>
                                    {friend.bio && (
                                        <p className="text-xs text-text-muted truncate max-w-[200px]">{friend.bio}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsListModal;
