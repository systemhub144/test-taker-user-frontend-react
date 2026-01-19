import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultsPage.css';

const ResultsPage = ({ userData, testData, userId }) => {
  const [backupExists, setBackupExists] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const navigate = useNavigate();

  // Проверяем наличие резервной копии
  useEffect(() => {
    try {
      const backup = localStorage.getItem('test_backup');
      if (backup) {
        const parsedBackup = JSON.parse(backup);
        setBackupExists(true);
        setBackupData(parsedBackup);
        console.warn('⚠️ Backup found:', parsedBackup);
        
        // Показываем уведомление пользователю
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('Test Backup', {
            body: 'Javoblaringizning lokal nusxasi saqlangan. Serverga yuborishni unutdingizmi?',
            icon: '/favicon.ico'
          });
        }
      }
      
      // Очищаем сессию
      localStorage.removeItem('test_session');
      localStorage.removeItem('user_info');
      
    } catch (error) {
      console.error('Error checking backup:', error);
    }
  }, []);

  const handleClearBackup = () => {
    if (window.confirm('Rostdan ham lokal nusxani o\'chirmoqchimisiz?')) {
      localStorage.removeItem('test_backup');
      setBackupExists(false);
      setBackupData(null);
      alert('Lokal nusxa o\'chirildi.');
    }
  };

  const handleRetrySubmit = () => {
    if (backupData) {
      if (window.confirm('Javoblarni qayta yuborishni istaysizmi?')) {
        // Здесь можно реализовать логику повторной отправки
        console.log('Retrying submission with:', backupData);
        alert('Qayta yuborish funksiyasi tez orada qo\'shiladi.');
      }
    }
  };

  const handleReturnHome = () => {
    // Очищаем все данные
    localStorage.clear();
    sessionStorage.clear();
    
    // Переходим на главную страницу
    navigate('/');
  };

  const handleDownloadResults = () => {
    try {
      const results = {
        user: userData,
        test: testData,
        userId: userId,
        submittedAt: new Date().toISOString(),
        backupExists: backupExists,
        backupData: backupData
      };
      
      const dataStr = JSON.stringify(results, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `test_results_${testData.test_id}_${userId}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
    } catch (error) {
      console.error('Failed to download results:', error);
      alert('Natijalarni yuklab olishda xatolik yuz berdi.');
    }
  };

  return (
    <div className="app-container">
      <div className="header-section">
        <h1 className="main-title">TEST YAKUNLANDI</h1>
        <h2 className="sub-title">Rahmat, {userData.firstName}!</h2>
      </div>

      {/* Уведомление о резервной копии */}
      {backupExists && (
        <div className="backup-warning">
          <div className="warning-header">
            <span className="warning-icon">⚠️</span>
            <h3 className="warning-title">Diqqat: Lokal nusxa saqlangan</h3>
          </div>
          
          <div className="warning-body">
            <p>
              Sizning javoblaringiz serverga yuborilmagan yoki yuborishda xatolik yuz bergan.
              Javoblaringiz lokal qurilmangizda saqlanib qolgan.
            </p>
            
            <div className="backup-actions">
              <button 
                className="action-button retry-button"
                onClick={handleRetrySubmit}
              >
                🔄 Qayta yuborish
              </button>
              
              <button 
                className="action-button clear-button"
                onClick={handleClearBackup}
              >
                🗑️ O'chirish
              </button>
              
              <button 
                className="action-button download-button"
                onClick={handleDownloadResults}
              >
                💾 Yuklab olish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Информация о тесте */}
      <div className="results-summary">
        <div className="summary-header">
          <span className="summary-icon">📊</span>
          <h3 className="summary-title">Test natijalari</h3>
        </div>
        
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Ism:</span>
            <span className="summary-value">{userData.firstName}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Familiya:</span>
            <span className="summary-value">{userData.lastName}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Viloyat:</span>
            <span className="summary-value">{userData.region}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Test nomi:</span>
            <span className="summary-value">{testData.test_name}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Test kodi:</span>
            <span className="summary-value code-font">{testData.test_id}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">User ID:</span>
            <span className="summary-value code-font">{userId}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Vaqt:</span>
            <span className="summary-value">{testData.minutes} daqiqa</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Status:</span>
            <span className={`summary-value status-badge ${backupExists ? 'status-warning' : 'status-success'}`}>
              {backupExists ? 'Lokal saqlangan' : 'Serverga yuborildi'}
            </span>
          </div>
        </div>
      </div>

      {/* Сообщение об успехе */}
      <div className="success-message">
        <div className="success-icon">✅</div>
        <div className="success-content">
          <h3 className="success-title">Ma'lumotlar muvaffaqiyatli yuborildi</h3>
          <p className="success-text">
            Javoblaringiz serverga qabul qilindi. 
            {backupExists 
              ? ' Biroq, lokal nusxa ham saqlanib qolganligini unutmang.' 
              : ' Test natijalaringiz keyinroq ko\'rsatiladi.'
            }
          </p>
        </div>
      </div>

      {/* Рекомендации */}
      <div className="recommendations">
        <h3 className="recommendations-title">📝 Eslatmalar</h3>
        <ul className="recommendations-list">
          <li>Test natijalari keyinroq administrator tomonidan e'lon qilinadi</li>
          <li>Yangi testda qatnashish uchun yangi test kodi talab qilinadi</li>
          <li>Savollaringiz bo'lsa, administrator bilan bog'laning</li>
          <li>Test qoidalariga rioya qilganingiz uchun rahmat</li>
        </ul>
      </div>

      {/* Кнопки действий */}
      <div className="action-buttons">
        <button 
          className="main-action-button"
          onClick={handleReturnHome}
        >
          🏠 Bosh sahifaga qaytish
        </button>
        
        <button 
          className="secondary-action-button"
          onClick={handleDownloadResults}
        >
          📄 Natijalarni yuklab olish
        </button>
      </div>

      {/* Контактная информация */}
      <div className="contact-info">
        <h4 className="contact-title">📞 Aloqa uchun</h4>
        <p className="contact-text">
          Savollaringiz bo'lsa, quyidagi manzillar orqali bog'lanishingiz mumkin:
        </p>
        <div className="contact-details">
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <span className="contact-value">info@jahongiracademy.uz</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Telefon:</span>
            <span className="contact-value">+998 90 123 45 67</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Veb-sayt:</span>
            <span className="contact-value">jahongiracademy.uz</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
