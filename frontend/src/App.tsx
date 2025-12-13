import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import Home from './pages/Home';
import Friends from './pages/Friends';

function App() {
    const [username, setUsername] = useState('');

    if (!username) {
        return <Login onLogin={setUsername} />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home username={username} />} />
                    <Route path="/friends" element={<Friends username={username} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
