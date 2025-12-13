import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '12px 15px',
        color: isActive ? '#ecf0f1' : '#bdc3c7',
        textDecoration: 'none',
        backgroundColor: isActive ? '#34495e' : 'transparent',
        borderRadius: '5px',
        marginBottom: '5px',
        fontWeight: isActive ? 'bold' : 'normal',
        transition: 'all 0.2s',
        justifyContent: collapsed ? 'center' : 'flex-start',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    } as const);

    return (
        <div style={{
            width: collapsed ? '60px' : '250px',
            height: '100vh',
            backgroundColor: '#2c3e50',
            padding: '20px 10px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
            transition: 'width 0.3s ease',
            position: 'relative'
        }}>
            <div style={{
                marginBottom: '30px',
                textAlign: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
            }}>
                <h2 style={{
                    color: '#FFD700',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    margin: 0,
                    fontSize: collapsed ? '1.2rem' : '1.5rem'
                }}>
                    {collapsed ? 'W' : 'WHOisWHO'}
                </h2>
            </div>

            <nav style={{ flex: 1 }}>
                <NavLink to="/" style={linkStyle}>
                    <span>{collapsed ? 'H' : 'Home'}</span>
                </NavLink>
                <NavLink to="/friends" style={linkStyle}>
                    <span>{collapsed ? 'A' : 'Amics'}</span>
                </NavLink>
                <NavLink to="/profile" style={linkStyle}>
                    <span>{collapsed ? 'E' : 'Editar Perfil'}</span>
                </NavLink>
                <NavLink to="/history" style={linkStyle}>
                    <span>{collapsed ? 'R' : 'Registres'}</span>
                </NavLink>

                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    <button
                        onClick={() => {
                            if (confirm("Segur que vols tancar la sessió?")) {
                                window.location.href = '/';
                            }
                        }}
                        style={{
                            ...linkStyle({ isActive: false }),
                            width: '100%',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#e74c3c'
                        }}
                    >
                        <span>{collapsed ? 'T' : 'Tancar Sessió'}</span>
                    </button>
                </div>
            </nav>

            <button
                onClick={onToggle}
                style={{
                    backgroundColor: '#34495e',
                    border: 'none',
                    color: '#bdc3c7',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    alignSelf: 'center',
                    marginBottom: '10px',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem'
                }}
            >
                {collapsed ? '▶' : '◀'}
            </button>

            {!collapsed && (
                <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#7f8c8d', textAlign: 'center' }}>
                    v1.0.0
                </div>
            )}
        </div>
    );
}
