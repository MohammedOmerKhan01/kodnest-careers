import React from 'react';

interface ProofItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ProofFooterProps {
  items: ProofItem[];
  onToggle: (id: string) => void;
}

export const ProofFooter: React.FC<ProofFooterProps> = ({ items, onToggle }) => {
  return (
    <div className="proof-footer">
      <div className="proof-checklist">
        {items.map((item) => (
          <label key={item.id} className="proof-item">
            <input
              type="checkbox"
              className="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
