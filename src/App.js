import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import TestCodePage from './pages/TestCodePage';
import UserInfoPage from './pages/UserInfoPage';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';
import ErrorDisplay from './components/ErrorDisplay';

// Базовый URL API - можно настроить через переменные окружения
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.jahongiracademy.uz';

// Сервис для логирования ошибок
const ErrorLogger = {
  log: (error, context = {}) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: error.message || error.toString(),
      context: context,
      stack: error.stack
    };
    
    // Логируем в консоль для разработки
    console.error('🚨 Application Error:', errorLog);
    
    // В продакшене можно отправлять на сервер
    if (process.env.NODE_ENV === 'production') {
      try {
        // Отправляем ошибку на сервер логирования (если есть)
        fetch(`${API_BASE_URL}/api/log-error`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog),
          mode: 'no-cors' // или настройте CORS на сервере
        });
      } catch (e) {
        console.error('Failed to log error:', e);
      }
    }
  },
  
  logApiError: (endpoint, response, data) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      endpoint,
      status: response.status,
      statusText: response.statusText,
      responseData: data,
      url: window.location.href
    };
    
    console.error('🚨 API Error:', errorLog);
  }
};

// Компонент для извлечения query параметров
const QueryParamExtractor = ({ onUserIdExtracted }) => {
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('user_id');
    
    if (userId) {
      console.log(`📋 Extracted user_id from URL: ${userId}`);
      onUserIdExtracted(userId);
      
      // Сохраняем в sessionStorage для восстановления при перезагрузке
      sessionStorage.setItem('user_id', userId);
    } else {
      // Пробуем восстановить из sessionStorage
      const savedUserId = sessionStorage.getItem('user_id');
      if (savedUserId) {
        console.log(`📋 Restored user_id from sessionStorage: ${savedUserId}`);
        onUserIdExtracted(savedUserId);
      }
    }
  }, [location, onUserIdExtracted]);
  
  return null;
};

