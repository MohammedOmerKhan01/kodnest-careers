import React from 'react';

interface TopBarProps {
  projectName: string;
  currentStep?: number;
  totalSteps?: number;
  status: 'not-started' | 'in-progress' | 'shipped';
}

export const TopBar: React.FC<TopBarProps> = ({
  projectName,
  currentStep,
  totalSteps,
  status,
}) => {
  const statusLabels = {
    'not-started': 'Not Started',
    'in-progress': 'In Progress',
    'shipped': 'Shipped',
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">{projectName}</div>
      {currentStep && totalSteps && (
        <div className="top-bar-center">
          Step {currentStep} / {totalSteps}
        </div>
      )}
      <div className="top-bar-right">
        <span className={`status-badge ${status}`}>
          {statusLabels[status]}
        </span>
      </div>
    </div>
  );
};
