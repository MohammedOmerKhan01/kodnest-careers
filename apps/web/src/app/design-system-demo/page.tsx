'use client';

import React, { useState } from 'react';
import {
  TopBar,
  ContextHeader,
  SecondaryPanel,
  ProofFooter,
  Card,
  Button,
  Input,
  ErrorState,
  EmptyState,
} from '@components/design-system';
import '../../styles/design-system.css';

export default function DesignSystemDemo() {
  const [proofItems, setProofItems] = useState([
    { id: 'ui', label: 'UI Built', checked: false },
    { id: 'logic', label: 'Logic Working', checked: false },
    { id: 'test', label: 'Test Passed', checked: false },
    { id: 'deploy', label: 'Deployed', checked: false },
  ]);

  const [inputValue, setInputValue] = useState('');

  const handleProofToggle = (id: string) => {
    setProofItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="page-container">
      <TopBar
        projectName="KodNest Premium Build System"
        currentStep={1}
        totalSteps={5}
        status="in-progress"
      />

      <ContextHeader
        title="Design System Demonstration"
        subtitle="A calm, intentional interface for serious product companies"
      />

      <div className="main-content">
        <div className="primary-workspace">
          <Card title="Typography Examples">
            <h1 className="heading-xl" style={{ marginBottom: '24px' }}>
              Extra Large Heading
            </h1>
            <h2 className="heading-lg" style={{ marginBottom: '24px' }}>
              Large Heading
            </h2>
            <h3 className="heading-md" style={{ marginBottom: '24px' }}>
              Medium Heading
            </h3>
            <p className="body-text" style={{ marginBottom: '16px' }}>
              This is body text set in a clean sans-serif at 16px with a line
              height of 1.7. The maximum width is constrained to 720px for
              optimal readability. No decorative fonts, no random sizes—just
              clear, confident typography that respects the reader.
            </p>
            <p className="body-text-secondary">
              This is secondary body text, used for supporting information.
            </p>
          </Card>

          <div style={{ height: '24px' }} />

          <Card title="Form Elements">
            <div style={{ marginBottom: '16px' }}>
              <label
                className="body-text-secondary"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Project Name
              </label>
              <Input
                placeholder="Enter project name"
                value={inputValue}
                onChange={setInputValue}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
            </div>
          </Card>

          <div style={{ height: '24px' }} />

          <Card title="State Examples">
            <div style={{ marginBottom: '24px' }}>
              <ErrorState
                title="Build Failed"
                message="The deployment encountered an issue with the configuration file. Check that all environment variables are properly set in your .env file."
                action={{
                  label: 'Review Configuration',
                  onClick: () => console.log('Review clicked'),
                }}
              />
            </div>

            <EmptyState
              title="No Projects Yet"
              message="Create your first project to get started with the build system."
              action={{
                label: 'Create Project',
                onClick: () => console.log('Create clicked'),
              }}
            />
          </Card>
        </div>

        <SecondaryPanel
          stepExplanation="This demonstration showcases the core components of the KodNest Premium Build System. Each element follows the design philosophy: calm, intentional, coherent, confident."
          prompt="Review the typography, spacing, and component styling. Notice the consistent use of the 8/16/24/40/64px spacing scale and the limited color palette."
          onCopy={() => console.log('Copy clicked')}
          onBuildInLovable={() => console.log('Build clicked')}
          onItWorked={() => console.log('It worked clicked')}
          onError={() => console.log('Error clicked')}
          onAddScreenshot={() => console.log('Screenshot clicked')}
        />
      </div>

      <ProofFooter items={proofItems} onToggle={handleProofToggle} />
    </div>
  );
}
