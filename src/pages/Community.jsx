import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { UserPlus, Search, Check } from 'lucide-react';

const Community = () => {
    const [users, setUsers] = useState([]);
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('search') || '';
    const [query, setQuery] = useState(initialQuery);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers(initialQuery);
    }, [initialQuery]);

    const fetchUsers = async (search = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/users?search=${search}`);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(query);
    };

    const addFriend = async (userId) => {
        try {
            await api.post(`/users/${userId}/request`);
            // Update local state to remove added user from list (or mark as requested)
            // For now, removing them from the "Find Friends" list is fine as they are no longer "available" to be added
            setUsers(users.filter(u => u._id !== userId));
            alert("Friend request sent!");
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <div className="container">
            <h2 style={{ marginBottom: '2rem' }}>Find Friends</h2>

            <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
                <div className="input-group" style={{ maxWidth: '600px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        className="input-field"
                        placeholder="Search by name..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{ flex: 1, minWidth: '200px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        <Search size={18} /> Search
                    </button>
                </div>
            </form>

            {loading ? <p>Loading users...</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.length === 0 ? <p style={{ color: '#94a3b8' }}>No users found.</p> : users.map(user => (
                        <div key={user._id} className="card fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', gap: '12px' }}>
                            <Link to={`/user/${user._id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                                        {user.name[0]}
                                    </div>
                                )}
                                <div style={{ minWidth: 0 }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{user.friends?.length || 0} Friends</p>
                                </div>
                            </Link>

                            <button onClick={() => addFriend(user._id)} className="btn btn-primary" style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <UserPlus size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Community;
