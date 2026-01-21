import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorDisplay from '../components/ErrorDisplay';
import './TestCodePage.css';

const TestCodePage = ({ userId, onSubmit, loading, error, onErrorDismiss }) => {
  const [testCode, setTestCode] = useState('');
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();

  // Фокус на поле ввода при загрузке
  useEffect(() => {
    const input = document.getElementById('testCodeInput');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    
    // Валидация
    if (!testCode.trim()) {
      setLocalError({
        type: 'warning',
        title: 'Maydon bo\'sh',
        message: 'Iltimos, test kodini kiriting',
        details: 'Test kodi adminstrator tomonidan beriladi'
      });
      return;
    }
    
    if (!userId) {
      setLocalError({
        type: 'error',
        title: 'User ID topilmadi',
        message: 'Sahifaga noto\'g\'ri kirilgan',
        details: 'Iltimos, sahifaga ?user_id=123456 formatida kirishni tekshiring'
      });
      return;
    }
    
    // Вызываем обработчик из App.js
    const result = await onSubmit(testCode);
    
    if (result && result.success) {
      // Переходим на страницу с данными пользователя
      navigate('/userinfo');
    }
  };

  const handleTestCodeChange = (e) => {
    // Очищаем ошибки при вводе
    if (localError) setLocalError(null);
    if (error && onErrorDismiss) onErrorDismiss();
    
    // Ограничиваем длину и разрешаем только нужные символы
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9\-_]/g, '');
    setTestCode(value.substring(0, 20));
  };

  return (
    <div className="app-container">
      <div className="header-section">
        <h1 className="main-title">REPETITSION TEST</h1>
        <h2 className="sub-title">Iltimos, test kodini kiriting</h2>
      </div>

      {/* Информация о пользователе */}
      {userId && (
        <div className="user-info-badge">
          <div className="user-info-icon">👤</div>
          <div className="user-info-text">
            <div className="user-info-label">User ID</div>
            <div className="user-info-value">{userId}</div>
          </div>
        </div>
      )}

      {/* Отображение ошибок */}
      {error && (
        <div style={{ margin: '20px 0', width: '100%' }}>
          <ErrorDisplay 
            error={error}
            onDismiss={onErrorDismiss}
          />
        </div>
      )}

      {localError && (
        <div style={{ margin: '20px 0', width: '100%' }}>
          <ErrorDisplay 
            error={localError}
            onDismiss={() => setLocalError(null)}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="test-code-form">
        <div className="input-group">
          <label htmlFor="testCodeInput" className="input-label">
            Test kodini kiriting
            <span className="required-star"> *</span>
          </label>
          
          <input
            id="testCodeInput"
            type="text"
            className="input-field"
            value={testCode}
            onChange={handleTestCodeChange}
            placeholder="Masalan: 12345"
            required
            disabled={loading}
            autoComplete="off"
            pattern="[0-9]+"
            title="Faqat raqamlar"
          />
          
          <div className="input-hint">
            Test kodi adminstrator tomonidan beriladi. Faqat raqamlar ruxsat etiladi.
          </div>
        </div>

        <div className="button-container">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !userId}
            title={!userId ? "Telegramdan kirish kerak" : ""}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                <span style={{ marginLeft: '10px' }}>Tekshirilmoqda...</span>
              </>
            ) : (
              'Jo\'natish'
            )}
          </button>
          
          <div className="button-hint">
            {!userId 
              ? "Siz telegramdan kirmadingiz"
              : "@JahongirAcademyBot dan kirishingiz lozim"
            }
          </div>
        </div>
      </form>

      {/* Информационный блок */}
      <div className="info-box">
        <h3 className="info-box-title">📋 Test qoidalari</h3>
        <ul className="info-box-list">
          <li>Test kodi faqat bir marta ishlatilishi mumkin</li>
          <li>Test vaqti chegaralangan, vaqt tugagach test avtomatik yakunlanadi</li>
          <li>Testni yakunlaganingizdan so'ng javoblarni o'zgartirib bo'lmaydi</li>
          <li>Internet aloqasi uzilgan taqdirda javoblaringiz saqlanib qoladi</li>
        </ul>
      </div>
    </div>
  );
};

export default TestCodePage;
