import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import TestCodePage from './pages/TestCodePage';
import UserInfoPage from './pages/UserInfoPage';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';

// Режим разработки без сервера
const DEV_MODE = true;

function App() {
  const [userData, setUserData] = useState({});
  const [testData, setTestData] = useState({});
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTestCodeSubmit = (testCode, userId) => {
    setLoading(true);
    
    // Имитация задержки API
    setTimeout(() => {
      if (DEV_MODE) {
        // Мок-данные для разработки
        const mockData = {
          minutes: 150,
          open_questions: 2,
          close_questions: 3,
          test_name: "Matematika testi",
          test_id: testCode || "DEMO-001",
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 150 * 60000).toISOString(),
          admin_id: 'admin123',
          is_ended: false,
          allowed: true
        };
        
        setTestData(mockData);
        const initialAnswers = new Array(5).fill('None');
        setAnswers(initialAnswers);
      }
      setLoading(false);
    }, 500);
  };

  const handleUserInfoSubmit = (data) => {
    setUserData(data);
  };

  const handleTestSubmit = (userAnswers, startTime, endTime) => {
    console.log('Тест отправлен:', { userAnswers, startTime, endTime });
    // Здесь будет логика отправки на сервер
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <TestCodePage 
                onSubmit={handleTestCodeSubmit} 
                loading={loading} 
              />
            } 
          />
          <Route 
            path="/userinfo" 
            element={
              testData.test_id ? (
                <UserInfoPage 
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
              userData.firstName ? (
                <TestPage 
                  userData={userData} 
                  testData={testData} 
                  answers={answers}
                  setAnswers={setAnswers}
                  onSubmit={handleTestSubmit}
                  loading={loading}
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
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
