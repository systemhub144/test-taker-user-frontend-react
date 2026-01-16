import React, { useState } from 'react';

const UserInfoPage = ({ userId, testData, onSubmit }) => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    region: ''
  });

  const handleChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(userInfo);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>REPETITSION TEST</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ism</label>
          <input
            type="text"
            className="form-control"
            value={userInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Ismingizni yozing"
            required
          />
        </div>

        <div className="form-group">
          <label>Familiya</label>
          <input
            type="text"
            className="form-control"
            value={userInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Familiyangizni yozing"
            required
          />
        </div>

        <div className="form-group">
          <label>Viloyat</label>
          <input
            type="text"
            className="form-control"
            value={userInfo.region}
            onChange={(e) => handleChange('region', e.target.value)}
            placeholder="Viloyatingizni yozing"
            required
          />
        </div>

        <button type="submit" className="btn">
          Jo'natish
        </button>
      </form>
    </div>
  );
};

export default UserInfoPage;
