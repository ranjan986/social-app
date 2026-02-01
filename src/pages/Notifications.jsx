import { useEffect, useState } from 'react';
import api from '../api';
import { Heart, MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            // Mark all as read on load? Or manual? 
            // Better to let user see "unread" state.
            // Let's mark all as read when component mounts for simplicity (Instagram style clearing)
            // or maybe keep them unread until clicked?
            // "Mark all read" is usually good for UX on page visit.
            await api.put('/notifications/read-all');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading notifications...</div>;

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
                        <div key={notif._id} className={`p-4 border-b border-border-color flex items-center gap-4 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                            {/* Icon based on type */}
                            <div className="flex-shrink-0">
                                {notif.type === 'like' && <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500"><Heart size={20} fill="currentColor" /></div>}
                                {notif.type === 'comment' && <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><MessageCircle size={20} /></div>}
                                {notif.type === 'follow' && <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500"><User size={20} /></div>}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="fontWeight-bold text-white mr-1">{notif.sender?.name || 'Unknown User'}</span>
                                    <span className="text-gray-300">{notif.text}</span>
                                </p>
                                <p className="text-xs text-text-muted mt-1">{new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>

                            {/* Post Preview (if available) */}
                            {notif.post && (
                                <Link to={`/post/${notif.post._id}`} className="flex-shrink-0 w-12 h-12 rounded bg-gray-800 overflow-hidden">
                                    {/* We need media or something. Notif populate post media. */}
                                    {notif.post.media?.[0] ? (
                                        notif.post.media[0].endsWith('.mp4') ? (
                                            <video src={notif.post.media[0]} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={notif.post.media[0]} className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Post</div>
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
