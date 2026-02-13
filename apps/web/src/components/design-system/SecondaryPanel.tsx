import React from 'react';

interface SecondaryPanelProps {
  stepExplanation: string;
  prompt: string;
  onCopy: () => void;
  onBuildInLovable: () => void;
  onItWorked: () => void;
  onError: () => void;
  onAddScreenshot: () => void;
}

export const SecondaryPanel: React.FC<SecondaryPanelProps> = ({
  stepExplanation,
  prompt,
  onCopy,
  onBuildInLovable,
  onItWorked,
  onError,
  onAddScreenshot,
}) => {
  return (
    <div className="secondary-panel">
      <div className="card">
        <h3 className="card-title">Step Explanation</h3>
        <p className="body-text-secondary">{stepExplanation}</p>
      </div>

      <div className="card">
        <h3 className="card-title">Prompt</h3>
        <div className="prompt-box">{prompt}</div>
        <button className="btn btn-secondary" onClick={onCopy} style={{ marginTop: '16px', width: '100%' }}>
          Copy
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn btn-primary" onClick={onBuildInLovable}>
          Build in Lovable
        </button>
        <button className="btn btn-secondary" onClick={onItWorked}>
          It Worked
        </button>
        <button className="btn btn-secondary" onClick={onError}>
          Error
        </button>
        <button className="btn btn-secondary" onClick={onAddScreenshot}>
          Add Screenshot
        </button>
      </div>
    </div>
  );
};
