import React from 'react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        display: 'block',
        padding: '10px 15px',
        color: isActive ? '#ecf0f1' : '#bdc3c7',
        textDecoration: 'none',
        backgroundColor: isActive ? '#34495e' : 'transparent',
        borderRadius: '5px',
        marginBottom: '5px',
        fontWeight: isActive ? 'bold' : 'normal',
        transition: 'all 0.2s',
    });

    return (
        <div style={{
            width: '250px',
            height: '100vh',
            backgroundColor: '#2c3e50',
            padding: '20px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: '#FFD700',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
                WHOisWHO
            </h2>

            <nav style={{ flex: 1 }}>
                <NavLink to="/" style={linkStyle}>
                    🏠 Home
                </NavLink>
                <NavLink to="/friends" style={linkStyle}>
                    👥 Amics
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#7f8c8d', textAlign: 'center' }}>
                v1.0.0
            </div>
        </div>
    );
}
