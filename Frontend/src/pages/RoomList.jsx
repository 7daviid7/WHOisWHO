import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService, boardService } from '../services/api';
import './RoomList.css';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [newRoom, setNewRoom] = useState({
    name: '',
    boardId: '',
    password: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
    loadBoards();
    const interval = setInterval(loadRooms, 3000); // Actualitzar cada 3s
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const response = await roomService.getAll();
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error carregant sales:', error);
      setLoading(false);
    }
  };

  const loadBoards = async () => {
    try {
      const response = await boardService.getAll();
      setBoards(response.data);
    } catch (error) {
      console.error('Error carregant taulers:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      alert('Si us plau, introdueix el teu nom');
      return;
    }

    try {
      const response = await roomService.create(newRoom);
      const room = response.data;
      
      localStorage.setItem('playerName', playerName);
      localStorage.setItem('playerId', Date.now().toString());
      
      navigate(`/game/${room.id}`);
    } catch (error) {
      console.error('Error creant sala:', error);
      alert('Error creant la sala');
    }
  };

  const handleJoinRoom = (roomId) => {
    if (!playerName.trim()) {
      alert('Si us plau, introdueix el teu nom');
      return;
    }
    
    localStorage.setItem('playerName', playerName);
    if (!localStorage.getItem('playerId')) {
      localStorage.setItem('playerId', Date.now().toString());
    }
    
    navigate(`/game/${roomId}`);
  };

  const getBoardName = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    return board ? board.name : 'Desconegut';
  };

  if (loading) {
    return <div className="loading">Carregant sales...</div>;
  }

  return (
    <div className="room-list-page">
      <div className="container">
        <div className="header">
          <h1>🎮 Sales de Joc</h1>
          <button className="primary" onClick={() => setShowCreateModal(true)}>
            + Crear Sala Nova
          </button>
        </div>

        <div className="player-name-input">
          <input
            type="text"
            placeholder="El teu nom..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>

        {rooms.length === 0 ? (
          <div className="empty-state">
            <h2>No hi ha sales disponibles</h2>
            <p>Sigues el primer en crear una sala!</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map(room => (
              <div key={room.id} className="room-card">
                <h3>{room.name}</h3>
                <p className="board-name">Tauler: {getBoardName(room.boardId)}</p>
                <div className="room-info">
                  <span className="players">
                    👥 {room.players.length}/{room.maxPlayers}
                  </span>
                  <span className={`status ${room.status}`}>
                    {room.status === 'waiting' ? '⏳ Esperant' : '🎮 En joc'}
                  </span>
                </div>
                <button
                  className="primary"
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={room.players.length >= room.maxPlayers || room.status !== 'waiting'}
                >
                  {room.players.length >= room.maxPlayers ? 'Sala Completa' : 'Unir-se'}
                </button>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Crear Nova Sala</h2>
              <form onSubmit={handleCreateRoom}>
                <div className="form-group">
                  <label>Nom de la sala:</label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tauler:</label>
                  <select
                    value={newRoom.boardId}
                    onChange={(e) => setNewRoom({...newRoom, boardId: e.target.value})}
                    required
                  >
                    <option value="">Selecciona un tauler</option>
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Contrasenya (opcional):</label>
                  <input
                    type="password"
                    value={newRoom.password}
                    onChange={(e) => setNewRoom({...newRoom, password: e.target.value})}
                    placeholder="Deixa en blanc per sala pública"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel·lar
                  </button>
                  <button type="submit" className="primary">
                    Crear i Unir-se
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomList;
