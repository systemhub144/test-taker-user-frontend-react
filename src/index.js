import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Логирование ошибок React
const logReactError = (error, errorInfo) => {
  console.error('React Error:', {
    error: error.toString(),
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
};

// Обработчик ошибок для всего приложения
window.addEventListener('error', (event) => {
  console.error('Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  });
});

// Обработчик unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    timestamp: new Date().toISOString()
  });
});

const root = ReactDOM.createRoot(document.getElementById('root'));

// Проверка поддержки браузером
const isBrowserSupported = () => {
  const requiredFeatures = [
    'fetch',
    'Promise',
    'localStorage',
    'sessionStorage',
    'URLSearchParams'
  ];
  
  return requiredFeatures.every(feature => feature in window);
};

const renderApp = () => {
  if (!isBrowserSupported()) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#dc3545' }}>⚠️ Browser not supported</h1>
        <p>Please update your browser or use a modern browser like Chrome, Firefox, or Edge.</p>
      </div>
    );
  }

  return <App />;
};

root.render(
  <React.StrictMode>
    {renderApp()}
  </React.StrictMode>
);
