import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#ecf0f1' }}>
                <Outlet />
            </div>
        </div>
    );
}
