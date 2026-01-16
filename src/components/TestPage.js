import React, { useState, useEffect } from 'react';
import MathInput from 'react-math-keyboard';

const TestPage = ({ userData, testData, answers, setAnswers, onSubmit, loading }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    if (testData.minutes) {
      const totalSeconds = testData.minutes * 60;
      setTimeLeft(totalSeconds);
      setStartTime(new Date().toISOString());
    }
  }, [testData]);

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

  // Обработчик для закрытых вопросов (кнопки A-F)
  const handleOptionSelect = (questionIndex, option) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = option;
    setAnswers(newAnswers);
  };

  // Обработчик для открытых вопросов (MathInput)
  const handleMathInputChange = (questionIndex) => (latexString) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = latexString || 'None';
    setAnswers(newAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endTime = new Date().toISOString();
    
    // Заменяем пустые строки на 'None' перед отправкой
    const answersToSend = answers.map(answer => 
      answer === '' || answer === null || answer === undefined ? 'None' : answer
    );
    
    onSubmit(answersToSend, startTime, endTime);
  };

  const totalQuestions = (testData.close_questions || 0) + (testData.open_questions || 0);
  const closeQuestionsCount = testData.close_questions || 0;
  const openQuestionsCount = testData.open_questions || 0;

  const options = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="container">
      <div className="header">
        <h1>Test</h1>
        <h2>{userData.firstName} {userData.lastName}</h2>
      </div>

      <div className="test-info">
        <p><strong>User ID:</strong> {testData.user_id}</p>
        <p><strong>Test nomi:</strong> {testData.test_name}</p>
        <p><strong>Yopiq savollar:</strong> {closeQuestionsCount}</p>
        <p><strong>Ochiq savollar:</strong> {openQuestionsCount}</p>
        <p><strong>Jami savollar:</strong> {totalQuestions}</p>
      </div>

      <div className="timer">
        Qolgan vaqt: {formatTime(timeLeft)}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Закрытые вопросы (кнопки A-F) */}
        {Array.from({ length: closeQuestionsCount }).map((_, index) => (
          <div key={index} className="question-card">
            <div className="question-number">
              {index + 1}. Javobingizni belgilang
            </div>
            
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
                Tanlangan javob: <strong>{answers[index]}</strong>
              </div>
            )}
          </div>
        ))}

        {/* Открытые вопросы (MathInput) */}
        {Array.from({ length: openQuestionsCount }).map((_, index) => {
          const questionIndex = closeQuestionsCount + index;
          return (
            <div key={questionIndex} className="question-card">
              <div className="question-number">
                {questionIndex + 1}. Javobingizni yozing
              </div>
              
              <div className="math-input-container">
                <MathInput 
                  setValue={handleMathInputChange(questionIndex)}
                  initialLatex={answers[questionIndex] !== 'None' ? answers[questionIndex] : ''}
                />
              </div>

              {answers[questionIndex] && answers[questionIndex] !== 'None' && (
                <div className="latex-preview">
                  <strong>Joriy javob:</strong> 
                  <code>{answers[questionIndex]}</code>
                </div>
              )}
            </div>
          );
        })}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Yuborilmoqda...' : 'Testni yakunlash'}
        </button>
      </form>
    </div>
  );
};

export default TestPage;
