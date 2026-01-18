import React, { useState } from 'react';

const UserInfoPage = ({ userId, testData, onSubmit }) => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    region: ''
  });
  
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    region: ''
  });

  // Регулярные выражения для валидации
  const nameRegex = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ'\- ]+$/u;
  const cityRegex = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ'\- ]+$/u;

  const validateField = (field, value) => {
    let error = '';
    
    if (!value.trim()) {
      error = 'Maydon to\'ldirilishi shart';
    } else if (field === 'firstName' || field === 'lastName') {
      if (!nameRegex.test(value)) {
        error = 'Faqat harflar, apostrof, defis va bo\'sh joy ruxsat etiladi';
      } else if (value.length < 2) {
        error = 'Kamida 2 ta belgi bo\'lishi kerak';
      } else if (value.length > 50) {
        error = '50 tadan ortiq belgi kiritish mumkin emas';
      }
    } else if (field === 'region') {
      if (!cityRegex.test(value)) {
        error = 'Faqat harflar, apostrof, defis va bo\'sh joy ruxsat etiladi';
      } else if (value.length < 2) {
        error = 'Kamida 2 ta belgi bo\'lishi kerak';
      } else if (value.length > 50) {
        error = '50 tadan ortiq belgi kiritish mumkin emas';
      }
    }
    
    return error;
  };

  const handleChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Валидация при вводе
    if (errors[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleBlur = (field) => {
    const error = validateField(field, userInfo[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверка всех полей
    const newErrors = {
      firstName: validateField('firstName', userInfo.firstName),
      lastName: validateField('lastName', userInfo.lastName),
      region: validateField('region', userInfo.region)
    };
    
    setErrors(newErrors);
    
    // Если есть ошибки, не отправляем форму
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    onSubmit(userInfo);
  };

  const isFormValid = () => {
    return userInfo.firstName.trim() && 
           userInfo.lastName.trim() && 
           userInfo.region.trim() &&
           !Object.values(errors).some(error => error !== '');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>REPETITSION TEST</h1>
        <h2>Ma'lumotlaringizni kiriting</h2>
      </div>

      <div className="test-info" style={{ marginBottom: '30px' }}>
        <p><strong>Test nomi:</strong> {testData.test_name}</p>
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Test ID:</strong> {testData.test_id}</p>
        <p><strong>Vaqt:</strong> {testData.minutes} daqiqa</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={`form-group ${errors.firstName ? 'has-error' : ''}`}>
          <label htmlFor="firstName">Ism *</label>
          <input
            id="firstName"
            type="text"
            className="form-control"
            value={userInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder="Ismingizni yozing"
            required
            maxLength="50"
          />
          {errors.firstName && (
            <div className="validation-error">
              {errors.firstName}
            </div>
          )}
        </div>

        <div className={`form-group ${errors.lastName ? 'has-error' : ''}`}>
          <label htmlFor="lastName">Familiya *</label>
          <input
            id="lastName"
            type="text"
            className="form-control"
            value={userInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Familiyangizni yozing"
            required
            maxLength="50"
          />
          {errors.lastName && (
            <div className="validation-error">
              {errors.lastName}
            </div>
          )}
        </div>

        <div className={`form-group ${errors.region ? 'has-error' : ''}`}>
          <label htmlFor="region">Viloyat *</label>
          <input
            id="region"
            type="text"
            className="form-control"
            value={userInfo.region}
            onChange={(e) => handleChange('region', e.target.value)}
            onBlur={() => handleBlur('region')}
            placeholder="Viloyatingizni yozing"
            required
            maxLength="50"
          />
          {errors.region && (
            <div className="validation-error">
              {errors.region}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn"
          disabled={!isFormValid()}
          style={{ 
            opacity: !isFormValid() ? 0.7 : 1,
            cursor: !isFormValid() ? 'not-allowed' : 'pointer'
          }}
        >
          Testni boshlash
        </button>
      </form>
    </div>
  );
};

export default UserInfoPage;
