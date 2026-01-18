import React, { useEffect, useState } from 'react';

const ResultsPage = ({ userData, testData, userId }) => {
  const [backupExists, setBackupExists] = useState(false);

  useEffect(() => {
    // Проверяем наличие резервной копии
    const backup = localStorage.getItem('test_backup');
    if (backup) {
      setBackupExists(true);
      console.warn('Резервная копия ответов обнаружена:', JSON.parse(backup));
    }
  }, []);

  const handleClearBackup = () => {
    if (window.confirm('Резервную копиyani o\'chirishni istaysizmi?')) {
      localStorage.removeItem('test_backup');
      setBackupExists(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Test yakunlandi</h1>
        <h2>Rahmat, {userData.firstName}!</h2>
      </div>

      {backupExists && (
        <div className="warning-message" style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          <p><strong>⚠️ Diqqat:</strong> Javoblaringizning lokal nusxasi saqlangan.</p>
          <p>Bu serverga yuborishda muammo bo'lganligini bildiradi.</p>
          <button
            onClick={handleClearBackup}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Nusxani o'chirish
          </button>
        </div>
      )}

      <div className="user-info">
        <p><strong>Ism:</strong> {userData.firstName}</p>
        <p><strong>Familiya:</strong> {userData.lastName}</p>
        <p><strong>Viloyat:</strong> {userData.region}</p>
        <p><strong>User ID:</strong> {userId}</p>
        {testData.test_id && <p><strong>Test ID:</strong> {testData.test_id}</p>}
        {testData.test_name && <p><strong>Test nomi:</strong> {testData.test_name}</p>}
      </div>

      <div className="results-success">
        <h3>✅ Ma'lumotlar muvaffaqiyatli yuborildi</h3>
        <p>Javoblaringiz serverga qabul qilindi.</p>
        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
          Natijalarni keyinroq tekshirishingiz mumkin.
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={() => window.location.href = '/'}
          className="btn"
          style={{ width: 'auto', padding: '10px 30px' }}
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
