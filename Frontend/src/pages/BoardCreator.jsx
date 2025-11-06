import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { boardService } from '../services/api';
import './BoardCreator.css';

function BoardCreator() {
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState({
    name: '',
    image: '',
    attributes: {}
  });
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const response = await boardService.uploadImage(formData);
      setCurrentCard({
        ...currentCard,
        image: `http://localhost:3000${response.data.path}`
      });
    } catch (error) {
      alert('Error pujant la imatge');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddAttribute = () => {
    if (!attributeKey.trim() || !attributeValue.trim()) return;

    setCurrentCard({
      ...currentCard,
      attributes: {
        ...currentCard.attributes,
        [attributeKey]: attributeValue
      }
    });

    setAttributeKey('');
    setAttributeValue('');
  };

  const handleRemoveAttribute = (key) => {
    const newAttributes = { ...currentCard.attributes };
    delete newAttributes[key];
    setCurrentCard({
      ...currentCard,
      attributes: newAttributes
    });
  };

  const handleAddCard = () => {
    if (!currentCard.name.trim() || !currentCard.image) {
      alert('Si us plau, afegeix un nom i una imatge per la carta');
      return;
    }

    setCards([...cards, {
      ...currentCard,
      id: Date.now().toString()
    }]);

    setCurrentCard({
      name: '',
      image: '',
      attributes: {}
    });
  };

  const handleRemoveCard = (cardId) => {
    setCards(cards.filter(c => c.id !== cardId));
  };

  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      alert('Si us plau, introdueix un nom per al tauler');
      return;
    }

    if (cards.length < 1) {
      alert('El tauler ha de tenir almenys 4 cartes');
      return;
    }

    try {
      await boardService.create({
        name: boardName,
        description: boardDescription,
        cards: cards,
        createdBy: localStorage.getItem('playerName') || 'anonymous'
      });

      alert('Tauler creat correctament!');
      navigate('/rooms');
    } catch (error) {
      alert('Error creant el tauler');
      console.error(error);
    }
  };

  return (
    <div className="board-creator">
      <div className="container">
        <h1>🎨 Crear Tauler Personalitzat</h1>

        <div className="creator-layout">
          <div className="board-config card">
            <h2>Configuració del Tauler</h2>
            
            <div className="form-group">
              <label>Nom del Tauler:</label>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Ex: Personatges Disney"
              />
            </div>

            <div className="form-group">
              <label>Descripció:</label>
              <textarea
                value={boardDescription}
                onChange={(e) => setBoardDescription(e.target.value)}
                placeholder="Descripció opcional del tauler..."
                rows="3"
              />
            </div>

            <div className="stats">
              <p><strong>Cartes creades:</strong> {cards.length}</p>
            </div>
          </div>

          <div className="card-editor card">
            <h2>Afegir Carta</h2>

            <div className="form-group">
              <label>Nom de la Carta:</label>
              <input
                type="text"
                value={currentCard.name}
                onChange={(e) => setCurrentCard({...currentCard, name: e.target.value})}
                placeholder="Ex: Mickey Mouse"
              />
            </div>

            <div className="form-group">
              <label>Imatge:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && <p>Pujant imatge...</p>}
              {currentCard.image && (
                <img 
                  src={currentCard.image} 
                  alt="Preview" 
                  className="image-preview"
                />
              )}
            </div>

            <div className="form-group">
              <label>Atributs:</label>
              <div className="attribute-input">
                <input
                  type="text"
                  value={attributeKey}
                  onChange={(e) => setAttributeKey(e.target.value)}
                  placeholder="Nom de l'atribut (Ex: barba)"
                />
                <input
                  type="text"
                  value={attributeValue}
                  onChange={(e) => setAttributeValue(e.target.value)}
                  placeholder="Valor (Ex: sí / no / castany)"
                />
                <button 
                  className="secondary"
                  onClick={handleAddAttribute}
                >
                  + Afegir
                </button>
              </div>

              {Object.keys(currentCard.attributes).length > 0 && (
                <div className="attributes-list">
                  {Object.entries(currentCard.attributes).map(([key, value]) => (
                    <div key={key} className="attribute-tag">
                      <strong>{key}:</strong> {value}
                      <button onClick={() => handleRemoveAttribute(key)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="primary"
              onClick={handleAddCard}
            >
              ✅ Afegir Carta al Tauler
            </button>
          </div>
        </div>

        <div className="cards-preview card">
          <h2>Cartes del Tauler ({cards.length})</h2>
          
          {cards.length === 0 ? (
            <p className="empty-state">Encara no hi ha cartes. Afegeix-ne alguna!</p>
          ) : (
            <div className="preview-grid">
              {cards.map(card => (
                <div key={card.id} className="preview-card">
                  <img src={card.image} alt={card.name} />
                  <h4>{card.name}</h4>
                  <div className="preview-attributes">
                    {Object.entries(card.attributes).map(([key, value]) => (
                      <span key={key} className="attribute-badge">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                  <button 
                    className="danger"
                    onClick={() => handleRemoveCard(card.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="actions">
          <button 
            className="secondary"
            onClick={() => navigate('/')}
          >
            Cancel·lar
          </button>
          <button 
            className="primary"
            onClick={handleCreateBoard}
            disabled={cards.length < 4}
          >
            💾 Crear Tauler
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoardCreator;
