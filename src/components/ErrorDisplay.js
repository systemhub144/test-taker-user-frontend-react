import React from 'react';

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  const { type = 'error', message, details } = error;

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          background: '#f8d7da',
          color: '#721c24',
          borderColor: '#f5c6cb',
          icon: '❌'
        };
      case 'warning':
        return {
          background: '#fff3cd',
          color: '#856404',
          borderColor: '#ffeaa7',
          icon: '⚠️'
        };
      case 'info':
        return {
          background: '#d1ecf1',
          color: '#0c5460',
          borderColor: '#bee5eb',
          icon: 'ℹ️'
        };
      default:
        return {
          background: '#f8d7da',
          color: '#721c24',
          borderColor: '#f5c6cb',
          icon: '❌'
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      className="error-container"
      style={{
        background: styles.background,
        color: styles.color,
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '10px',
        padding: '20px',
        margin: '20px 0',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '24px', marginRight: '15px' }}>{styles.icon}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
            {message}
          </h3>
          {details && (
            <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
              {details}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: styles.color,
              opacity: 0.7,
              padding: '0',
              marginLeft: '10px'
            }}
            aria-label="Yopish"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
