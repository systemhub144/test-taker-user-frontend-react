import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResultsPage = ({ userData, testData }) => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="App-container">
      <div className="Title">
        <h1>TESTOVASTI TUGADI</h1>
      </div>
      
      <div className="Subtitle">
        <h2>Rahmat, {userData.firstName} {userData.lastName}!</h2>
      </div>

      {/* Информация о пользователе */}
      <div className="Info-box">
        <div className="Info-item">
          <span className="Info-label">Ism:</span> {userData.firstName}
        </div>
        <div className="Info-item">
          <span className="Info-label">Familiya:</span> {userData.lastName}
        </div>
        <div className="Info-item">
          <span className="Info-label">Viloyat:</span> {userData.region}
        </div>
        <div className="Info-item">
          <span className="Info-label">Test nomi:</span> {testData.test_name}
        </div>
        <div className="Info-item">
          <span className="Info-label">Test kodi:</span> {testData.test_id}
        </div>
        <div className="Info-item">
          <span className="Info-label">Vaqt:</span> {testData.minutes} daqiqa
        </div>
      </div>

      {/* Сообщение об успехе */}
      <div className="Results-success">
        <h3>✅ Ma'lumotlar muvaffaqiyatli yuborildi</h3>
        <p style={{ marginTop: '10px' }}>
          Javoblaringiz serverga qabul qilindi. Natijalarni keyinroq tekshirishingiz mumkin.
        </p>
      </div>

      {/* Кнопка возврата */}
      <div className="Button-container">
        <button 
          type="button" 
          className="Button"
          onClick={handleReturnHome}
        >
          Bosh sahifaga qaytish
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        fontSize: '14px', 
        color: '#787878',
        textAlign: 'center'
      }}>
        Test uchun rahmat! Yangi testda ko'rishguncha.
      </div>
    </div>
  );
};

export default ResultsPage;
