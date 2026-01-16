import React from 'react';

const ResultsPage = ({ userData, testData, userId }) => {
  return (
    <div className="container">
      <div className="header">
        <h1>Test yakunlandi</h1>
      </div>

      <div className="user-info">
        <p><strong>Ism:</strong> {userData.firstName}</p>
        <p><strong>Familiya:</strong> {userData.lastName}</p>
        <p><strong>Viloyat:</strong> {userData.region}</p>
        <p><strong>User ID:</strong> {userId}</p>
        {testData.test_id && <p><strong>Test ID:</strong> {testData.test_id}</p>}
      </div>

      <div className="results-success">
        <h3>✅ Ma'lumotlar muvaffaqiyatli yuborildi</h3>
        <p>Javoblaringiz serverga qabul qilindi.</p>
      </div>
    </div>
  );
};

export default ResultsPage;
