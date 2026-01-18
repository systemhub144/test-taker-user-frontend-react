import React, { useState, useEffect, useCallback, useRef } from 'react';
import MathInput from 'react-math-keyboard';
import ErrorDisplay from './ErrorDisplay';

const TestPage = ({ userData, testData, answers, setAnswers, onSubmit, loading, error, devMode }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [timeError, setTimeError] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Используем ref для хранения актуальных ответов без триггеринга ререндеров
  const answersRef = useRef(answers);
  
  // Синхронизируем ref с answers
  useEffect(() => {
    answersRef.current = answers;
    console.log('🔄 Answers ref updated:', answers);
  }, [answers]);

  console.log('📄 TestPage mounted with:', { 
    testData, 
    timeLeft, 
    startTime,
    answers: answersRef.current 
  });

  const checkTestTime = useCallback(() => {
    if (!testData.start_time || !testData.end_time) return true;
    
    const now = new Date();
    const start = new Date(testData.start_time);
    const end = new Date(testData.end_time);
    
    if (now < start) {
      setTimeError({
        type: 'warning',
        message: 'Test hali boshlanmagan',
        details: `Test ${start.toLocaleTimeString()} da boshlanadi`
      });
      return false;
    }
    
    if (now > end) {
      setTimeError({
        type: 'error',
        message: 'Test vaqti tugagan',
        details: 'Test yakunlandi. Iltimos, testni yuboring'
      });
      return false;
    }
    
    if (testData.is_ended) {
      setTimeError({
        type: 'error',
        message: 'Test administrator tomonidan yakunlangan',
        details: 'Testni davom ettirish mumkin emas'
      });
      return false;
    }
    
    setTimeError(null);
    return true;
  }, [testData]);

  useEffect(() => {
    console.log('🔄 useEffect: testData changed', testData);
    
    if (testData && testData.minutes && !isInitialized) {
      console.log('⏱️ Setting up timer with minutes:', testData.minutes);
      const totalSeconds = testData.minutes * 60;
      setTimeLeft(totalSeconds);
      setStartTime(new Date().toISOString());
      setIsInitialized(true);
      
      checkTestTime();
      
      console.log('✅ Timer initialized:', {
        totalSeconds,
        startTime: new Date().toISOString()
      });
    }
  }, [testData, isInitialized, checkTestTime]);

  useEffect(() => {
    console.log('🔄 useEffect: timeLeft changed', timeLeft);
    
    if (timeLeft === null || timeLeft <= 0) {
      console.log('⏹️ Timer not running or finished');
      return;
    }
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        console.log('⏱️ Timer tick:', timeLeft - 1);
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => {
        console.log('🧹 Cleaning up timer');
        clearTimeout(timer);
      };
    } else if (timeLeft === 0) {
      console.log('⏰ Time is up!');
      handleAutoSubmit();
    }
  }, [timeLeft]);

  const handleAutoSubmit = () => {
    console.log('🚀 Auto-submitting test');
    const endTime = new Date().toISOString();
    const answersToSend = answersRef.current.map(answer => 
      answer === '' || answer === null || answer === undefined ? 'None' : answer
    );
    
    alert('Vaqt tugadi! Test avtomatik ravishda yuboriladi.');
    onSubmit(answersToSend, startTime, endTime);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Используем стабильную функцию для обновления ответов
  const updateAnswer = useCallback((questionIndex, value) => {
    console.log(`🔄 Updating answer for question ${questionIndex + 1}:`, value);
    
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[questionIndex] = value || 'None';
      console.log('📊 New answers array:', newAnswers);
      return newAnswers;
    });
  }, []);

  // Создаем стабильные обработчики для закрытых вопросов
  const handleOptionSelect = useCallback((questionIndex, option) => {
    console.log(`❓ Closed question ${questionIndex + 1}: selected ${option}`);
    updateAnswer(questionIndex, option);
  }, [updateAnswer]);

  // Создаем стабильные обработчики для открытых вопросов
  const createMathInputHandler = useCallback((questionIndex) => {
    // Возвращаем стабильную функцию, которая не меняется при ререндерах
    return (latexString) => {
      console.log(`📝 Open question ${questionIndex + 1}: entered ${latexString || 'empty'}`);
      updateAnswer(questionIndex, latexString);
    };
  }, [updateAnswer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 Submit form triggered');
    
    if (timeError?.type === 'error') {
      alert('Test vaqti bilan bog\'liq muammo bor. Testni yuborish mumkin emas.');
      return;
    }
    
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    console.log('✅ Confirm submit');
    const endTime = new Date().toISOString();
    const answersToSend = answersRef.current.map(answer => 
      answer === '' || answer === null || answer === undefined ? 'None' : answer
    );
    
    const unansweredCount = answersToSend.filter(answer => answer === 'None').length;
    
    if (unansweredCount > 0) {
      if (!window.confirm(`${unansweredCount} ta savolga javob berilmagan. Testni yakunlashni istaysizmi?`)) {
        setShowSubmitConfirm(false);
        return;
      }
    }
    
    console.log('🚀 Sending answers:', {
      answers: answersToSend,
      startTime,
      endTime
    });
    
    onSubmit(answersToSend, startTime, endTime);
    setShowSubmitConfirm(false);
  };

  // Если таймер еще не инициализирован, показываем загрузку
  if (timeLeft === null) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Test yuklanmoqda...</p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            Инициализация таймера...
          </p>
        </div>
      </div>
    );
  }

  const totalQuestions = (testData.close_questions || 0) + (testData.open_questions || 0);
  const closeQuestionsCount = testData.close_questions || 0;
  const openQuestionsCount = testData.open_questions || 0;
  const answeredCount = answers.filter(answer => answer !== 'None' && answer !== '' && answer !== null).length;

  const options = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Функции для тестирования
  const fillTestAnswers = () => {
    const newAnswers = [...answersRef.current];
    
    // Заполняем закрытые вопросы
    for (let i = 0; i < closeQuestionsCount; i++) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      newAnswers[i] = randomOption;
    }
    
    // Заполняем открытые вопросами
    for (let i = closeQuestionsCount; i < totalQuestions; i++) {
      const formulas = [
        'x^2 + y^2 = z^2',
        '\\frac{a}{b} + \\frac{c}{d}',
        '\\sqrt{x} + \\sqrt{y}',
        '\\sum_{i=1}^{n} i^2',
        '\\int_{0}^{1} x^2 dx'
      ];
      const randomFormula = formulas[Math.floor(Math.random() * formulas.length)];
      newAnswers[i] = randomFormula;
    }
    
    setAnswers(newAnswers);
    console.log('🎲 Test answers filled:', newAnswers);
  };

  const clearAllAnswers = () => {
    if (window.confirm('Barcha javoblarni tozalashni istaysizmi?')) {
      const newAnswers = new Array(totalQuestions).fill('None');
      setAnswers(newAnswers);
      console.log('🧹 All answers cleared');
    }
  };

  const viewAnswerStructure = () => {
    const currentAnswers = answersRef.current;
    const structure = {
      totalQuestions,
      closeQuestions: closeQuestionsCount,
      openQuestions: openQuestionsCount,
      answers: currentAnswers.map((answer, index) => ({
        question: index + 1,
        type: index < closeQuestionsCount ? 'closed' : 'open',
        answer: answer === 'None' ? 'Not answered' : answer,
        index: index
      }))
    };
    
    console.log('📋 Answer structure:', structure);
    
    alert(`Answer structure:
Total questions: ${totalQuestions}
Closed: ${closeQuestionsCount}
Open: ${openQuestionsCount}
Answered: ${answeredCount}
Unanswered: ${totalQuestions - answeredCount}

Check console (F12) for details.`);
  };

  if (timeError?.type === 'error') {
    return (
      <div className="container">
        <div className="header">
          <h1>Testni davom ettirib boʻlmaydi</h1>
        </div>
        
        <ErrorDisplay error={timeError} />
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="btn" 
            onClick={() => window.location.reload()}
            style={{ background: '#4CAF50', width: 'auto', padding: '10px 30px' }}
          >
            Sahifani yangilash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {devMode && (
        <div style={{
          background: '#e8f5e9',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '2px solid #4CAF50',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>🧪 TESTING MODE</strong>
              <p style={{ margin: '5px 0 0 0' }}>Server: OFFLINE | Answers saved locally</p>
            </div>
            <button
              onClick={() => setDebugMode(!debugMode)}
              style={{
                background: debugMode ? '#ff9800' : '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {debugMode ? '📊 Hide debug' : '🐛 Show debug'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={fillTestAnswers}
              style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                flex: 1
              }}
            >
              🎲 Fill with random answers
            </button>
            <button
              onClick={clearAllAnswers}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                flex: 1
              }}
            >
              🧹 Clear all answers
            </button>
            <button
              onClick={viewAnswerStructure}
              style={{
                background: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                flex: 1
              }}
            >
              📋 Show structure
            </button>
          </div>
          
          {debugMode && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: '#f0f0f0', 
              borderRadius: '5px',
              fontSize: '0.8rem',
              fontFamily: 'monospace'
            }}>
              <p><strong>Current answers (ref):</strong> {JSON.stringify(answersRef.current)}</p>
              <p><strong>Current answers (state):</strong> {JSON.stringify(answers)}</p>
              <p><strong>Are they equal?</strong> {JSON.stringify(answersRef.current) === JSON.stringify(answers) ? '✅ Yes' : '❌ No'}</p>
            </div>
          )}
        </div>
      )}

      <div className="header">
        <h1>Testing</h1>
        <h2>{userData.firstName} {userData.lastName}</h2>
      </div>

      {error && <ErrorDisplay error={error} />}
      {timeError && timeError.type === 'warning' && <ErrorDisplay error={timeError} />}

      <div className="test-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p><strong>Test:</strong> {testData.test_name}</p>
            <p><strong>Closed questions:</strong> {closeQuestionsCount}</p>
            <p><strong>Open questions:</strong> {openQuestionsCount}</p>
            <p><strong>Total questions:</strong> {totalQuestions}</p>
          </div>
          <div style={{
            background: answeredCount === totalQuestions ? '#4CAF50' : 
                       answeredCount > 0 ? '#ff9800' : '#f44336',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem' }}>Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {answeredCount}/{totalQuestions}
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              {Math.round((answeredCount / totalQuestions) * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div className="timer" style={{ 
        background: timeLeft < 300 ? '#ff6b6b' : timeLeft < 600 ? '#ffa726' : '#4CAF50',
        display: 'block',
        margin: '0 auto 25px',
        textAlign: 'center',
        padding: '15px'
      }}>
        <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>⏰ Remaining time</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {formatTime(timeLeft)}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>
          (Total: {testData.minutes || 150} minutes)
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="confirmation-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>📤 Confirm submission</h3>
            <p>Are you sure you want to submit the test?</p>
            
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              margin: '15px 0'
            }}>
              <p><strong>Answer statistics:</strong></p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>✅ Answered:</span>
                <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>{answeredCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>❌ Not answered:</span>
                <span style={{ fontWeight: 'bold', color: '#f44336' }}>{totalQuestions - answeredCount}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button 
                onClick={confirmSubmit}
                className="btn"
                style={{ flex: 1, background: '#4CAF50', fontSize: '1.1rem' }}
              >
                ✅ Yes, submit
              </button>
              <button 
                onClick={() => setShowSubmitConfirm(false)}
                className="btn"
                style={{ flex: 1, background: '#6c757d', fontSize: '1.1rem' }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          color: '#333', 
          borderBottom: '3px solid #667eea', 
          paddingBottom: '10px'
        }}>
          📝 Part 1: Closed questions (multiple choice)
        </h2>
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Select the correct answer for each question.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {Array.from({ length: closeQuestionsCount }).map((_, index) => (
          <div key={index} className="question-card" style={{
            borderLeft: answers[index] === 'None' ? '5px solid #ff9800' : '5px solid #4CAF50'
          }}>
            <div className="question-number">
              ❓ Question {index + 1} (closed)
            </div>
            
            <p style={{ marginBottom: '20px', color: '#555' }}>
              Select the correct answer:
            </p>
            
            <div className="options-grid">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`option-btn ${answers[index] === option ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(index, option)}
                >
                  {option}
                </button>
              ))}
            </div>

            {answers[index] && answers[index] !== 'None' && (
              <div className="selected-answer">
                <strong>Selected answer:</strong> 
                <span style={{ marginLeft: '10px', fontSize: '1.2rem' }}>
                  {answers[index]}
                </span>
              </div>
            )}
          </div>
        ))}

        {openQuestionsCount > 0 && (
          <div style={{ margin: '40px 0 20px 0' }}>
            <h2 style={{ 
              color: '#333', 
              borderBottom: '3px solid #764ba2', 
              paddingBottom: '10px'
            }}>
              ✍️ Part 2: Open questions (math input)
            </h2>
            
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Enter mathematical expressions using the keyboard below.
            </p>
          </div>
        )}

        {Array.from({ length: openQuestionsCount }).map((_, index) => {
          const questionIndex = closeQuestionsCount + index;
          // Создаем стабильный обработчик для каждого MathInput
          const mathInputHandler = createMathInputHandler(questionIndex);
          
          return (
            <div key={questionIndex} className="question-card" style={{
              borderLeft: answers[questionIndex] === 'None' ? '5px solid #ff9800' : '5px solid #764ba2'
            }}>
              <div className="question-number">
                📝 Question {questionIndex + 1} (open)
              </div>
              
              <p style={{ marginBottom: '20px', color: '#555' }}>
                Enter a mathematical expression:
              </p>
              
              <div className="math-input-container">
                <MathInput 
                  setValue={mathInputHandler}
                  initialLatex={answers[questionIndex] !== 'None' ? answers[questionIndex] : ''}
                />
              </div>

              {answers[questionIndex] && answers[questionIndex] !== 'None' && (
                <div className="selected-answer">
                  <strong>Your answer:</strong>
                  <div style={{ 
                    background: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '5px',
                    marginTop: '5px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    {answers[questionIndex]}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ 
          marginTop: '40px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '10px'
        }}>
          <button 
            type="submit" 
            className="btn"
            disabled={loading}
            style={{ 
              fontSize: '1.2rem',
              padding: '20px'
            }}
          >
            {loading ? '⏳ Sending...' : '🚀 Complete test'}
          </button>
          
          <div style={{ 
            marginTop: '15px', 
            textAlign: 'center',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Click to submit all answers. You will be asked to confirm.
          </div>
        </div>
      </form>
    </div>
  );
};

export default TestPage;
