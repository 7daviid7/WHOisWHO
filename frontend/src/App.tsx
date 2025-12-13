import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { InvitationManager } from './components/InvitationManager';
import Home from './pages/Home';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import MatchHistory from './pages/MatchHistory';

function App() {
    const [username, setUsername] = useState('');

    if (!username) {
        return <Login onLogin={setUsername} />;
    }

    return (
        <BrowserRouter>
            <InvitationManager username={username} />
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home username={username} />} />
                    <Route path="/friends" element={<Friends username={username} />} />
                    <Route path="/history" element={<MatchHistory username={username} />} />
                    <Route path="/profile" element={<Profile username={username} onUpdateUsername={setUsername} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
