import React, { useState } from 'react';

const TestCodePage = ({ userId, onSubmit, loading }) => {
  const [testCode, setTestCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (testCode.trim()) {
      onSubmit(testCode);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>REPETITSION TEST</h1>
        <h2>Iltimos, test kodini kiriting</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Test kodini kiriting</label>
          <input
            type="text"
            className="form-control"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="Test kodini kiriting"
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Tekshirilmoqda...' : 'Jo\'natish'}
        </button>
      </form>
    </div>
  );
};

export default TestCodePage;