function App() {
  const [userData, setUserData] = useState({});
  const [testData, setTestData] = useState({});
  const [answers, setAnswers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appError, setAppError] = useState(null);
  const [testCheckError, setTestCheckError] = useState(null);
  
  // Восстанавливаем состояние из localStorage при загрузке
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('test_app_state');
      if (savedState) {
        const state = JSON.parse(savedState);
        console.log('📦 Restoring state from localStorage:', state);
        
        if (state.userData) setUserData(state.userData);
        if (state.testData) setTestData(state.testData);
        if (state.answers) setAnswers(state.answers);
        if (state.userId) setUserId(state.userId);
      }
    } catch (error) {
      ErrorLogger.log(error, { context: 'restore_state' });
      localStorage.removeItem('test_app_state');
    }
  }, []);
  
  // Сохраняем состояние в localStorage при изменениях
  useEffect(() => {
    const state = {
      userData,
      testData,
      answers,
      userId,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('test_app_state', JSON.stringify(state));
    } catch (error) {
      ErrorLogger.log(error, { context: 'save_state' });
    }
  }, [userData, testData, answers, userId]);
  
  // Обработчик проверки кода теста
  const handleTestCodeSubmit = async (testCode) => {
    setLoading(true);
    setAppError(null);
    setTestCheckError(null);
    
    console.log(`🔍 Checking test code: ${testCode} for user: ${userId}`);
    
    try {
      // Проверяем наличие user_id
      if (!userId) {
        throw new Error('User ID not found. Please access the page with ?user_id= parameter.');
      }
      
      // Выполняем запрос к API
      const response = await fetch(
        `${API_BASE_URL}/api/check-test?user_id=${encodeURIComponent(userId)}&test_id=${encodeURIComponent(testCode)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );

      // Парсим ответ
      const data = await response.json();
      console.log('📥 API Response:', data);
      
      // Проверяем статус ответа
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      // Обрабатываем ответ от сервера
      if (data.allowed) {
        // Проверяем все поля ответа
        if (!data.minutes || !data.test_name) {
          throw new Error('Invalid test data received from server');
        }
        
        // Проверяем время теста
        const now = new Date();
        const startTime = new Date(data.start_time);
        const endTime = new Date(data.end_time);

        if (now < startTime) {
          setTestCheckError({
            type: 'warning',
            title: 'Test hali boshlanmagan',
            message: 'Test boshlanishini kuting',
            details: `Test ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()} da boshlanadi`
          });
          return;
        }

        if (now > endTime) {
          setTestCheckError({
            type: 'error',
            title: 'Test vaqti tugagan',
            message: 'Testni topshirish uchun vaqt tugadi',
            details: `Test ${endTime.toLocaleDateString()} ${endTime.toLocaleTimeString()} da yakunlangan`
          });
          return;
        }

        if (data.is_ended) {
          setTestCheckError({
            type: 'error',
            title: 'Test yakunlangan',
            message: 'Test administrator tomonidan yakunlangan',
            details: 'Iltimos, boshqa test kodini kiriting'
          });
          return;
        }

        // Сохраняем данные теста
        setTestData({
          minutes: data.minutes,
          open_questions: data.open_questions,
          close_questions: data.close_questions,
          test_name: data.test_name,
          test_id: data.test_id,
          start_time: data.start_time,
          end_time: data.end_time,
          admin_id: data.admin_id,
          is_ended: data.is_ended,
          allowed: data.allowed
        });
        
        // Инициализируем массив ответов
        const totalQuestions = data.close_questions + data.open_questions;
        const initialAnswers = new Array(totalQuestions).fill('None');
        setAnswers(initialAnswers);
        
        // Очищаем ошибки
        setTestCheckError(null);
        setAppError(null);
        
        console.log(`✅ Test approved: ${data.test_name}, ${totalQuestions} questions`);
        
        // Возвращаем success для навигации
        return { success: true, testData: data };
        
      } else {
        // Обрабатываем ошибки от сервера
        let errorMessage = 'Testga kirish rad etildi';
        let errorType = 'error';
        
        switch (data.error) {
          case 'Test topilmadi':
            errorMessage = 'Kiritilgan kod bilan test topilmadi';
            break;
          case 'Test yakunlandi':
            errorMessage = 'Bu test allaqachon yakunlangan';
            break;
          case 'Test boshlanmagan':
            errorMessage = 'Test hali boshlanmagan';
            errorType = 'warning';
            break;
          case 'Siz testdan o\'tib bo\'lgansiz':
            errorMessage = 'Siz bu testni allaqachon topshirgansiz';
            break;
          default:
            errorMessage = data.error || 'Noma\'lum xatolik';
        }
        
        setTestCheckError({
          type: errorType,
          title: 'Testga kirish rad etildi',
          message: errorMessage,
          details: 'Iltimos, test kodini tekshiring yoki administrator bilan bog\'laning'
        });
        
        return { success: false, error: data.error };
      }
      
    } catch (error) {
      // Логируем и обрабатываем ошибку
      ErrorLogger.log(error, { 
        context: 'check_test', 
        testCode, 
        userId 
      });
      
      // Показываем пользователю понятное сообщение
      let userMessage = 'Server bilan bog\'lanishda xatolik';
      let details = 'Iltimos, internet aloqasini tekshiring va qayta urinib ko\'ring';
      
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        userMessage = 'Internet aloqasi yo\'q';
        details = 'Iltimos, internet aloqangizni tekshiring va qayta urinib ko\'ring';
      } else if (error.message.includes('User ID not found')) {
        userMessage = 'User ID topilmadi';
        details = 'Iltimos, sahifaga ?user_id=123456 formatida kirishni tekshiring';
      }
      
      setAppError({
        type: 'error',
        title: 'Xatolik yuz berdi',
        message: userMessage,
        details: details
      });
      
      return { success: false, error: error.message };
      
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик сохранения данных пользователя
  const handleUserInfoSubmit = (data) => {
    console.log('👤 User info saved:', data);
    setUserData({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      region: data.region.trim()
    });
    
    // Возвращаем success для навигации
    return { success: true };
  };
  
  // Обработчик отправки теста
  const handleTestSubmit = async (userAnswers, startTime, endTime) => {
    setLoading(true);
    setAppError(null);
    
    console.log(`📤 Submitting test: ${testData.test_id} for user: ${userId}`);
    
    try {
      // Проверяем обязательные данные
      if (!userId || !testData.test_id || !userData.firstName) {
        throw new Error('Missing required data for submission');
      }
      
      // Подготавливаем данные для отправки
      const submissionData = {
        test_id: testData.test_id,
        username: userData.firstName,
        lastname: userData.lastName,
        city: userData.region,
        user_id: userId,
        started_at: startTime,
        completed_at: endTime,
        answers: userAnswers.map(answer => answer === 'None' ? '' : answer)
      };
      
      console.log('📦 Submission data:', submissionData);
      
      // Выполняем запрос
      const response = await fetch(`${API_BASE_URL}/api/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        ErrorLogger.logApiError('submit-test', response, responseData);
        throw new Error(`Submission failed: ${response.status}`);
      }
      
      // Обрабатываем успешный ответ
      console.log('✅ Test submitted successfully:', responseData);
      
      // Очищаем состояние
      localStorage.removeItem('test_app_state');
      sessionStorage.removeItem('user_id');
      
      // Возвращаем успех
      return { success: true, data: responseData };
      
    } catch (error) {
      // Логируем ошибку
      ErrorLogger.log(error, { 
        context: 'submit_test',
        userId,
        testId: testData.test_id
      });
      
      // Сохраняем ответы в localStorage как резервную копию
      try {
        const backup = {
          answers: userAnswers,
          testData,
          userData,
          userId,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('test_backup', JSON.stringify(backup));
        console.log('💾 Backup saved to localStorage');
      } catch (backupError) {
        console.error('Failed to save backup:', backupError);
      }
      
      // Показываем ошибку пользователю
      setAppError({
        type: 'error',
        title: 'Javoblarni yuborishda xatolik',
        message: 'Javoblaringiz lokal saqlandi',
        details: 'Iltimos, internet aloqasini tekshiring va qayta urinib ko\'ring. Javoblaringiz saqlab qolindi.'
      });
      
      return { success: false, error: error.message };
      
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Router>
      <div className="App">
        <QueryParamExtractor onUserIdExtracted={setUserId} />
        
        {/* Глобальный обработчик ошибок */}
        {appError && (
          <div style={{ 
            position: 'fixed', 
            top: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1000, 
            width: '90%', 
            maxWidth: '500px' 
          }}>
            <ErrorDisplay 
              error={appError} 
              onDismiss={() => setAppError(null)}
            />
          </div>
        )}
        
        <Routes>
          <Route 
            path="/" 
            element={
              <TestCodePage 
                userId={userId}
                onSubmit={handleTestCodeSubmit} 
                loading={loading}
                error={testCheckError}
                onErrorDismiss={() => setTestCheckError(null)}
              />
            } 
          />
          <Route 
            path="/userinfo" 
            element={
              testData.test_id ? (
                <UserInfoPage 
                  userId={userId}
                  testData={testData} 
                  onSubmit={handleUserInfoSubmit}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/test" 
            element={
              userData.firstName && testData.test_id ? (
                <TestPage 
                  userData={userData} 
                  testData={testData} 
                  answers={answers}
                  setAnswers={setAnswers}
                  onSubmit={handleTestSubmit}
                  loading={loading}
                  userId={userId}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/results" 
            element={
              <ResultsPage 
                userData={userData} 
                testData={testData}
                userId={userId}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
