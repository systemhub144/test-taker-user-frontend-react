import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestCodePage = ({ onSubmit, loading }) => {
  const [testCode, setTestCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!testCode.trim()) {
      setError('Iltimos, test kodini kiriting');
      return;
    }

    // Генерируем временный user_id для разработки
    const userId = 'dev_user_' + Math.random().toString(36).substr(2, 9);
    
    onSubmit(testCode, userId);
    
    // Переход на страницу с данными пользователя
    setTimeout(() => {
      navigate('/userinfo');
    }, 500);
  };

  return (
    <div className="App-container">
      <div className="Title">
        <h1>REPETITSION TEST</h1>
      </div>
      
      <div className="Subtitle">
        <h2>Iltimos, test kodini kiriting</h2>
      </div>

      {error && (
        <div className="Error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="Input-group">
          <label className="Input-title">Test kodini kiriting</label>
          <input
            type="text"
            className="Input-field"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="Masalan: TEST123"
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="Button-container">
          <button 
            type="submit" 
            className="Button"
            disabled={loading}
          >
            {loading ? 'Tekshirilmoqda...' : 'Jo\'natish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestCodePage;
