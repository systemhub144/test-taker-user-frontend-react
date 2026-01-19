import React from 'react';
import './ErrorDisplay.css';

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  const { type = 'error', title, message, details } = error;

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          background: '#ffeaea',
          borderColor: '#ff4d4d',
          icon: '❌',
          titleColor: '#c62828'
        };
      case 'warning':
        return {
          background: '#fff8e1',
          borderColor: '#ffb300',
          icon: '⚠️',
          titleColor: '#ff8f00'
        };
      case 'info':
        return {
          background: '#e3f2fd',
          borderColor: '#2196f3',
          icon: 'ℹ️',
          titleColor: '#1565c0'
        };
      case 'success':
        return {
          background: '#e8f5e9',
          borderColor: '#4caf50',
          icon: '✅',
          titleColor: '#2e7d32'
        };
      default:
        return {
          background: '#ffeaea',
          borderColor: '#ff4d4d',
          icon: '❌',
          titleColor: '#c62828'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="error-container" style={{ background: styles.background, borderColor: styles.borderColor }}>
      <div className="error-header">
        <span className="error-icon" style={{ fontSize: '20px', marginRight: '10px' }}>
          {styles.icon}
        </span>
        <h3 className="error-title" style={{ color: styles.titleColor, margin: 0 }}>
          {title}
        </h3>
        {onDismiss && (
          <button 
            className="error-dismiss-btn"
            onClick={onDismiss}
            aria-label="Close error message"
          >
            &times;
          </button>
        )}
      </div>
      
      <div className="error-body">
        <p className="error-message">{message}</p>
        {details && (
          <div className="error-details">
            <p>{details}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
