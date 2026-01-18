import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserInfoPage = ({ testData, onSubmit }) => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    region: ''
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateField = (field, value) => {
    const nameRegex = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ'\- ]+$/u;
    
    if (!value.trim()) {
      return 'Maydon to\'ldirilishi shart';
    }
    
    if (field === 'firstName' || field === 'lastName') {
      if (!nameRegex.test(value)) {
        return 'Faqat harflar, apostrof, defis va bo\'sh joy ruxsat etiladi';
      }
    }
    
    if (field === 'region') {
      if (!nameRegex.test(value)) {
        return 'Faqat harflar, apostrof, defis va bo\'sh joy ruxsat etiladi';
      }
    }
    
    return '';
  };

  const handleChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    const error = validateField(field, userInfo[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {
      firstName: validateField('firstName', userInfo.firstName),
      lastName: validateField('lastName', userInfo.lastName),
      region: validateField('region', userInfo.region)
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    onSubmit(userInfo);
    navigate('/test');
  };

  return (
    <div className="App-container">
      <div className="Title">
        <h1>MA'LUMOTLAR</h1>
      </div>
      
      <div className="Subtitle">
        <h2>Iltimos, ma'lumotlaringizni kiriting</h2>
      </div>

      <div className="Info-box">
        <div className="Info-item">
          <span className="Info-label">Test nomi:</span> {testData.test_name}
        </div>
        <div className="Info-item">
          <span className="Info-label">Vaqt:</span> {testData.minutes} daqiqa
        </div>
        <div className="Info-item">
          <span className="Info-label">Test kodi:</span> {testData.test_id}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="Input-group">
          <label className="Input-title">Ism</label>
          <input
            type="text"
            className="Input-field"
            value={userInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder="Ismingizni yozing"
          />
          {errors.firstName && (
            <div className="Error-message" style={{ marginTop: '10px', fontSize: '12px' }}>
              {errors.firstName}
            </div>
          )}
        </div>

        <div className="Input-group">
          <label className="Input-title">Familiya</label>
          <input
            type="text"
            className="Input-field"
            value={userInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Familiyangizni yozing"
          />
          {errors.lastName && (
            <div className="Error-message" style={{ marginTop: '10px', fontSize: '12px' }}>
              {errors.lastName}
            </div>
          )}
        </div>

        <div className="Input-group">
          <label className="Input-title">Viloyat</label>
          <input
            type="text"
            className="Input-field"
            value={userInfo.region}
            onChange={(e) => handleChange('region', e.target.value)}
            onBlur={() => handleBlur('region')}
            placeholder="Viloyatingizni yozing"
          />
          {errors.region && (
            <div className="Error-message" style={{ marginTop: '10px', fontSize: '12px' }}>
              {errors.region}
            </div>
          )}
        </div>

        <div className="Button-container">
          <button type="submit" className="Button">
            Testni boshlash
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInfoPage;
