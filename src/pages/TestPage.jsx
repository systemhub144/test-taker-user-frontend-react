import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MathInput from 'react-math-keyboard';
import ErrorDisplay from '../components/ErrorDisplay';
import './TestPage.css';

const TestPage = ({ userData, testData, answers, setAnswers, onSubmit, loading, userId }) => {
  const [timeLeft, setTimeLeft] = useState(testData.minutes * 60);
  const [startTime] = useState(() => new Date().toISOString());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  const totalQuestions = useMemo(() => 
    (testData.close_questions || 0) + (testData.open_questions || 0), 
    [testData]
  );
  
  const closeQuestionsCount = useMemo(() => testData.close_questions || 0, [testData]);
  const openQuestionsCount = useMemo(() => testData.open_questions || 0, [testData]);

  // Ref для стабильного доступа к ответам
  const answersRef = useRef(answers);
  const setAnswersRef = useRef(setAnswers);
  
  // Инициализация refs
  useEffect(() => {
    answersRef.current = answers;
    setAnswersRef.current = setAnswers;
  }, []);

  // Синхронизация ref с ответами
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Таймер
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Показываем предупреждения
        if (newTime === 300) { // 5 минут
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        } else if (newTime === 60) { // 1 минута
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);

  // Автоматическая отправка при истечении времени
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('⏰ Auto-submitting test due to time expiration');
    
    const endTime = new Date().toISOString();
    const answersToSend = answersRef.current.map(answer => 
      answer === '' || answer === null || answer === undefined ? 'None' : answer
    );
    
    const result = await onSubmit(answersToSend, startTime, endTime);
    
    if (result.success) {
      navigate('/results');
    } else {
      setSubmitError({
        type: 'warning',
        title: 'Vaqt tugadi',
        message: 'Test avtomatik ravishda yakunlandi',
        details: 'Javoblaringiz lokal saqlandi. Keyinroq qayta urinib ko\'ring.'
      });
    }
    
    setIsSubmitting(false);
  }, [onSubmit, startTime, navigate, isSubmitting]);

  // Форматирование времени
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Обновление ответов
  const updateAnswer = useCallback((questionIndex, value) => {
    setAnswersRef.current(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = value || 'None';
      answersRef.current = newAnswers;
      return newAnswers;
    });
  }, []);

  // Обработчики для закрытых вопросов
  const handleOptionSelect = useCallback((questionIndex, option) => {
    updateAnswer(questionIndex, option);
  }, [updateAnswer]);

  // Обработчики для MathInput (создаются один раз)
  const mathInputHandlersRef = useRef({});
  
  const getMathInputHandler = useCallback((questionIndex) => {
    if (!mathInputHandlersRef.current[questionIndex]) {
      mathInputHandlersRef.current[questionIndex] = (latexString) => {
        updateAnswer(questionIndex, latexString);
      };
    }
    return mathInputHandlersRef.current[questionIndex];
  }, [updateAnswer]);

  // Ручная отправка теста
  const handleManualSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    const unansweredCount = answersRef.current.filter(answer => 
      answer === 'None' || answer === '' || answer === null || answer === undefined
    ).length;
    
    if (unansweredCount > 0) {
      const confirmMessage = `${unansweredCount} ta savolga javob berilmagan. Testni yakunlashni istaysizmi?`;
      
      if (!window.confirm(confirmMessage)) {
        setIsSubmitting(false);
        return;
      }
    }
    
    const endTime = new Date().toISOString();
    const answersToSend = answersRef.current.map(answer => 
      answer === '' || answer === null || answer === undefined ? 'None' : answer
    );
    
    console.log('📤 Manually submitting test...');
    const result = await onSubmit(answersToSend, startTime, endTime);
    
    if (result.success) {
      navigate('/results');
    } else {
      setSubmitError({
        type: 'error',
        title: 'Yuborishda xatolik',
        message: 'Javoblaringiz yuborilmadi',
        details: result.error || 'Iltimos, internet aloqasini tekshiring va qayta urinib ko\'ring.'
      });
    }
    
    setIsSubmitting(false);
  };

  // Навигация по вопросам
  const nextQuestion = useCallback(() => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, totalQuestions]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  // Переход к конкретному вопросу
  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestion(index);
    }
  }, [totalQuestions]);

  // Восстановление сессии
  const restoreSession = useCallback(() => {
    try {
      const savedState = localStorage.getItem('test_session');
      if (savedState) {
        const { answers: savedAnswers, timestamp } = JSON.parse(savedState);
        
        // Проверяем, не устарели ли данные (больше 24 часов)
        const saveTime = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now - saveTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          if (window.confirm('Saqqlangan javoblaringiz bor. Davom ettirishni istaysizmi?')) {
            setAnswers(savedAnswers);
            answersRef.current = savedAnswers;
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  }, [setAnswers]);

  // Сохранение сессии
  const saveSession = useCallback(() => {
    try {
      const sessionData = {
        answers: answersRef.current,
        testData,
        currentQuestion,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('test_session', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [testData, currentQuestion]);

  // Автосохранение при изменении ответов
  useEffect(() => {
    saveSession();
  }, [answers, saveSession]);

  // Восстановление при загрузке
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Вычисление прогресса
  const answeredCount = useMemo(() => 
    answers.filter(answer => 
      answer !== 'None' && answer !== '' && answer !== null && answer !== undefined
    ).length,
    [answers]
  );
  
  const progressPercentage = useMemo(() => 
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0,
    [answeredCount, totalQuestions]
  );

  // Стиль таймера в зависимости от оставшегося времени
  const timerStyle = useMemo(() => {
    if (timeLeft < 300) return { background: '#ff4757', color: 'white' };
    if (timeLeft < 600) return { background: '#ffa502', color: 'white' };
    return { background: '#2ecc71', color: 'white' };
  }, [timeLeft]);

  // Предупреждение о времени
  if (showTimeWarning) {
    return (
      <div className="time-warning-overlay">
        <div className="time-warning-content">
          <div className="time-warning-icon">⚠️</div>
          <h3>Vaqt kam qoldi!</h3>
          <p>Qolgan vaqt: {formatTime(timeLeft)}</p>
          <button 
            className="time-warning-button"
            onClick={() => setShowTimeWarning(false)}
          >
            Davom etish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Заголовок */}
      <div className="header-section">
        <h1 className="main-title">TEST BOSQICHI</h1>
        <h2 className="sub-title">
          {userData.firstName} {userData.lastName} | {testData.test_name}
        </h2>
      </div>

      {/* Информационная панель */}
      <div className="test-info-panel">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Test kodi:</span>
            <span className="info-value code-font">{testData.test_id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value code-font">{userId}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Savollar:</span>
            <span className="info-value">{totalQuestions} ta</span>
          </div>
          <div className="info-item">
            <span className="info-label">Javob berilgan:</span>
            <span className="info-value">
              <span className={answeredCount === totalQuestions ? 'all-answered' : ''}>
                {answeredCount}/{totalQuestions}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Таймер */}
      <div className="timer-card" style={timerStyle}>
        <div className="timer-label">QOLGAN VAQT</div>
        <div className="timer-value">{formatTime(timeLeft)}</div>
        <div className="timer-note">
          {timeLeft < 600 ? '⚠️ Vaqt tez tugamoqda!' : '⏰ Davom eting...'}
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-info">
          <span>Progress: {progressPercentage}%</span>
          <span>Savol {currentQuestion + 1}/{totalQuestions}</span>
        </div>
      </div>

      {/* Навигация по вопросам */}
      <div className="question-navigation">
        <button 
          className="nav-button prev-button"
          onClick={prevQuestion}
          disabled={currentQuestion === 0 || isSubmitting}
        >
          ← Oldingi
        </button>
        
        <div className="question-counter">
          Savol {currentQuestion + 1}
        </div>
        
        <button 
          className="nav-button next-button"
          onClick={nextQuestion}
          disabled={currentQuestion === totalQuestions - 1 || isSubmitting}
        >
          Keyingi →
        </button>
      </div>

      {/* Быстрая навигация по вопросам */}
      <div className="quick-navigation">
        <div className="quick-nav-label">Tezkor o'tish:</div>
        <div className="quick-nav-buttons">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <button
              key={index}
              className={`quick-nav-button ${
                currentQuestion === index ? 'active' : 
                answers[index] !== 'None' ? 'answered' : 'unanswered'
              }`}
              onClick={() => goToQuestion(index)}
              disabled={isSubmitting}
              title={`Savol ${index + 1} - ${
                answers[index] !== 'None' ? 'Javob berilgan' : 'Javob berilmagan'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Ошибка отправки */}
      {submitError && (
        <div style={{ margin: '20px 0', width: '100%' }}>
          <ErrorDisplay 
            error={submitError}
            onDismiss={() => setSubmitError(null)}
          />
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="test-form">
        {/* Закрытые вопросы */}
        {Array.from({ length: closeQuestionsCount }).map((_, index) => (
          <div 
            key={`closed-${index}`}
            className="question-card"
            style={{ display: currentQuestion === index ? 'block' : 'none' }}
          >
            <div className="question-header">
              <span className="question-type-badge closed-badge">YOPIQ SAVOL</span>
              <span className="question-number">Savol {index + 1}</span>
            </div>
            
            <div className="question-prompt">
              Quyidagi variantlardan to'g'ri javobni tanlang:
            </div>
            
            <div className="options-grid">
              {['A', 'B', 'C', 'D', 'E', 'F'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`option-button ${
                    answers[index] === option ? 'selected' : ''
                  }`}
                  onClick={() => handleOptionSelect(index, option)}
                  disabled={isSubmitting}
                >
                  <span className="option-letter">{option}</span>
                  <span className="option-text">Variant {option}</span>
                </button>
              ))}
            </div>
            
            {answers[index] && answers[index] !== 'None' && (
              <div className="selected-answer-display">
                <span className="selected-label">Tanlangan javob:</span>
                <span className="selected-value">{answers[index]}</span>
              </div>
            )}
          </div>
        ))}

        {/* Открытые вопросы */}
        {Array.from({ length: openQuestionsCount }).map((_, index) => {
          const questionIndex = closeQuestionsCount + index;
          const mathInputHandler = getMathInputHandler(questionIndex);
          
          return (
            <div 
              key={`open-${questionIndex}`}
              className="question-card"
              style={{ display: currentQuestion === questionIndex ? 'block' : 'none' }}
            >
              <div className="question-header">
                <span className="question-type-badge open-badge">OCHIQ SAVOL</span>
                <span className="question-number">Savol {questionIndex + 1}</span>
              </div>
              
              <div className="question-prompt">
                Quyidagi maydonga matematik ifodani kiriting:
              </div>
              
              <div className="math-input-container">
                <div className="math-input-header">
                  <span>Matematik klaviatura:</span>
                  <span className="math-help">ℹ️ Belgilarni tanlang yoki LaTeX formatida kiriting</span>
                </div>
                
                <MathInput 
                  setValue={mathInputHandler}
                  initialLatex={answers[questionIndex] !== 'None' ? answers[questionIndex] : ''}
                />
                
                <div className="math-input-footer">
                  <button 
                    type="button"
                    className="clear-math-button"
                    onClick={() => updateAnswer(questionIndex, 'None')}
                    disabled={isSubmitting || !answers[questionIndex] || answers[questionIndex] === 'None'}
                  >
                    Tozalash
                  </button>
                </div>
              </div>
              
              {answers[questionIndex] && answers[questionIndex] !== 'None' && (
                <div className="math-preview">
                  <div className="preview-label">Joriy javob:</div>
                  <div className="preview-value code-font">{answers[questionIndex]}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Панель управления */}
        <div className="control-panel">
          <button 
            type="button"
            className="control-button save-button"
            onClick={saveSession}
            disabled={isSubmitting}
            title="Joriy holatni saqlash"
          >
            💾 Saqlash
          </button>
          
          <button 
            type="button"
            className="control-button restore-button"
            onClick={restoreSession}
            disabled={isSubmitting}
            title="Saqqlangan holatni tiklash"
          >
            ↩️ Tiklash
          </button>
          
          <button 
            type="submit"
            className="control-button submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                <span style={{ marginLeft: '10px' }}>Yuborilmoqda...</span>
              </>
            ) : (
              '✅ Testni yakunlash'
            )}
          </button>
        </div>
        
        <div className="form-note">
          ⚠️ Diqqat: Testni yakunlaganingizdan so'ng javoblarni o'zgartirib bo'lmaydi.
          {timeLeft < 300 && (
            <span style={{ color: '#ff4757', fontWeight: 'bold' }}>
              {' '}Vaqt tez tugamoqda!
            </span>
          )}
        </div>
      </form>

      {/* Резервная копия информации */}
      <div className="backup-info">
        <div className="backup-icon">💾</div>
        <div className="backup-text">
          Javoblaringiz avtomatik ravishda saqlanib turiladi.
          Internet uzilishida, sahifani qayta ochganingizda davom ettirishingiz mumkin.
        </div>
      </div>
    </div>
  );
};

export default TestPage;
