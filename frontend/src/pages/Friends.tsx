import React, { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    isOnline?: boolean;
}

interface FriendRequest {
    id: number;
    user: {
        id: number;
        username: string;
    };
    status: string;
}

interface FriendsProps {
    username: string;
}

export default function Friends({ username }: FriendsProps) {
    const [activeTab, setActiveTab] = useState<'list' | 'search' | 'requests'>('list');
    const [friends, setFriends] = useState<User[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadFriends();
        loadRequests();
    }, [username]);

    // Polling for updates (simple real-time)
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'list') loadFriends();
            if (activeTab === 'requests') loadRequests();
        }, 5000);
        return () => clearInterval(interval);
    }, [activeTab, username]);

    const loadFriends = async () => {
        try {
            const res = await fetch(`/api/friends?username=${username}`);
            const data = await res.json();
            if (res.ok) setFriends(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadRequests = async () => {
        try {
            const res = await fetch(`/api/friends/requests?username=${username}`);
            const data = await res.json();
            if (res.ok) setRequests(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users?q=${searchQuery}&username=${username}`);
            const data = await res.json();
            if (res.ok) setSearchResults(data.users || []);
            else setMessage(data.error);
        } catch (err) {
            setMessage('Error searching users');
        }
        setLoading(false);
    };

    const sendRequest = async (toUserId: number) => {
        try {
            const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUsername: username, toUserId })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Sol·licitud enviada!');
                // Remove from search results or show status
                setSearchResults(prev => prev.filter(u => u.id !== toUserId));
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            setMessage('Error sending request');
        }
    };

    const acceptRequest = async (requestId: number) => {
        try {
            const res = await fetch('/api/friends/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, username })
            });
            if (res.ok) {
                setMessage('Sol·licitud acceptada!');
                loadRequests();
                loadFriends();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const tabStyle = (tab: string) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        borderBottom: activeTab === tab ? '3px solid #3498db' : '3px solid transparent',
        fontWeight: activeTab === tab ? 'bold' : 'normal',
        color: activeTab === tab ? '#2c3e50' : '#7f8c8d'
    });

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Gestió d'Amics</h1>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #ddd' }}>
                <div onClick={() => setActiveTab('list')} style={tabStyle('list')}>Els meus amics</div>
                <div onClick={() => setActiveTab('search')} style={tabStyle('search')}>Cercar</div>
                <div onClick={() => setActiveTab('requests')} style={tabStyle('requests')}>
                    Sol·licituds {requests.length > 0 && <span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.8rem' }}>{requests.length}</span>}
                </div>
            </div>

            {message && (
                <div style={{ padding: '10px', backgroundColor: '#f1c40f', borderRadius: '5px', marginBottom: '20px' }}>
                    {message} <button onClick={() => setMessage('')} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>x</button>
                </div>
            )}

            {activeTab === 'list' && (
                <div>
                    {friends.length === 0 ? <p>No tens amics encara.</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                            {friends.map(friend => (
                                <div key={friend.id} style={{
                                    padding: '15px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderLeft: friend.isOnline ? '5px solid #27ae60' : '5px solid #95a5a6'
                                }}>
                                    <div style={{
                                        width: '10px', height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: friend.isOnline ? '#27ae60' : '#95a5a6'
                                    }}></div>
                                    <span style={{ fontWeight: 'bold' }}>{friend.username}</span>
                                    {friend.isOnline && <span style={{ fontSize: '0.8rem', color: '#27ae60' }}>Online</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'search' && (
                <div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Buscar usuari..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                        <button onClick={handleSearch} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Buscar
                        </button>
                    </div>
                    {loading && <p>Cercant...</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {searchResults.map(user => (
                            <div key={user.id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold' }}>{user.username}</span>
                                <button onClick={() => sendRequest(user.id)} style={{ padding: '5px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    Afegir
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                <div>
                    {requests.length === 0 ? <p>No tens sol·licituds pendents.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {requests.map(req => (
                                <div key={req.id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span><strong>{req.user.username}</strong> vol ser el teu amic</span>
                                    <button onClick={() => acceptRequest(req.id)} style={{ padding: '5px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                        Acceptar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
