import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext'; // Import useAuth

import { Heart, MessageCircle, User, UserPlus, Check, X as XIcon, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const { fetchUserData } = useAuth(); // Get fetchUserData
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            await api.put('/notifications/read-all');
        } catch (err) {
            console.error(err);
            // alert('Failed to fetch notifications: ' + (err.response?.data?.message || err.message));
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleFriendRequest = async (notifId, requesterId, action) => {
        try {
            if (action === 'accept') {
                await api.post(`/users/${requesterId}/accept`);
                alert("Friend request accepted!");
            } else {
                await api.delete(`/users/${requesterId}/reject`);
            }
            // Remove notification from list or update it
            setNotifications(prev => prev.filter(n => n._id !== notifId));

            // Sync global user state (friends list, etc.)
            await fetchUserData();
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading notifications...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="container max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-white">Notifications</h2>
            <div className="bg-bg-card rounded-xl border border-border-color overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-text-muted">
                        No notifications yet.
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif._id} className={`p-4 border-b border-border-color flex items-start sm:items-center gap-4 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                            {/* Icon based on type */}
                            <div className="flex-shrink-0 mt-1 sm:mt-0">
                                {notif.type === 'like' && <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500"><Heart size={20} fill="currentColor" /></div>}
                                {notif.type === 'comment' && <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><MessageCircle size={20} /></div>}
                                {notif.type === 'follow' && <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500"><User size={20} /></div>}
                                {(notif.type === 'friend_request' || notif.type === 'friend_accept') && <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><UserPlus size={20} /></div>}
                                {notif.type === 'question_answered' && <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500"><HelpCircle size={20} /></div>}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="fontWeight-bold text-white mr-1">{notif.sender?.name || 'Unknown User'}</span>
                                    <span className="text-gray-300 break-words">{notif.text}</span>
                                </p>
                                <p className="text-xs text-text-muted mt-1">{new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

                                {/* Friend Request Actions */}
                                {notif.type === 'friend_request' && (
                                    <div className="mt-3 flex gap-3 flex-wrap">
                                        <button
                                            onClick={() => handleFriendRequest(notif._id, notif.sender._id, 'accept')}
                                            className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => handleFriendRequest(notif._id, notif.sender._id, 'reject')}
                                            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Post Preview (if available) */}
                            {notif.post && notif.type !== 'friend_request' && notif.type !== 'friend_accept' && (
                                <Link to={notif.type === 'question_answered' ? `/questions` : `/post/${notif.post._id}`} className="flex-shrink-0 w-12 h-12 rounded bg-gray-800 overflow-hidden mt-1 sm:mt-0">
                                    {notif.post.media?.[0] ? (
                                        notif.post.media[0].endsWith('.mp4') ? (
                                            <video src={notif.post.media[0]} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={notif.post.media[0]} className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                            {notif.type === 'question_answered' ? 'Q&A' : 'Post'}
                                        </div>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
