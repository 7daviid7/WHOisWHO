import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../socket';
import { RoomConfig } from '../components/RoomConfig';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'list' | 'search' | 'requests'>('list');
    const [friends, setFriends] = useState<User[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);

    // Search State
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    // Invitation State
    const [showRoomConfig, setShowRoomConfig] = useState(false);
    const [inviteTarget, setInviteTarget] = useState<User | null>(null);
    const [invitationStatus, setInvitationStatus] = useState<string | null>(null);

    useEffect(() => {
        loadFriends();
        loadRequests();

        if (!socket.connected) socket.connect();
        socket.emit('identify', username);

        // Listen for user status updates
        const onUserStatus = (data: { username: string, status: 'online' | 'offline' }) => {
            setFriends(prev => prev.map(f =>
                f.username === data.username ? { ...f, isOnline: data.status === 'online' } : f
            ));
        };

        const onInviteResponse = (data: { from: string, accepted: boolean, roomId: string }) => {
            if (data.accepted) {
                setInvitationStatus(`${data.from} ha acceptat! Unint...`);
                setTimeout(() => {
                    navigate('/', { state: { joinRoomId: data.roomId } }); // Auto join
                }, 1000);
            } else {
                setInvitationStatus(`${data.from} ha declinat la invitació.`);
                setTimeout(() => setInvitationStatus(null), 3000);
            }
        };

        socket.on('user_status', onUserStatus);
        socket.on('invite_response', onInviteResponse);

        return () => {
            socket.off('user_status', onUserStatus);
            socket.off('invite_response', onInviteResponse);
        };
    }, [username]);

    // ...

    const handleCreateInvite = (roomName: string, config: any) => {
        if (!inviteTarget) return;

        // Auto-join my own created room/wait for acceptance
        socket.emit('join_room', { roomId: roomName, username, config });

        // Send actual invite
        socket.emit('send_invite', {
            from: username,
            to: inviteTarget.username,
            roomId: roomName,
            config
        });

        setShowRoomConfig(false);
        setInvitationStatus(`Esperant resposta de ${inviteTarget.username}...`);
    };

    // ...



    // Polling for friends list to keep it fresh initially
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'list') loadFriends();
                    if (activeTab === 'requests') loadRequests();
        }, 5000);
        return () => clearInterval(interval);
    }, [activeTab, username]);

    const loadFriends = async () => {
        try {
            const data = await api.getFriends(username);
                    setFriends(data);
        } catch (err) {
                        console.error(err);
        }
    };

    const loadRequests = async () => {
        try {
            const data = await api.getPendingRequests(username);
                    setRequests(data);
        } catch (err) {
                        console.error(err);
        }
    };

    const handleSearch = async (newPage = 1) => {
        if (!searchQuery) return;
                    setLoading(true);
                    try {
            const data = await api.searchUsers(searchQuery, username, newPage);
                    setSearchResults(data.users || []);
                    setTotalPages(data.totalPages);
                    setPage(data.page);
                    setMessage(null);
        } catch (err: any) {
                        setMessage({ text: err.message, type: 'error' });
        }
                    setLoading(false);
    };

    const sendRequest = async (toUserId: number) => {
        try {
                        await api.sendFriendRequest(username, toUserId);
                    setMessage({text: 'Sol·licitud enviada!', type: 'success' });
            setSearchResults(prev => prev.filter(u => u.id !== toUserId));
        } catch (err: any) {
                        setMessage({ text: err.message, type: 'error' });
        }
    };

    const acceptRequest = async (requestId: number) => {
        try {
                        await api.acceptFriendRequest(requestId, username);
                    setMessage({text: 'Sol·licitud acceptada!', type: 'success' });
                    loadRequests();
                    loadFriends();
        } catch (err: any) {
                        setMessage({ text: err.message, type: 'error' });
        }
    };

    const handleInviteClick = (friend: User) => {
                        setInviteTarget(friend);
                    setShowRoomConfig(true);
    };



    const tabStyle = (tab: string) => ({
                        padding: '12px 24px',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab ? '3px solid #3498db' : '3px solid transparent',
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    color: activeTab === tab ? '#2c3e50' : '#7f8c8d',
                    transition: 'all 0.2s',
                    fontSize: '1rem'
    });

                    return (
                    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" }}>
                        {showRoomConfig && (
                            <RoomConfig
                                onCreateRoom={handleCreateInvite}
                                onCancel={() => setShowRoomConfig(false)}
                            />
                        )}

                        <h1 style={{ color: '#2c3e50', marginBottom: '30px', fontSize: '2rem' }}>👥 Gestió d'Amics</h1>

                        <div style={{ display: 'flex', gap: '5px', marginBottom: '30px', borderBottom: '1px solid #e0e0e0' }}>
                            <div onClick={() => setActiveTab('list')} style={tabStyle('list')}>Els meus amics</div>
                            <div onClick={() => setActiveTab('search')} style={tabStyle('search')}>🔍 Cercar Nous</div>
                            <div onClick={() => setActiveTab('requests')} style={tabStyle('requests')}>
                                Sol·licituds {requests.length > 0 && <span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '8px' }}>{requests.length}</span>}
                            </div>
                        </div>

                        {message && (
                            <div style={{ padding: '12px 20px', backgroundColor: message.type === 'success' ? '#2ecc71' : '#e74c3c', color: 'white', borderRadius: '8px', marginBottom: '20px' }}>
                                {message.text}
                                <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>&times;</button>
                            </div>
                        )}

                        {invitationStatus && (
                            <div style={{ padding: '15px', backgroundColor: '#3498db', color: 'white', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                                {invitationStatus}
                                <button onClick={() => setInvitationStatus(null)} style={{ marginLeft: '15px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Cancel·lar</button>
                            </div>
                        )}

                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '400px' }}>
                            {activeTab === 'list' && (
                                <div>
                                    {friends.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#95a5a6', marginTop: '50px' }}>
                                            <p>Encara no tens amics afegits.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                            {friends.map(friend => (
                                                <div key={friend.id} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                                        <div style={{ width: '45px', height: '45px', backgroundColor: '#bdc3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white' }}>{friend.username.charAt(0).toUpperCase()}</div>
                                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: friend.isOnline ? '#2ecc71' : '#95a5a6', position: 'absolute', bottom: '0', right: '0', border: '2px solid white' }}></div>
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={friend.username}>
                                                            {friend.username}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: friend.isOnline ? '#2ecc71' : '#95a5a6' }}>{friend.isOnline ? 'Online' : 'Offline'}</div>
                                                    </div>
                                                    {friend.isOnline && (
                                                        <button onClick={() => handleInviteClick(friend)} style={{ padding: '6px 12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>Invitar</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Search and Requests tabs remain similar... keeping it concise for this tool call, assume standard search implementation */}
                            {activeTab === 'search' && (
                                <div>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                                        <input type="text" placeholder="Escriu un nom d'usuari..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch(1)} style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: '2px solid #bdc3c7' }} />
                                        <button onClick={() => handleSearch(1)} style={{ padding: '12px 30px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{loading ? '...' : 'Cercar'}</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {searchResults.map(user => (
                                            <div key={user.id} style={{ padding: '15px 20px', backgroundColor: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e9ecef' }}>
                                                <span style={{ fontWeight: 'bold' }}>{user.username}</span>
                                                <button onClick={() => sendRequest(user.id)} style={{ padding: '8px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Afegir +</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'requests' && (
                                <div>
                                    {requests.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#95a5a6' }}>No tens sol·licituds.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {requests.map(req => (
                                                <div key={req.id} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 'bold' }}>{req.user.username}</span>
                                                    <button onClick={() => acceptRequest(req.id)} style={{ padding: '8px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Acceptar</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    );
}
