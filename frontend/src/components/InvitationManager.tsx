import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

interface Invitation {
    from: string;
    roomId: string;
    config: any;
}

interface InvitationManagerProps {
    username: string;
}

export function InvitationManager({ username }: InvitationManagerProps) {
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState<Invitation | null>(null);

    useEffect(() => {
        if (!socket.connected) socket.connect();

        // Identify to receive invites
        socket.emit('identify', username);

        const onReceiveInvite = (data: Invitation) => {
            console.log('Received invite:', data);
            setInvitation(data);
        };

        socket.on('receive_invite', onReceiveInvite);

        return () => {
            socket.off('receive_invite', onReceiveInvite);
        };
    }, [username]);

    const handleAccept = () => {
        if (!invitation) return;

        socket.emit('respond_invite', {
            from: username, // who accepted (me)
            to: invitation.from, // who invited (them)
            accepted: true,
            roomId: invitation.roomId
        });

        // Join the room
        navigate('/', { state: { joinRoomId: invitation.roomId, config: invitation.config } });
        setInvitation(null);
    };

    const handleDecline = () => {
        if (!invitation) return;

        socket.emit('respond_invite', {
            from: username,
            to: invitation.from,
            accepted: false,
            roomId: invitation.roomId
        });
        setInvitation(null);
    };

    if (!invitation) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
            zIndex: 1000,
            border: '2px solid #FFD700',
            maxWidth: '300px',
            animation: 'slideIn 0.5s ease-out'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.1rem' }}>Invitació de Joc!</h3>
            <p style={{ margin: '0 0 15px 0', color: '#7f8c8d' }}>
                <strong style={{ color: '#2c3e50' }}>{invitation.from}</strong> t'ha convidat a jugar.
            </p>
            {invitation.config && (
                <div style={{ fontSize: '0.85rem', marginBottom: '15px', color: '#bdc3c7' }}>
                    Mode: {invitation.config.mode === 'hardcore' ? 'Hardcore' : 'Vides'}
                </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleAccept}
                    style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Acceptar
                </button>
                <button
                    onClick={handleDecline}
                    style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Declinar
                </button>
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
