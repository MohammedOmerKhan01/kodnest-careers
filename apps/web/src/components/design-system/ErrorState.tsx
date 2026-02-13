import React from 'react';

interface ErrorStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, message, action }) => {
  return (
    <div className="error-state">
      <div className="error-state-title">{title}</div>
      <div className="error-state-message">{message}</div>
      {action && (
        <button
          className="btn btn-secondary"
          onClick={action.onClick}
          style={{ marginTop: '16px' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
