import React, { useState, useEffect } from 'react';
import './App.css';
import TestCodePage from './components/TestCodePage';
import UserInfoPage from './components/UserInfoPage';
import TestPage from './components/TestPage';
import ResultsPage from './components/ResultsPage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function App() {
  const [currentPage, setCurrentPage] = useState('testCode');
  const [userData, setUserData] = useState({});
  const [testData, setTestData] = useState({});
  const [answers, setAnswers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('user_id');
    if (urlUserId) {
      setUserId(urlUserId);
    }
  }, []);

  const handleTestCodeSubmit = async (testCode) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/check-test/?user_id=${userId}&test_id=${testCode}`
      );
      
      const data = await response.json();
      
      if (data.allowed) {
        setTestData(data);
        // Инициализируем массив ответов с 'None' для всех вопросов
        const initialAnswers = new Array(data.close_questions + data.open_questions).fill('None');
        setAnswers(initialAnswers);
        setCurrentPage('userInfo');
      } else {
        alert(`Testga kirish rad etildi: ${data.errors}`);
      }
    } catch (error) {
      console.error('Testni tekshirishda xato:', error);
      // Fallback данные
      const mockData = {
        minutes: 150,
        open_questions: 2,
        close_questions: 3,
        test_name: `Matematika testi`,
        test_id: testCode,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 150 * 60000).toISOString(),
        admin_id: 'admin123',
        allowed: true,
        errors: null
      };
      setTestData(mockData);
      const initialAnswers = new Array(5).fill('None');
      setAnswers(initialAnswers);
      setCurrentPage('userInfo');
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfoSubmit = (data) => {
    setUserData(data);
    setCurrentPage('test');
  };

  const handleTestSubmit = async (userAnswers, startTime, endTime) => {
    setLoading(true);
    try {
      const submissionData = {
        test_id: testData.test_id,
        username: userData.firstName,
        lastname: userData.lastName,
        city: userData.region,
        user_id: userId,
        started_at: startTime,
        completed_at: endTime,
        answers: userAnswers // Теперь это массив
      };

      await fetch(`${API_BASE_URL}/api/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      setAnswers(userAnswers);
      setCurrentPage('results');
    } catch (error) {
      console.error('Testni yuborishda xato:', error);
      setAnswers(userAnswers);
      setCurrentPage('results');
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
        return <TestCodePage userId={userId} onSubmit={handleTestCodeSubmit} loading={loading} />;
      case 'userInfo':
        return <UserInfoPage userId={userId} testData={testData} onSubmit={handleUserInfoSubmit} />;
      case 'test':
        return (
          <TestPage 
            userData={userData} 
            testData={testData} 
            answers={answers}
            setAnswers={setAnswers}
            onSubmit={handleTestSubmit}
            loading={loading}
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
      {renderPage()}
    </div>
  );
}

export default App;
