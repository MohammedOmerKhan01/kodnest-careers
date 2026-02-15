import React from 'react';
import { JobTrackerNav } from '@components/layout/JobTrackerNav';
import '@components/layout/job-tracker-nav.css';

export default function ProofPage() {
  return (
    <div className="job-tracker-shell">
      <JobTrackerNav />
      <main className="job-tracker-content">
        <h1 className="heading-xl">Proof</h1>
        <p className="body-text-secondary">This section will be built in the next step.</p>
      </main>
    </div>
  );
}
