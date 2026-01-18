import React, { useState, useEffect } from 'react';
import './App.css';
import TestCodePage from './components/TestCodePage';
import UserInfoPage from './components/UserInfoPage';
import TestPage from './components/TestPage';
import ResultsPage from './components/ResultsPage';
import ErrorDisplay from './components/ErrorDisplay';

// Режим разработки без сервера
const DEV_MODE = true;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// Мок-данные для тестирования
const MOCK_TEST_DATA = {
  minutes: 150,
  open_questions: 2,
  close_questions: 3,
  test_name: "Matematika testi (Demo)",
  test_id: "DEMO-123",
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 150 * 60000).toISOString(),
  admin_id: 'admin123',
  is_ended: false,
  allowed: true,
  errors: null
};

function App() {
  const [currentPage, setCurrentPage] = useState('testCode');
  const [userData, setUserData] = useState({});
  const [testData, setTestData] = useState({});
  const [answers, setAnswers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testError, setTestError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('user_id');
    
    if (urlUserId) {
      setUserId(urlUserId);
    } else if (DEV_MODE) {
      // Генерируем тестовый user_id в режиме разработки
      const testUserId = 'dev_user_' + Math.random().toString(36).substr(2, 9);
      setUserId(testUserId);
      console.log('📱 DEV MODE: Generated user_id:', testUserId);
    }
  }, []);

  const handleTestCodeSubmit = async (testCode) => {
    setLoading(true);
    setError(null);
    setTestError(null);
    
    console.log('🔄 Обработка кода теста:', testCode);
    
    if (DEV_MODE) {
      // Режим разработки: используем мок-данные
      console.log('⚡ DEV MODE: Using mock data');
      
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Проверяем код для демонстрации ошибок
      if (testCode === 'ERROR_TEST') {
        setTestError({
          type: 'error',
          message: 'Test topilmadi',
          details: 'Bunday kod bilan test topilmadi'
        });
      } else if (testCode === 'TEST_ENDED') {
        setTestError({
          type: 'error',
          message: 'Test yakunlandi',
          details: 'Bu test allaqachon yakunlangan'
        });
      } else if (testCode === 'NOT_STARTED') {
        setTestError({
          type: 'warning',
          message: 'Test boshlanmagan',
          details: 'Test hali boshlanmadi, kutib turing'
        });
      } else if (testCode === 'ALREADY_DONE') {
        setTestError({
          type: 'error',
          message: 'Siz testdan o\'tib bo\'lgansiz',
          details: 'Bu testni allaqachon topshirdingiz'
        });
      } else {
        // Успешный код теста
        setTestData({
          ...MOCK_TEST_DATA,
          test_id: testCode || 'DEMO-' + Math.random().toString(36).substr(2, 6),
          test_name: `Test: ${testCode || 'Demo test'}`
        });
        
        const initialAnswers = new Array(5).fill('None'); // 3 закрытых + 2 открытых = 5 вопросов
        setAnswers(initialAnswers);
        setCurrentPage('userInfo');
        console.log('✅ DEV MODE: Test code accepted, moving to user info');
      }
      
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/check-test/?user_id=${userId}&test_id=${testCode}`
      );
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('API Response:', {
        endpoint: 'check-test',
        data,
        userId,
        testCode
      });
      
      if (data.allowed) {
        const now = new Date();
        const startTime = new Date(data.start_time);
        const endTime = new Date(data.end_time);
        
        if (now < startTime) {
          setTestError({
            type: 'warning',
            message: 'Test hali boshlanmagan',
            details: `Test ${startTime.toLocaleString()} da boshlanadi`
          });
          return;
        }
        
        if (now > endTime) {
          setTestError({
            type: 'error',
            message: 'Test vaqti tugagan',
            details: `Test ${endTime.toLocaleString()} da tugagan`
          });
          return;
        }
        
        if (data.is_ended) {
          setTestError({
            type: 'error',
            message: 'Test yakunlandi',
            details: 'Test administrator tomonidan yakunlangan'
          });
          return;
        }
        
        setTestData(data);
        const initialAnswers = new Array(data.close_questions + data.open_questions).fill('None');
        setAnswers(initialAnswers);
        setCurrentPage('userInfo');
        setTestError(null);
      } else {
        const errorMessages = {
          'Test topilmadi': 'Test topilmadi',
          'Test yakunlandi': 'Test yakunlandi',
          'Test boshlanmagan': 'Test boshlanmagan',
          'Siz testdan o\'tib bo\'lgansiz': 'Siz testdan o\'tib bo\'lgansiz'
        };
        
        const errorMessage = data.error || 'Testga kirish rad etildi';
        const userMessage = errorMessages[errorMessage] || errorMessage;
        
        setTestError({
          type: 'error',
          message: userMessage,
          details: 'Iltimos, boshqa test kodini kiriting yoki administrator bilan bog\'laning'
        });
      }
    } catch (error) {
      console.error('❌ Error checking test:', error);
      setTestError({
        type: 'error',
        message: 'Server bilan bog\'lanishda xatolik',
        details: 'Iltimos, internet aloqasini tekshiring va qayta urinib ko\'ring'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfoSubmit = (data) => {
    console.log('👤 User info submitted:', data);
    setUserData(data);
    setCurrentPage('test');
  };

  const handleTestSubmit = async (userAnswers, startTime, endTime) => {
    setLoading(true);
    setError(null);
    
    console.log('📤 Submitting test:', {
      test_id: testData.test_id,
      user_id: userId,
      answers: userAnswers,
      startTime,
      endTime
    });
    
    if (DEV_MODE) {
      // Режим разработки: имитация отправки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ DEV MODE: Test submitted successfully');
      
      // Резервное копирование (для демонстрации)
      const backupData = {
        test_id: testData.test_id,
        user_id: userId,
        username: userData.firstName,
        lastname: userData.lastName,
        city: userData.region,
        answers: userAnswers,
        start_time: startTime,
        end_time: endTime,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('test_backup', JSON.stringify(backupData));
      console.log('💾 Backup saved:', backupData);
      
      setAnswers(userAnswers);
      setCurrentPage('results');
      setLoading(false);
      return;
    }
    
    try {
      const backupData = {
        test_id: testData.test_id,
        user_id: userId,
        username: userData.firstName,
        lastname: userData.lastName,
        city: userData.region,
        answers: userAnswers,
        start_time: startTime,
        end_time: endTime,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('test_backup', JSON.stringify(backupData));
      
      const submissionData = {
        test_id: testData.test_id,
        username: userData.firstName,
        lastname: userData.lastName,
        city: userData.region,
        user_id: userId,
        started_at: startTime,
        completed_at: endTime,
        answers: userAnswers
      };

      console.log('Submitting data to server:', submissionData);
      
      const response = await fetch(`${API_BASE_URL}/api/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`);
      }

      localStorage.removeItem('test_backup');
      
      setAnswers(userAnswers);
      setCurrentPage('results');
    } catch (error) {
      console.error('❌ Error submitting test:', error);
      setError({
        type: 'error',
        message: 'Javoblarni yuborishda xatolik',
        details: 'Javoblaringiz lokal saqlandi. Iltimos, internet aloqasini tekshiring va qayta urinib ko\'ring'
      });
      setAnswers(userAnswers);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = () => {
    if (loading) {
      return (
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Yuklanmoqda...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'testCode':
        return (
          <TestCodePage 
            userId={userId} 
            onSubmit={handleTestCodeSubmit} 
            loading={loading} 
            error={testError}
            devMode={DEV_MODE}
          />
        );
      case 'userInfo':
        return (
          <UserInfoPage 
            userId={userId} 
            testData={testData} 
            onSubmit={handleUserInfoSubmit} 
          />
        );
      case 'test':
        return (
          <TestPage 
            userData={userData} 
            testData={testData} 
            answers={answers}
            setAnswers={setAnswers}
            onSubmit={handleTestSubmit}
            loading={loading}
            error={error}
            devMode={DEV_MODE}
          />
        );
      case 'results':
        return <ResultsPage userData={userData} testData={testData} answers={answers} userId={userId} />;
      default:
        return <TestCodePage userId={userId} onSubmit={handleTestCodeSubmit} loading={loading} />;
    }
  };

  return (
    <div className="App">
      {DEV_MODE && (
        <div style={{
          background: '#ff9800',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          borderRadius: '0 0 10px 10px',
          marginBottom: '20px',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          ⚡ REJIM: Rivojlanish (Server o'chiq) | 
          Demo kodlar: TEST123, ERROR_TEST, TEST_ENDED, NOT_STARTED, ALREADY_DONE
        </div>
      )}
      {renderPage()}
    </div>
  );
}

export default App;
