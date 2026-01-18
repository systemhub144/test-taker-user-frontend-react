import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MathInput from 'react-math-keyboard';

const TestPage = ({ userData, testData, answers, setAnswers, onSubmit, loading }) => {
  const [timeLeft, setTimeLeft] = useState(testData.minutes * 60);
  const [startTime] = useState(new Date().toISOString());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();

  const totalQuestions = (testData.close_questions || 0) + (testData.open_questions || 0);
  const closeQuestionsCount = testData.close_questions || 0;
  const openQuestionsCount = testData.open_questions || 0;

  // Используем ref для стабильного доступа к ответам
  const answersRef = useRef(answers);
  const setAnswersRef = useRef(setAnswers);
  
  // Инициализируем refs при первом рендере
  useEffect(() => {
    answersRef.current = answers;
    setAnswersRef.current = setAnswers;
  }, []);

  // Синхронизируем ref с текущими ответами
  useEffect(() => {
    answersRef.current = answers;
    console.log('🔄 Answers updated in ref:', answers);
  }, [answers]);

  // Таймер
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Создаем стабильные обработчики для MathInput
  const createMathInputHandler = useCallback((questionIndex) => {
    // Возвращаем стабильную функцию, которая не меняется при ререндерах
    return (latexString) => {
      console.log(`📝 Open question ${questionIndex + 1}: entered ${latexString || 'empty'}`);
      
      // Используем функциональное обновление для сохранения всех предыдущих ответов
      setAnswersRef.current(prevAnswers => {
        const newAnswers = [...prevAnswers];
        newAnswers[questionIndex] = latexString || 'None';
        console.log('📊 Updated answers array (from ref):', newAnswers);
        
        // Также обновляем ref
        answersRef.current = newAnswers;
        return newAnswers;
      });
    };
  }, []);

  // Используем мемоизированные обработчики для MathInput
  const mathInputHandlers = useRef({});
  
  const getMathInputHandler = useCallback((questionIndex) => {
    if (!mathInputHandlers.current[questionIndex]) {
      mathInputHandlers.current[questionIndex] = createMathInputHandler(questionIndex);
    }
    return mathInputHandlers.current[questionIndex];
  }, [createMathInputHandler]);

  // Обработчик для закрытых вопросов
  const handleOptionSelect = useCallback((questionIndex, option) => {
    console.log(`❓ Closed question ${questionIndex + 1}: selected ${option}`);
    
    // Используем функциональное обновление
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[questionIndex] = option;
      console.log('📊 Updated answers (closed question):', newAnswers);
      
      // Обновляем ref
      answersRef.current = newAnswers;
      return newAnswers;
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 Submit form triggered');
    
    const endTime = new Date().toISOString();
    const answersToSend = answersRef.current.map(answer => 
      answer === '' || answer === null || answer === undefined ? 'None' : answer
    );
    
    // Проверяем, сколько вопросов не отвечено
    const unansweredCount = answersToSend.filter(answer => answer === 'None').length;
    
    if (unansweredCount > 0) {
      if (!window.confirm(`${unansweredCount} ta savolga javob berilmagan. Testni yakunlashni istaysizmi?`)) {
        return;
      }
    }
    
    console.log('🚀 Sending answers:', {
      answers: answersToSend,
      startTime,
      endTime
    });
    
    onSubmit(answersToSend, startTime, endTime);
    navigate('/results');
  };

  // Функция для переключения вопросов
  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Функция для заполнения тестовыми ответами
  const fillTestAnswers = () => {
    const currentAnswers = [...answersRef.current];
    const options = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    // Заполняем закрытые вопросы
    for (let i = 0; i < closeQuestionsCount; i++) {
      currentAnswers[i] = options[Math.floor(Math.random() * options.length)];
    }
    
    // Заполняем открытые вопросы
    const formulas = ['x^2 + y^2 = z^2', '\\frac{a}{b}', '\\sqrt{x}', '\\sum_{i=1}^{n} i^2'];
    for (let i = closeQuestionsCount; i < totalQuestions; i++) {
      currentAnswers[i] = formulas[Math.floor(Math.random() * formulas.length)];
    }
    
    setAnswers(currentAnswers);
    answersRef.current = currentAnswers;
    console.log('🎲 Test answers filled:', currentAnswers);
  };

  // Функция для просмотра структуры ответов
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
    
    alert(`Javoblar tuzilishi:
Jami savollar: ${totalQuestions}
Yopiq savollar: ${closeQuestionsCount}
Ochiq savollar: ${openQuestionsCount}
Javob berilgan: ${answeredCount}
Javob berilmagan: ${totalQuestions - answeredCount}

Tafsilotlar uchun konsolni tekshiring (F12)`);
  };

  // Вычисляем прогресс
  const answeredCount = answers.filter(answer => answer !== 'None' && answer !== '' && answer !== null).length;
  const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Определяем, какой тип вопроса сейчас активен
  const isClosedQuestion = currentQuestion < closeQuestionsCount;
  const currentQuestionIndex = isClosedQuestion ? currentQuestion : currentQuestion - closeQuestionsCount;
  
  // Создаем компоненты для каждого вопроса
  const closedQuestions = Array.from({ length: closeQuestionsCount }).map((_, index) => {
    const questionIndex = index;
    return (
      <div 
        key={`closed-${questionIndex}`} 
        className="Question-card"
        style={{ display: currentQuestion === questionIndex ? 'block' : 'none' }}
      >
        <div className="Question-number">
          {questionIndex + 1}. Javobingizni belgilang
        </div>
        
        <div className="Options-grid">
          {['A', 'B', 'C', 'D', 'E', 'F'].map((option) => (
            <button
              key={option}
              type="button"
              className={`Option-button ${answers[questionIndex] === option ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(questionIndex, option)}
            >
              {option}
            </button>
          ))}
        </div>

        {answers[questionIndex] && answers[questionIndex] !== 'None' && (
          <div style={{ 
            backgroundColor: '#e8f5e9', 
            padding: '12px', 
            borderRadius: '8px', 
            marginTop: '15px',
            color: '#2e7d32',
            fontSize: '14px'
          }}>
            <strong>Tanlangan javob:</strong> {answers[questionIndex]}
          </div>
        )}
      </div>
    );
  });

  const openQuestions = Array.from({ length: openQuestionsCount }).map((_, index) => {
    const questionIndex = closeQuestionsCount + index;
    // Получаем стабильный обработчик для этого MathInput
    const mathInputHandler = getMathInputHandler(questionIndex);
    
    return (
      <div 
        key={`open-${questionIndex}`} 
        className="Question-card"
        style={{ display: currentQuestion === questionIndex ? 'block' : 'none' }}
      >
        <div className="Question-number">
          {questionIndex + 1}. Javobingizni yozing
        </div>
        
        <div className="Math-container">
          <MathInput 
            setValue={mathInputHandler}
            initialLatex={answers[questionIndex] !== 'None' ? answers[questionIndex] : ''}
          />
        </div>

        {answers[questionIndex] && answers[questionIndex] !== 'None' && (
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '12px', 
            borderRadius: '8px', 
            marginTop: '15px',
            color: '#1565c0',
            fontSize: '14px'
          }}>
            <strong>Joriy javob:</strong> 
            <div style={{ 
              fontFamily: 'monospace', 
              marginTop: '5px',
              wordBreak: 'break-all'
            }}>
              {answers[questionIndex]}
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="App-container">
      <div className="Title">
        <h1>TEST</h1>
      </div>
      
      <div className="Subtitle">
        <h2>{userData.firstName} {userData.lastName}</h2>
      </div>

      {/* Информация о тесте */}
      <div className="Info-box">
        <div className="Info-item">
          <span className="Info-label">Test nomi:</span> {testData.test_name}
        </div>
        <div className="Info-item">
          <span className="Info-label">Savollar:</span> {totalQuestions} ta
        </div>
        <div className="Info-item">
          <span className="Info-label">Yopiq savollar:</span> {closeQuestionsCount} ta
        </div>
        <div className="Info-item">
          <span className="Info-label">Ochiq savollar:</span> {openQuestionsCount} ta
        </div>
        <div className="Info-item">
          <span className="Info-label">Javob berilgan:</span> {answeredCount} ta
        </div>
        <div className="Info-item">
          <span className="Info-label">Joriy savol:</span> {currentQuestion + 1}/{totalQuestions}
        </div>
      </div>

      {/* Таймер */}
      <div className="Timer-container">
        <div className="Timer-label">Qolgan vaqt</div>
        <div className="Timer-value">{formatTime(timeLeft)}</div>
      </div>

      {/* Прогресс бар */}
      <div style={{ 
        width: '100%', 
        backgroundColor: '#e8e8e8', 
        borderRadius: '10px', 
        margin: '20px 0' 
      }}>
        <div style={{ 
          width: `${progressPercentage}%`, 
          backgroundColor: '#4b3ee1', 
          height: '10px', 
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }}></div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '8px', 
          fontSize: '14px', 
          color: '#787878' 
        }}>
          <span>Javob berilgan: {answeredCount}/{totalQuestions}</span>
          <span>{progressPercentage}%</span>
        </div>
      </div>

      {/* Навигация по вопросам */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%', 
        marginBottom: '20px' 
      }}>
        <button 
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          style={{
            backgroundColor: currentQuestion === 0 ? '#e8e8e8' : '#4b3ee1',
            color: currentQuestion === 0 ? '#787878' : 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Oldingi
        </button>
        
        <div style={{ fontWeight: '600', fontSize: '16px' }}>
          Savol {currentQuestion + 1}/{totalQuestions}
        </div>
        
        <button 
          onClick={nextQuestion}
          disabled={currentQuestion === totalQuestions - 1}
          style={{
            backgroundColor: currentQuestion === totalQuestions - 1 ? '#e8e8e8' : '#4b3ee1',
            color: currentQuestion === totalQuestions - 1 ? '#787878' : 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: currentQuestion === totalQuestions - 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Keyingi →
        </button>
      </div>

      {/* Кнопки отладки */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        width: '100%',
        flexWrap: 'wrap' 
      }}>
        <button 
          type="button"
          onClick={fillTestAnswers}
          style={{
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 15px',
            cursor: 'pointer',
            flex: 1,
            fontSize: '14px'
          }}
        >
          🎲 Test javoblarni to'ldirish
        </button>
        
        <button 
          type="button"
          onClick={viewAnswerStructure}
          style={{
            backgroundColor: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 15px',
            cursor: 'pointer',
            flex: 1,
            fontSize: '14px'
          }}
        >
          📋 Javoblar tuzilishi
        </button>
        
        <button 
          type="button"
          onClick={() => {
            // Очистить все ответы
            if (window.confirm('Barcha javoblarni tozalashni istaysizmi?')) {
              const newAnswers = new Array(totalQuestions).fill('None');
              setAnswers(newAnswers);
              answersRef.current = newAnswers;
              console.log('🧹 All answers cleared');
            }
          }}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 15px',
            cursor: 'pointer',
            flex: 1,
            fontSize: '14px'
          }}
        >
          🧹 Barchasini tozalash
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Закрытые вопросы */}
        {closedQuestions}
        
        {/* Открытые вопросы */}
        {openQuestions}

        {/* Кнопки управления */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '30px',
          flexWrap: 'wrap' 
        }}>
          <button 
            type="submit" 
            className="Button"
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Yuborilmoqda...' : 'Testni yakunlash'}
          </button>
        </div>
      </form>
      
      {/* Отладочная информация */}
      <div style={{ 
        marginTop: '20px', 
        fontSize: '12px', 
        color: '#787878',
        textAlign: 'center',
        fontFamily: 'monospace',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <div><strong>📊 Joriy savol:</strong> {currentQuestion + 1} ({isClosedQuestion ? 'Yopiq' : 'Ochiq'})</div>
        <div><strong>📈 Progress:</strong> {answeredCount}/{totalQuestions} ({progressPercentage}%)</div>
        <div style={{ marginTop: '5px', fontSize: '10px' }}>
          <strong>Javoblar:</strong> {JSON.stringify(answers)}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
