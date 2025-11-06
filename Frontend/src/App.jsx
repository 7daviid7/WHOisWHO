import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BoardCreator from './pages/BoardCreator';
import RoomList from './pages/RoomList';
import GameRoom from './pages/GameRoom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-board" element={<BoardCreator />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/game/:roomId" element={<GameRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
