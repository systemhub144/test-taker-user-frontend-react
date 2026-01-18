import React, { useState } from 'react';
import ErrorDisplay from './ErrorDisplay';

const TestCodePage = ({ userId, onSubmit, loading, error, devMode }) => {
  const [testCode, setTestCode] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!testCode.trim()) {
      setLocalError({
        type: 'warning',
        message: 'Test kodi kiritilmagan',
        details: 'Iltimos, test kodini kiriting'
      });
      return;
    }
    
    onSubmit(testCode);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>REPETITSION TEST</h1>
        <h2>Iltimos, test kodini kiriting</h2>
      </div>
      
      {devMode && (
        <div className="dev-info" style={{
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '2px dashed #2196f3'
        }}>
          <h3 style={{ color: '#2196f3', marginBottom: '10px' }}>💻 Rivojlanish Rejimi</h3>
          <p><strong>User ID:</strong> {userId || 'Avtomatik generatsiya'}</p>
          <p><strong>Test demo kodlari:</strong></p>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
            <li><code>TEST123</code> - Muvaffaqiyatli test</li>
            <li><code>ERROR_TEST</code> - Test topilmadi</li>
            <li><code>TEST_ENDED</code> - Test yakunlangan</li>
            <li><code>NOT_STARTED</code> - Test boshlanmagan</li>
            <li><code>ALREADY_DONE</code> - Test allaqachon topshirilgan</li>
          </ul>
        </div>
      )}
      
      {userId && (
        <div className="user-info" style={{ marginBottom: '20px' }}>
          <p><strong>👤 User ID:</strong> {userId}</p>
        </div>
      )}
      
      {error && <ErrorDisplay error={error} />}
      {localError && <ErrorDisplay error={localError} />}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="testCode">
            Test kodini kiriting
            {devMode && (
              <span style={{ color: '#ff9800', fontSize: '0.9rem', marginLeft: '10px' }}>
                (Rivojlanish rejimi faol)
              </span>
            )}
          </label>
          <input
            id="testCode"
            type="text"
            className="form-control"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="Masalan: TEST123, DEMO-001"
            required
            disabled={loading}
            autoComplete="off"
            autoFocus
          />
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
            Test kodi administrator tomonidan beriladi
          </small>
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
          style={{ 
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Tekshirilmoqda...' : 'Testni boshlash'}
        </button>
      </form>
      
      {devMode && !userId && (
        <div className="warning-message" style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '10px',
          borderRadius: '5px',
          marginTop: '20px',
          border: '1px solid #ffeaa7',
          fontSize: '0.9rem'
        }}>
          <p><strong>ℹ️ Eslatma:</strong> User ID URL da mavjud emas.</p>
          <p>Rivojlanish rejimida avtomatik generatsiya qilinadi.</p>
        </div>
      )}
    </div>
  );
};

export default TestCodePage;
