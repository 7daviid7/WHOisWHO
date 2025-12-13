import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { InvitationManager } from './InvitationManager';

// Define context type
type ContextType = { username: string };

export type LayoutContextType = {
    setSidebarHidden: (hidden: boolean) => void;
};

export function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [sidebarHidden, setSidebarHidden] = useState(false);

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {!sidebarHidden && <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />}
            <div style={{
                flex: 1,
                overflow: 'auto',
                backgroundColor: '#ecf0f1',
                transition: 'margin-left 0.3s ease'
            }}>
                <Outlet context={{ setSidebarHidden } satisfies LayoutContextType} />
            </div>
        </div>
    );
}
