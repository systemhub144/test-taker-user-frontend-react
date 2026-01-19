import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorDisplay from '../components/ErrorDisplay';
import './UserInfoPage.css';

const UserInfoPage = ({ userId, testData, onSubmit }) => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    region: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const navigate = useNavigate();

  // Восстанавливаем данные из localStorage при загрузке
  useEffect(() => {
    try {
      const savedUserInfo = localStorage.getItem('user_info');
      if (savedUserInfo) {
        const parsed = JSON.parse(savedUserInfo);
        setUserInfo(parsed);
        console.log('📦 Restored user info from localStorage');
      }
    } catch (error) {
      console.error('Failed to restore user info:', error);
    }
  }, []);

  // Сохраняем данные в localStorage при изменении
  useEffect(() => {
    if (userInfo.firstName || userInfo.lastName || userInfo.region) {
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  // Валидация полей
  const validateField = (field, value) => {
    // Регулярные выражения для валидации
    const nameRegex = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ'\- ]+$/u;
    const maxLength = 50;
    
    if (!value.trim()) {
      return 'Maydon to\'ldirilishi shart';
    }
    
    if (value.length > maxLength) {
      return `Uzunligi ${maxLength} belgidan oshmasligi kerak`;
    }
    
    if (field === 'firstName' || field === 'lastName') {
      if (!nameRegex.test(value)) {
        return 'Faqat harflar, apostrof (\'), defis (-) va bo\'sh joy ruxsat etiladi';
      }
      if (value.length < 2) {
        return 'Kamida 2 ta belgi bo\'lishi kerak';
      }
    }
    
    if (field === 'region') {
      if (!nameRegex.test(value)) {
        return 'Faqat harflar, apostrof (\'), defis (-) va bo\'sh joy ruxsat etiladi';
      }
      if (value.length < 2) {
        return 'Kamida 2 ta belgi bo\'lishi kerak';
      }
    }
    
    return '';
  };

  const handleChange = (field, value) => {
    // Очищаем пробелы в начале и конце
    const trimmedValue = value.trimStart();
    
    setUserInfo(prev => ({ ...prev, [field]: trimmedValue }));
    
    // Валидация на лету для уже тронутых полей
    if (touched[field]) {
      const error = validateField(field, trimmedValue);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
    
    // Сбрасываем ошибку отправки при изменении
    if (submissionError) setSubmissionError(null);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, userInfo[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);
    
    // Помечаем все поля как тронутые
    const allTouched = {
      firstName: true,
      lastName: true,
      region: true
    };
    setTouched(allTouched);
    
    // Валидируем все поля
    const newErrors = {
      firstName: validateField('firstName', userInfo.firstName),
      lastName: validateField('lastName', userInfo.lastName),
      region: validateField('region', userInfo.region)
    };
    
    setErrors(newErrors);
    
    // Проверяем наличие ошибок
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (hasErrors) {
      setIsSubmitting(false);
      setSubmissionError({
        type: 'error',
        title: 'Xatoliklar aniqlandi',
        message: 'Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring',
        details: 'Quyidagi maydonlarda xatoliklar mavjud'
      });
      return;
    }
    
    // Подготавливаем данные
    const userData = {
      firstName: userInfo.firstName.trim(),
      lastName: userInfo.lastName.trim(),
      region: userInfo.region.trim()
    };
    
    // Вызываем обработчик из App.js
    const result = await onSubmit(userData);
    
    if (result && result.success) {
      // Очищаем localStorage
      localStorage.removeItem('user_info');
      
      // Переходим на страницу теста
      navigate('/test');
    } else {
      setSubmissionError({
        type: 'error',
        title: 'Xatolik yuz berdi',
        message: 'Ma\'lumotlarni saqlashda xatolik',
        details: 'Iltimos, qayta urinib ko\'ring'
      });
    }
    
    setIsSubmitting(false);
  };

  // Проверяем, можно ли отправить форму
  const isFormValid = () => {
    return userInfo.firstName.trim() && 
           userInfo.lastName.trim() && 
           userInfo.region.trim() &&
           !Object.values(errors).some(error => error !== '');
  };

  return (
    <div className="app-container">
      <div className="header-section">
        <h1 className="main-title">MA'LUMOTLAR</h1>
        <h2 className="sub-title">Iltimos, ma'lumotlaringizni kiriting</h2>
      </div>

      {/* Информация о тесте */}
      <div className="test-info-card">
        <div className="test-info-header">
          <span className="test-info-icon">📝</span>
          <h3 className="test-info-title">{testData.test_name}</h3>
        </div>
        
        <div className="test-info-grid">
          <div className="test-info-item">
            <span className="test-info-label">Test kodi:</span>
            <span className="test-info-value">{testData.test_id}</span>
          </div>
          <div className="test-info-item">
            <span className="test-info-label">Vaqt:</span>
            <span className="test-info-value">{testData.minutes} daqiqa</span>
          </div>
          <div className="test-info-item">
            <span className="test-info-label">Savollar:</span>
            <span className="test-info-value">
              {testData.close_questions + testData.open_questions} ta
            </span>
          </div>
          <div className="test-info-item">
            <span className="test-info-label">User ID:</span>
            <span className="test-info-value code-font">{userId}</span>
          </div>
        </div>
      </div>

      {/* Ошибка отправки */}
      {submissionError && (
        <div style={{ margin: '20px 0', width: '100%' }}>
          <ErrorDisplay 
            error={submissionError}
            onDismiss={() => setSubmissionError(null)}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="user-info-form">
        {/* Поле имени */}
        <div className={`form-group ${errors.firstName && touched.firstName ? 'has-error' : ''}`}>
          <label htmlFor="firstName" className="form-label">
            Ism
            <span className="required-star"> *</span>
          </label>
          
          <input
            id="firstName"
            type="text"
            className="form-input"
            value={userInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder="Ismingizni kiriting"
            disabled={isSubmitting}
            maxLength="50"
          />
          
          {errors.firstName && touched.firstName && (
            <div className="form-error">{errors.firstName}</div>
          )}
          
          <div className="form-hint">
            Faqat harflar, apostrof (\'), defis (-) va bo\'sh joy. Min: 2, Max: 50 belgi.
          </div>
        </div>

        {/* Поле фамилии */}
        <div className={`form-group ${errors.lastName && touched.lastName ? 'has-error' : ''}`}>
          <label htmlFor="lastName" className="form-label">
            Familiya
            <span className="required-star"> *</span>
          </label>
          
          <input
            id="lastName"
            type="text"
            className="form-input"
            value={userInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Familiyangizni kiriting"
            disabled={isSubmitting}
            maxLength="50"
          />
          
          {errors.lastName && touched.lastName && (
            <div className="form-error">{errors.lastName}</div>
          )}
          
          <div className="form-hint">
            Faqat harflar, apostrof (\'), defis (-) va bo\'sh joy. Min: 2, Max: 50 belgi.
          </div>
        </div>

        {/* Поле региона */}
        <div className={`form-group ${errors.region && touched.region ? 'has-error' : ''}`}>
          <label htmlFor="region" className="form-label">
            Viloyat/Shahar
            <span className="required-star"> *</span>
          </label>
          
          <input
            id="region"
            type="text"
            className="form-input"
            value={userInfo.region}
            onChange={(e) => handleChange('region', e.target.value)}
            onBlur={() => handleBlur('region')}
            placeholder="Viloyatingizni kiriting"
            disabled={isSubmitting}
            maxLength="50"
          />
          
          {errors.region && touched.region && (
            <div className="form-error">{errors.region}</div>
          )}
          
          <div className="form-hint">
            Yashash joyingiz (viloyat yoki shahar). Faqat harflar, apostrof (\'), defis (-) va bo\'sh joy.
          </div>
        </div>

        {/* Кнопка отправки */}
        <div className="form-submit-section">
          <button 
            type="submit" 
            className="submit-button"
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                <span style={{ marginLeft: '10px' }}>Saqlanmoqda...</span>
              </>
            ) : (
              'Testni boshlash'
            )}
          </button>
          
          <div className="form-note">
            Ma'lumotlaringiz faqat test uchun ishlatiladi va test yakunlangach serverga yuboriladi.
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserInfoPage;
