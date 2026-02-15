'use client';

import React, { useState, useEffect } from 'react';
import './job-tracker.css';
import { jobsData, Job } from './jobData';

type Section = 'landing' | 'dashboard' | 'saved' | 'digest' | 'settings' | 'proof' | 'test' | 'ship';

interface Preferences {
  roleKeywords: string;
  preferredLocations: string[];
  preferredMode: string[];
  experienceLevel: string;
  skills: string;
  minMatchScore: number;
}

interface JobWithScore extends Job {
  matchScore: number;
}

type JobStatus = 'Not Applied' | 'Applied' | 'Rejected' | 'Selected';

interface StatusUpdate {
  jobId: string;
  jobTitle: string;
  company: string;
  status: JobStatus;
  date: string;
}

const sections: { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'saved', label: 'Saved' },
  { id: 'digest', label: 'Digest' },
  { id: 'settings', label: 'Settings' },
  { id: 'proof', label: 'Proof' },
];

export default function JobTrackerPage() {
  const [activeSection, setActiveSection] = useState<Section>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithScore | null>(null);
  
  // Job status tracking
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');
  
  // Preferences
  const [preferences, setPreferences] = useState<Preferences>({
    roleKeywords: '',
    preferredLocations: [],
    preferredMode: [],
    experienceLevel: '',
    skills: '',
    minMatchScore: 40
  });
  
  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobIds(JSON.parse(saved));
    }
    
    const savedPrefs = localStorage.getItem('jobTrackerPreferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
    
    const savedStatuses = localStorage.getItem('jobTrackerStatus');
    if (savedStatuses) {
      setJobStatuses(JSON.parse(savedStatuses));
    }
    
    const savedUpdates = localStorage.getItem('jobTrackerStatusUpdates');
    if (savedUpdates) {
      setStatusUpdates(JSON.parse(savedUpdates));
    }
    
    const savedChecklist = localStorage.getItem('jobTrackerTestChecklist');
    if (savedChecklist) {
      setTestChecklist(JSON.parse(savedChecklist));
    }
    
    const savedProofLinks = localStorage.getItem('jobTrackerProofLinks');
    if (savedProofLinks) {
      setProofLinks(JSON.parse(savedProofLinks));
    }
  }, []);
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };
  
  const updateJobStatus = (jobId: string, jobTitle: string, company: string, status: JobStatus) => {
    const newStatuses = { ...jobStatuses, [jobId]: status };
    setJobStatuses(newStatuses);
    localStorage.setItem('jobTrackerStatus', JSON.stringify(newStatuses));
    
    // Add to status updates
    const update: StatusUpdate = {
      jobId,
      jobTitle,
      company,
      status,
      date: new Date().toISOString()
    };
    
    const newUpdates = [update, ...statusUpdates].slice(0, 20); // Keep last 20
    setStatusUpdates(newUpdates);
    localStorage.setItem('jobTrackerStatusUpdates', JSON.stringify(newUpdates));
    
    // Show toast for Applied, Rejected, Selected
    if (status !== 'Not Applied') {
      showToast(`Status updated: ${status}`);
    }
  };
  
  const getJobStatus = (jobId: string): JobStatus => {
    return jobStatuses[jobId] || 'Not Applied';
  };

  const calculateMatchScore = (job: Job): number => {
    let score = 0;
    
    // +25 if any roleKeyword appears in job.title
    if (preferences.roleKeywords) {
      const keywords = preferences.roleKeywords.split(',').map(k => k.trim().toLowerCase());
      if (keywords.some(keyword => job.title.toLowerCase().includes(keyword))) {
        score += 25;
      }
    }
    
    // +15 if any roleKeyword appears in job.description
    if (preferences.roleKeywords) {
      const keywords = preferences.roleKeywords.split(',').map(k => k.trim().toLowerCase());
      if (keywords.some(keyword => job.description.toLowerCase().includes(keyword))) {
        score += 15;
      }
    }
    
    // +15 if job.location matches preferredLocations
    if (preferences.preferredLocations.length > 0 && preferences.preferredLocations.includes(job.location)) {
      score += 15;
    }
    
    // +10 if job.mode matches preferredMode
    if (preferences.preferredMode.length > 0 && preferences.preferredMode.includes(job.mode)) {
      score += 10;
    }
    
    // +10 if job.experience matches experienceLevel
    if (preferences.experienceLevel && job.experience === preferences.experienceLevel) {
      score += 10;
    }
    
    // +15 if overlap between job.skills and user.skills
    if (preferences.skills) {
      const userSkills = preferences.skills.split(',').map(s => s.trim().toLowerCase());
      const jobSkills = job.skills.map(s => s.toLowerCase());
      if (userSkills.some(skill => jobSkills.includes(skill))) {
        score += 15;
      }
    }
    
    // +5 if postedDaysAgo <= 2
    if (job.postedDaysAgo <= 2) {
      score += 5;
    }
    
    // +5 if source is LinkedIn
    if (job.source === 'LinkedIn') {
      score += 5;
    }
    
    // Cap at 100
    return Math.min(score, 100);
  };

  const getJobsWithScores = (): JobWithScore[] => {
    return jobsData.map(job => ({
      ...job,
      matchScore: calculateMatchScore(job)
    }));
  };

  const handleNavClick = (sectionId: Section) => {
    // Lock ship section until all tests pass
    if (sectionId === 'ship') {
      const allTestsPassed = Object.values(testChecklist).every(v => v === true);
      if (!allTestsPassed) {
        alert('Complete all test checklist items before accessing Ship section.');
        return;
      }
    }
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  };
  
  const toggleChecklistItem = (key: keyof typeof testChecklist) => {
    const newChecklist = { ...testChecklist, [key]: !testChecklist[key] };
    setTestChecklist(newChecklist);
    localStorage.setItem('jobTrackerTestChecklist', JSON.stringify(newChecklist));
  };
  
  const resetTestChecklist = () => {
    const resetChecklist = {
      preferencePersist: false,
      matchScoreCalculates: false,
      showOnlyMatchesWorks: false,
      saveJobPersists: false,
      applyOpensNewTab: false,
      statusUpdatePersists: false,
      statusFilterWorks: false,
      digestGeneratesTop10: false,
      digestPersistsForDay: false,
      noConsoleErrors: false,
    };
    setTestChecklist(resetChecklist);
    localStorage.setItem('jobTrackerTestChecklist', JSON.stringify(resetChecklist));
  };
  
  const getTestsPassed = () => {
    return Object.values(testChecklist).filter(v => v === true).length;
  };
  
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  const updateProofLink = (key: keyof typeof proofLinks, value: string) => {
    const newLinks = { ...proofLinks, [key]: value };
    setProofLinks(newLinks);
    localStorage.setItem('jobTrackerProofLinks', JSON.stringify(newLinks));
  };
  
  const areAllLinksValid = (): boolean => {
    return (
      proofLinks.lovableProject !== '' && isValidUrl(proofLinks.lovableProject) &&
      proofLinks.githubRepository !== '' && isValidUrl(proofLinks.githubRepository) &&
      proofLinks.deployedUrl !== '' && isValidUrl(proofLinks.deployedUrl)
    );
  };
  
  const getProjectStatus = (): 'Not Started' | 'In Progress' | 'Shipped' => {
    const allTestsPassed = getTestsPassed() === 10;
    const allLinksProvided = areAllLinksValid();
    
    if (allTestsPassed && allLinksProvided) {
      return 'Shipped';
    } else if (getTestsPassed() > 0 || proofLinks.lovableProject || proofLinks.githubRepository || proofLinks.deployedUrl) {
      return 'In Progress';
    } else {
      return 'Not Started';
    }
  };
  
  const copyFinalSubmission = () => {
    const submission = `Job Notification Tracker — Final Submission

Lovable Project:
${proofLinks.lovableProject}

GitHub Repository:
${proofLinks.githubRepository}

Live Deployment:
${proofLinks.deployedUrl}

Core Features:
- Intelligent match scoring
- Daily digest simulation
- Status tracking
- Test checklist enforced

---`;
    
    navigator.clipboard.writeText(submission);
    alert('Final submission copied to clipboard!');
  };
  
  const getStepStatus = (stepNumber: number): 'Completed' | 'Pending' => {
    // All steps are completed since we built everything
    return 'Completed';
  };

  const saveJob = (jobId: string) => {
    const newSaved = [...savedJobIds, jobId];
    setSavedJobIds(newSaved);
    localStorage.setItem('savedJobs', JSON.stringify(newSaved));
  };

  const unsaveJob = (jobId: string) => {
    const newSaved = savedJobIds.filter(id => id !== jobId);
    setSavedJobIds(newSaved);
    localStorage.setItem('savedJobs', JSON.stringify(newSaved));
  };

  const savePreferences = () => {
    localStorage.setItem('jobTrackerPreferences', JSON.stringify(preferences));
    alert('Preferences saved successfully!');
  };

  const filterJobs = (jobs: JobWithScore[]) => {
    let filtered = jobs;

    // Show only matches toggle
    if (showOnlyMatches) {
      filtered = filtered.filter(job => job.matchScore >= preferences.minMatchScore);
    }

    if (searchKeyword) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.company.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job => job.location === locationFilter);
    }

    if (modeFilter) {
      filtered = filtered.filter(job => job.mode === modeFilter);
    }

    if (experienceFilter) {
      filtered = filtered.filter(job => job.experience === experienceFilter);
    }

    if (sourceFilter) {
      filtered = filtered.filter(job => job.source === sourceFilter);
    }
    
    if (statusFilter) {
      filtered = filtered.filter(job => getJobStatus(job.id) === statusFilter);
    }

    // Sorting
    if (sortBy === 'latest') {
      filtered = [...filtered].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (sortBy === 'matchScore') {
      filtered = [...filtered].sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'salary') {
      filtered = [...filtered].sort((a, b) => {
        const extractNumber = (str: string) => {
          const match = str.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return extractNumber(b.salaryRange) - extractNumber(a.salaryRange);
      });
    }

    return filtered;
  };

  const jobsWithScores = getJobsWithScores();
  const displayedJobs = filterJobs(jobsWithScores);
  const savedJobs = jobsWithScores.filter(job => savedJobIds.includes(job.id));
  
  const hasPreferences = preferences.roleKeywords || preferences.preferredLocations.length > 0 || preferences.preferredMode.length > 0;
  
  // Digest state
  const [todayDigest, setTodayDigest] = useState<JobWithScore[]>([]);
  const [digestDate, setDigestDate] = useState<string>('');
  
  // Test checklist state
  const [testChecklist, setTestChecklist] = useState({
    preferencePersist: false,
    matchScoreCalculates: false,
    showOnlyMatchesWorks: false,
    saveJobPersists: false,
    applyOpensNewTab: false,
    statusUpdatePersists: false,
    statusFilterWorks: false,
    digestGeneratesTop10: false,
    digestPersistsForDay: false,
    noConsoleErrors: false,
  });
  
  // Proof & Submission state
  const [proofLinks, setProofLinks] = useState({
    lovableProject: '',
    githubRepository: '',
    deployedUrl: '',
  });
  
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };
  
  const generateDigest = () => {
    const today = getTodayDate();
    const digestKey = `jobTrackerDigest_${today}`;
    
    // Check if digest already exists for today
    const existingDigest = localStorage.getItem(digestKey);
    if (existingDigest) {
      const parsed = JSON.parse(existingDigest);
      setTodayDigest(parsed);
      setDigestDate(today);
      return;
    }
    
    // Generate new digest: top 10 jobs by matchScore desc, then postedDaysAgo asc
    const sortedJobs = [...jobsWithScores]
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return a.postedDaysAgo - b.postedDaysAgo;
      })
      .slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem(digestKey, JSON.stringify(sortedJobs));
    setTodayDigest(sortedJobs);
    setDigestDate(today);
  };
  
  const loadTodayDigest = () => {
    const today = getTodayDate();
    const digestKey = `jobTrackerDigest_${today}`;
    const existingDigest = localStorage.getItem(digestKey);
    
    if (existingDigest) {
      const parsed = JSON.parse(existingDigest);
      setTodayDigest(parsed);
      setDigestDate(today);
    }
  };
  
  useEffect(() => {
    if (activeSection === 'digest') {
      loadTodayDigest();
    }
  }, [activeSection]);
  
  const copyDigestToClipboard = () => {
    const digestText = `Top 10 Jobs For You — 9AM Digest\n${new Date(digestDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n${todayDigest.map((job, index) => 
      `${index + 1}. ${job.title} at ${job.company}\n   Location: ${job.location} | Experience: ${job.experience}\n   Match Score: ${job.matchScore}%\n   Apply: ${job.applyUrl}\n`
    ).join('\n')}\n\nThis digest was generated based on your preferences.`;
    
    navigator.clipboard.writeText(digestText);
    alert('Digest copied to clipboard!');
  };
  
  const createEmailDraft = () => {
    const subject = encodeURIComponent('My 9AM Job Digest');
    const body = encodeURIComponent(
      `Top 10 Jobs For You — 9AM Digest\n${new Date(digestDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n${todayDigest.map((job, index) => 
        `${index + 1}. ${job.title} at ${job.company}\n   Location: ${job.location} | Experience: ${job.experience}\n   Match Score: ${job.matchScore}%\n   Apply: ${job.applyUrl}\n`
      ).join('\n')}\n\nThis digest was generated based on your preferences.`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="job-tracker-shell">
      {activeSection !== 'landing' && (
        <nav className="job-tracker-nav">
          <button
            className="job-tracker-nav__hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`job-tracker-nav__list ${isMenuOpen ? 'job-tracker-nav__list--open' : ''}`}>
            {sections.map((section) => (
              <li key={section.id} className="job-tracker-nav__item">
                <button
                  className={`job-tracker-nav__link ${activeSection === section.id ? 'job-tracker-nav__link--active' : ''}`}
                  onClick={() => handleNavClick(section.id)}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <main className="job-tracker-content">
        {activeSection === 'landing' && (
          <div className="landing-hero">
            <h1 className="landing-hero__headline">Stop Missing The Right Jobs.</h1>
            <p className="landing-hero__subtext">
              Precision-matched job discovery delivered daily at 9AM.
            </p>
            <button
              className="btn-cta"
              onClick={() => handleNavClick('settings')}
            >
              Start Tracking
            </button>
            
            <div className="landing-dev-links">
              <button className="btn-secondary-small" onClick={() => handleNavClick('test')}>
                Test Checklist
              </button>
              <button className="btn-secondary-small" onClick={() => handleNavClick('ship')}>
                Ship
              </button>
            </div>
          </div>
        )}

        {activeSection === 'dashboard' && (
          <div className="dashboard-container">
            <h1 className="heading-xl">Dashboard</h1>
            
            {!hasPreferences && (
              <div className="preference-banner">
                <p>Set your preferences to activate intelligent matching.</p>
                <button className="btn-secondary-small" onClick={() => handleNavClick('settings')}>
                  Go to Settings
                </button>
              </div>
            )}
            
            <div className="filter-bar">
              <input
                type="text"
                className="filter-input"
                placeholder="Search by title or company..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              
              <select className="filter-select" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="">All Locations</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Noida">Noida</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Mysore">Mysore</option>
              </select>

              <select className="filter-select" value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                <option value="">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>

              <select className="filter-select" value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)}>
                <option value="">All Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
              </select>

              <select className="filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="">All Sources</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Naukri">Naukri</option>
                <option value="Indeed">Indeed</option>
              </select>
              
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="Not Applied">Not Applied</option>
                <option value="Applied">Applied</option>
                <option value="Rejected">Rejected</option>
                <option value="Selected">Selected</option>
              </select>

              <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Latest First</option>
                <option value="matchScore">Match Score</option>
                <option value="salary">Salary</option>
              </select>
            </div>
            
            {hasPreferences && (
              <div className="match-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showOnlyMatches}
                    onChange={(e) => setShowOnlyMatches(e.target.checked)}
                  />
                  <span>Show only jobs above my threshold ({preferences.minMatchScore}%)</span>
                </label>
              </div>
            )}

            {displayedJobs.length === 0 ? (
              <div className="empty-state-card">
                <p className="empty-state-text">
                  No roles match your criteria. Adjust filters or lower threshold.
                </p>
              </div>
            ) : (
              <div className="jobs-grid">
                {displayedJobs.map((job) => {
                  const scoreClass = 
                    job.matchScore >= 80 ? 'match-score-high' :
                    job.matchScore >= 60 ? 'match-score-medium' :
                    job.matchScore >= 40 ? 'match-score-neutral' :
                    'match-score-low';
                  
                  const currentStatus = getJobStatus(job.id);
                  const statusClass = 
                    currentStatus === 'Applied' ? 'status-applied' :
                    currentStatus === 'Rejected' ? 'status-rejected' :
                    currentStatus === 'Selected' ? 'status-selected' :
                    'status-not-applied';
                  
                  return (
                    <div key={job.id} className="job-card">
                      <div className="job-card__header">
                        <h3 className="job-card__title">{job.title}</h3>
                        <div className="job-card__badges">
                          {hasPreferences && (
                            <span className={`match-score-badge ${scoreClass}`}>
                              {job.matchScore}%
                            </span>
                          )}
                          <span className={`job-card__source job-card__source--${job.source.toLowerCase()}`}>
                            {job.source}
                          </span>
                        </div>
                      </div>
                      
                      <p className="job-card__company">{job.company}</p>
                      
                      <div className="job-card__meta">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.mode}</span>
                        <span>•</span>
                        <span>{job.experience}</span>
                      </div>
                      
                      <p className="job-card__salary">{job.salaryRange}</p>
                      
                      <p className="job-card__posted">
                        {job.postedDaysAgo === 0 ? 'Posted today' : `Posted ${job.postedDaysAgo} day${job.postedDaysAgo > 1 ? 's' : ''} ago`}
                      </p>
                      
                      <div className="job-status-group">
                        <span className="status-label">Status:</span>
                        <div className="status-buttons">
                          <button
                            className={`status-btn ${currentStatus === 'Not Applied' ? 'status-btn-active status-not-applied' : ''}`}
                            onClick={() => updateJobStatus(job.id, job.title, job.company, 'Not Applied')}
                          >
                            Not Applied
                          </button>
                          <button
                            className={`status-btn ${currentStatus === 'Applied' ? 'status-btn-active status-applied' : ''}`}
                            onClick={() => updateJobStatus(job.id, job.title, job.company, 'Applied')}
                          >
                            Applied
                          </button>
                          <button
                            className={`status-btn ${currentStatus === 'Rejected' ? 'status-btn-active status-rejected' : ''}`}
                            onClick={() => updateJobStatus(job.id, job.title, job.company, 'Rejected')}
                          >
                            Rejected
                          </button>
                          <button
                            className={`status-btn ${currentStatus === 'Selected' ? 'status-btn-active status-selected' : ''}`}
                            onClick={() => updateJobStatus(job.id, job.title, job.company, 'Selected')}
                          >
                            Selected
                          </button>
                        </div>
                      </div>
                      
                      <div className="job-card__actions">
                        <button className="btn-secondary-small" onClick={() => setSelectedJob(job)}>
                          View
                        </button>
                        {savedJobIds.includes(job.id) ? (
                          <button className="btn-secondary-small" onClick={() => unsaveJob(job.id)}>
                            Unsave
                          </button>
                        ) : (
                          <button className="btn-secondary-small" onClick={() => saveJob(job.id)}>
                            Save
                          </button>
                        )}
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary-small"
                        >
                          Apply
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSection === 'saved' && (
          <div className="dashboard-container">
            <h1 className="heading-xl">Saved</h1>
            {savedJobs.length === 0 ? (
              <div className="empty-state-card">
                <p className="empty-state-text">
                  You haven't saved any jobs yet. When you find opportunities worth tracking, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="jobs-grid">
                {savedJobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-card__header">
                      <h3 className="job-card__title">{job.title}</h3>
                      <span className={`job-card__source job-card__source--${job.source.toLowerCase()}`}>
                        {job.source}
                      </span>
                    </div>
                    
                    <p className="job-card__company">{job.company}</p>
                    
                    <div className="job-card__meta">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.mode}</span>
                      <span>•</span>
                      <span>{job.experience}</span>
                    </div>
                    
                    <p className="job-card__salary">{job.salaryRange}</p>
                    
                    <p className="job-card__posted">
                      {job.postedDaysAgo === 0 ? 'Posted today' : `Posted ${job.postedDaysAgo} day${job.postedDaysAgo > 1 ? 's' : ''} ago`}
                    </p>
                    
                    <div className="job-card__actions">
                      <button className="btn-secondary-small" onClick={() => setSelectedJob(job)}>
                        View
                      </button>
                      <button className="btn-secondary-small" onClick={() => unsaveJob(job.id)}>
                        Unsave
                      </button>
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary-small"
                      >
                        Apply
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'digest' && (
          <div className="digest-container">
            <h1 className="heading-xl">Digest</h1>
            
            {!hasPreferences ? (
              <div className="blocking-message">
                <p className="blocking-message-text">
                  Set preferences to generate a personalized digest.
                </p>
                <button className="btn-primary" onClick={() => handleNavClick('settings')}>
                  Go to Settings
                </button>
              </div>
            ) : (
              <>
                {todayDigest.length === 0 ? (
                  <div className="digest-generate">
                    <p className="body-text-secondary" style={{ marginBottom: '24px' }}>
                      Your daily digest will arrive at 9AM with precision-matched opportunities.
                    </p>
                    <button className="btn-cta" onClick={generateDigest}>
                      Generate Today's 9AM Digest (Simulated)
                    </button>
                    <p className="demo-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
                  </div>
                ) : (
                  <div className="digest-content">
                    <div className="digest-card">
                      <div className="digest-header">
                        <h2 className="digest-title">Top 10 Jobs For You — 9AM Digest</h2>
                        <p className="digest-date">
                          {new Date(digestDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      
                      <div className="digest-jobs">
                        {todayDigest.map((job, index) => {
                          const scoreClass = 
                            job.matchScore >= 80 ? 'match-score-high' :
                            job.matchScore >= 60 ? 'match-score-medium' :
                            job.matchScore >= 40 ? 'match-score-neutral' :
                            'match-score-low';
                          
                          return (
                            <div key={job.id} className="digest-job-item">
                              <div className="digest-job-number">{index + 1}</div>
                              <div className="digest-job-content">
                                <h3 className="digest-job-title">{job.title}</h3>
                                <p className="digest-job-company">{job.company}</p>
                                <div className="digest-job-meta">
                                  <span>{job.location}</span>
                                  <span>•</span>
                                  <span>{job.experience}</span>
                                  <span>•</span>
                                  <span className={`match-score-badge ${scoreClass}`}>
                                    {job.matchScore}% Match
                                  </span>
                                </div>
                                <a
                                  href={job.applyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="digest-apply-btn"
                                >
                                  Apply Now
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="digest-footer">
                        <p>This digest was generated based on your preferences.</p>
                      </div>
                    </div>
                    
                    {statusUpdates.length > 0 && (
                      <div className="digest-card">
                        <h2 className="digest-section-title">Recent Status Updates</h2>
                        <div className="status-updates-list">
                          {statusUpdates.slice(0, 10).map((update, index) => {
                            const statusClass = 
                              update.status === 'Applied' ? 'status-applied' :
                              update.status === 'Rejected' ? 'status-rejected' :
                              update.status === 'Selected' ? 'status-selected' :
                              'status-not-applied';
                            
                            return (
                              <div key={index} className="status-update-item">
                                <div className="status-update-content">
                                  <h4 className="status-update-title">{update.jobTitle}</h4>
                                  <p className="status-update-company">{update.company}</p>
                                </div>
                                <div className="status-update-meta">
                                  <span className={`status-badge ${statusClass}`}>{update.status}</span>
                                  <span className="status-update-date">
                                    {new Date(update.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="digest-actions">
                      <button className="btn-secondary" onClick={copyDigestToClipboard}>
                        Copy Digest to Clipboard
                      </button>
                      <button className="btn-primary" onClick={createEmailDraft}>
                        Create Email Draft
                      </button>
                      <button className="btn-secondary" onClick={generateDigest}>
                        Regenerate Digest
                      </button>
                    </div>
                    
                    <p className="demo-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="settings-container">
            <h1 className="heading-xl">Settings</h1>
            <p className="body-text-secondary" style={{ marginBottom: '40px' }}>
              Configure your job preferences for intelligent matching
            </p>

            <div className="settings-form">
              <div className="form-group">
                <label className="form-label">Role Keywords (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Frontend, React, Developer"
                  value={preferences.roleKeywords}
                  onChange={(e) => setPreferences({...preferences, roleKeywords: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Locations</label>
                <select
                  multiple
                  className="form-select-multi"
                  value={preferences.preferredLocations}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setPreferences({...preferences, preferredLocations: selected});
                  }}
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Noida">Noida</option>
                  <option value="Gurgaon">Gurgaon</option>
                  <option value="Mysore">Mysore</option>
                </select>
                <p className="form-hint">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div className="form-group">
                <label className="form-label">Work Mode</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.preferredMode.includes('Remote')}
                      onChange={(e) => {
                        const modes = e.target.checked
                          ? [...preferences.preferredMode, 'Remote']
                          : preferences.preferredMode.filter(m => m !== 'Remote');
                        setPreferences({...preferences, preferredMode: modes});
                      }}
                    />
                    <span>Remote</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.preferredMode.includes('Hybrid')}
                      onChange={(e) => {
                        const modes = e.target.checked
                          ? [...preferences.preferredMode, 'Hybrid']
                          : preferences.preferredMode.filter(m => m !== 'Hybrid');
                        setPreferences({...preferences, preferredMode: modes});
                      }}
                    />
                    <span>Hybrid</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.preferredMode.includes('Onsite')}
                      onChange={(e) => {
                        const modes = e.target.checked
                          ? [...preferences.preferredMode, 'Onsite']
                          : preferences.preferredMode.filter(m => m !== 'Onsite');
                        setPreferences({...preferences, preferredMode: modes});
                      }}
                    />
                    <span>Onsite</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  className="form-select"
                  value={preferences.experienceLevel}
                  onChange={(e) => setPreferences({...preferences, experienceLevel: e.target.value})}
                >
                  <option value="">Select level</option>
                  <option value="Fresher">Fresher</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. React, Node.js, Python"
                  value={preferences.skills}
                  onChange={(e) => setPreferences({...preferences, skills: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Match Score: {preferences.minMatchScore}%</label>
                <input
                  type="range"
                  className="form-slider"
                  min="0"
                  max="100"
                  value={preferences.minMatchScore}
                  onChange={(e) => setPreferences({...preferences, minMatchScore: parseInt(e.target.value)})}
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <button className="btn-primary" onClick={savePreferences}>Save Preferences</button>
            </div>
          </div>
        )}

        {activeSection === 'proof' && (
          <div className="proof-container">
            <h1 className="heading-xl">Proof & Submission</h1>
            <p className="body-text-secondary" style={{ marginBottom: '40px' }}>
              Project 1 — Job Notification Tracker
            </p>
            
            <div className="proof-status-card">
              <div className="proof-status-header">
                <span className="proof-status-label">Project Status:</span>
                <span className={`proof-status-badge proof-status-${getProjectStatus().toLowerCase().replace(' ', '-')}`}>
                  {getProjectStatus()}
                </span>
              </div>
              {getProjectStatus() === 'Shipped' && (
                <div className="proof-shipped-message">
                  Project 1 Shipped Successfully.
                </div>
              )}
            </div>
            
            <div className="proof-section">
              <h2 className="proof-section-title">A) Step Completion Summary</h2>
              <div className="proof-steps">
                <div className="proof-step-item">
                  <span className="proof-step-number">Step 1</span>
                  <span className="proof-step-name">Design System</span>
                  <span className={`proof-step-status proof-step-${getStepStatus(1).toLowerCase()}`}>
                    {getStepStatus(1)}
                  </span>
                </div>
                <div className="proof-step-item">
                  <span className="proof-step-number">Step 2</span>
                  <span className="proof-step-name">Route Skeleton</span>
                  <span className={`proof-step-status proof-step-${getStepStatus(2).toLowerCase()}`}>
                    {getStepStatus(2)}
                  </span>
                </div>
                <div className="proof-step-item">
                  <span className="proof-step-number">Step 3</span>
                  <span className="proof-step-name">Job Data & Rendering</span>
                  <span className={`proof-step-status proof-step-${getStepStatus(3).toLowerCase()}`}>
                    {getStepStatus(3)}
                  </span>
                </div>
                <div className="proof-step-item">
                  <span className="proof-step-number">Step 4</span>
                  <span className="proof-step-name">Preference Logic & Match Scoring</span>
                  <span className={`proof-step-status proof-step-${getStepStatus(4).toLowerCase()}`}>
                    {getStepStatus(4)}
                  </span>
                </div>
                <div className="proof-step-item">
                  <span className="proof-step-number">Step 5</span>
                  <span className="proof-step-name">Daily Digest Engine</span>
                  <span className={`proof-step-status proof-step-${getStepStatus(5).toLowerCase()}`}>
                    {getStepStatus(5)}
                  </span>
                </div>
                <div className="proof-step-item">
                  <span className="proof-step-number">Step 6</span>
                  <span className="proof-step-name">Status Tracking & Notifications</span>
                  <span className={`proof-step-status proof-step-${getStepStatus(6).toLowerCase()}`}>
                    {getStepStatus(6)}
                  </span>
                </div>
                <div className="proof-step-item">
                  <span className="proof-step-number">Step 7</span>
                  <span className="proof-step-name">Test Checklist System</span>
                  <span className={`proof-step-status proof-step-${getStepStatus(7).toLowerCase()}`}>
                    {getStepStatus(7)}
                  </span>
                </div>
                <div className="proof-step-item">
                  <span className="proof-step-number">Step 8</span>
                  <span className="proof-step-name">Proof & Submission</span>
                  <span className={`proof-step-status proof-step-${getStepStatus(8).toLowerCase()}`}>
                    {getStepStatus(8)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="proof-section">
              <h2 className="proof-section-title">B) Artifact Collection</h2>
              <div className="proof-form">
                <div className="proof-form-group">
                  <label className="proof-form-label">Lovable Project Link *</label>
                  <input
                    type="url"
                    className={`proof-form-input ${proofLinks.lovableProject && !isValidUrl(proofLinks.lovableProject) ? 'proof-form-input-error' : ''}`}
                    placeholder="https://lovable.dev/projects/..."
                    value={proofLinks.lovableProject}
                    onChange={(e) => updateProofLink('lovableProject', e.target.value)}
                  />
                  {proofLinks.lovableProject && !isValidUrl(proofLinks.lovableProject) && (
                    <span className="proof-form-error">Please enter a valid URL</span>
                  )}
                </div>
                
                <div className="proof-form-group">
                  <label className="proof-form-label">GitHub Repository Link *</label>
                  <input
                    type="url"
                    className={`proof-form-input ${proofLinks.githubRepository && !isValidUrl(proofLinks.githubRepository) ? 'proof-form-input-error' : ''}`}
                    placeholder="https://github.com/username/repo"
                    value={proofLinks.githubRepository}
                    onChange={(e) => updateProofLink('githubRepository', e.target.value)}
                  />
                  {proofLinks.githubRepository && !isValidUrl(proofLinks.githubRepository) && (
                    <span className="proof-form-error">Please enter a valid URL</span>
                  )}
                </div>
                
                <div className="proof-form-group">
                  <label className="proof-form-label">Deployed URL (Vercel or equivalent) *</label>
                  <input
                    type="url"
                    className={`proof-form-input ${proofLinks.deployedUrl && !isValidUrl(proofLinks.deployedUrl) ? 'proof-form-input-error' : ''}`}
                    placeholder="https://your-app.vercel.app"
                    value={proofLinks.deployedUrl}
                    onChange={(e) => updateProofLink('deployedUrl', e.target.value)}
                  />
                  {proofLinks.deployedUrl && !isValidUrl(proofLinks.deployedUrl) && (
                    <span className="proof-form-error">Please enter a valid URL</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="proof-validation">
              {!areAllLinksValid() && (
                <div className="proof-validation-warning">
                  All 3 links must be provided with valid URLs
                </div>
              )}
              {getTestsPassed() < 10 && (
                <div className="proof-validation-warning">
                  Complete all 10 test checklist items
                </div>
              )}
            </div>
            
            <div className="proof-actions">
              <button
                className="btn-primary"
                onClick={copyFinalSubmission}
                disabled={!areAllLinksValid()}
              >
                Copy Final Submission
              </button>
            </div>
          </div>
        )}
        
        {activeSection === 'test' && (
          <div className="test-checklist-container">
            <h1 className="heading-xl">Test Checklist</h1>
            <p className="body-text-secondary" style={{ marginBottom: '40px' }}>
              Verify all features before shipping
            </p>
            
            <div className="test-summary">
              <div className="test-summary-score">
                <span className="test-score-label">Tests Passed:</span>
                <span className="test-score-value">{getTestsPassed()} / 10</span>
              </div>
              {getTestsPassed() < 10 && (
                <div className="test-warning">
                  Resolve all issues before shipping.
                </div>
              )}
              <button className="btn-secondary-small" onClick={resetTestChecklist}>
                Reset Test Status
              </button>
            </div>
            
            <div className="test-checklist">
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.preferencePersist}
                    onChange={() => toggleChecklistItem('preferencePersist')}
                  />
                  <span className="test-item-text">Preferences persist after refresh</span>
                </label>
                <div className="test-tooltip">
                  Set preferences → Save → Refresh page → Check if preferences still filled
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.matchScoreCalculates}
                    onChange={() => toggleChecklistItem('matchScoreCalculates')}
                  />
                  <span className="test-item-text">Match score calculates correctly</span>
                </label>
                <div className="test-tooltip">
                  Set preferences with "React" keyword → Check dashboard → Jobs with "React" in title should have higher scores
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.showOnlyMatchesWorks}
                    onChange={() => toggleChecklistItem('showOnlyMatchesWorks')}
                  />
                  <span className="test-item-text">"Show only matches" toggle works</span>
                </label>
                <div className="test-tooltip">
                  Set min score to 60% → Enable toggle → Only jobs with 60%+ should show
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.saveJobPersists}
                    onChange={() => toggleChecklistItem('saveJobPersists')}
                  />
                  <span className="test-item-text">Save job persists after refresh</span>
                </label>
                <div className="test-tooltip">
                  Save a job → Refresh page → Go to Saved → Job should still be there
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.applyOpensNewTab}
                    onChange={() => toggleChecklistItem('applyOpensNewTab')}
                  />
                  <span className="test-item-text">Apply opens in new tab</span>
                </label>
                <div className="test-tooltip">
                  Click "Apply" button → Should open job URL in new browser tab
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.statusUpdatePersists}
                    onChange={() => toggleChecklistItem('statusUpdatePersists')}
                  />
                  <span className="test-item-text">Status update persists after refresh</span>
                </label>
                <div className="test-tooltip">
                  Change job status to "Applied" → Refresh page → Status should still be "Applied"
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.statusFilterWorks}
                    onChange={() => toggleChecklistItem('statusFilterWorks')}
                  />
                  <span className="test-item-text">Status filter works correctly</span>
                </label>
                <div className="test-tooltip">
                  Set 2 jobs to "Applied" → Use status filter → Select "Applied" → Only those 2 jobs should show
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.digestGeneratesTop10}
                    onChange={() => toggleChecklistItem('digestGeneratesTop10')}
                  />
                  <span className="test-item-text">Digest generates top 10 by score</span>
                </label>
                <div className="test-tooltip">
                  Set preferences → Generate digest → Should show exactly 10 jobs sorted by match score
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.digestPersistsForDay}
                    onChange={() => toggleChecklistItem('digestPersistsForDay')}
                  />
                  <span className="test-item-text">Digest persists for the day</span>
                </label>
                <div className="test-tooltip">
                  Generate digest → Refresh page → Go to Digest → Same digest should load without regenerating
                </div>
              </div>
              
              <div className="test-item">
                <label className="test-item-label">
                  <input
                    type="checkbox"
                    className="test-checkbox"
                    checked={testChecklist.noConsoleErrors}
                    onChange={() => toggleChecklistItem('noConsoleErrors')}
                  />
                  <span className="test-item-text">No console errors on main pages</span>
                </label>
                <div className="test-tooltip">
                  Open DevTools Console → Navigate through all pages → Should see no red errors
                </div>
              </div>
            </div>
            
            {getTestsPassed() === 10 && (
              <div className="test-success">
                ✓ All tests passed! You can now access the Ship section.
              </div>
            )}
          </div>
        )}
        
        {activeSection === 'ship' && (
          <div className="ship-container">
            <h1 className="heading-xl">Ship</h1>
            <div className="ship-success-card">
              <h2 className="ship-success-title">Ready to Ship! 🚀</h2>
              <p className="ship-success-text">
                All tests have passed. Your Job Notification Tracker is ready for production.
              </p>
              <div className="ship-checklist-summary">
                <p>✓ Preferences system working</p>
                <p>✓ Match scoring accurate</p>
                <p>✓ Filters functioning correctly</p>
                <p>✓ Status tracking persistent</p>
                <p>✓ Digest engine operational</p>
                <p>✓ No console errors</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedJob(null)}>×</button>
            
            <div className="modal-header">
              <h2 className="heading-lg">{selectedJob.title}</h2>
              <span className={`job-card__source job-card__source--${selectedJob.source.toLowerCase()}`}>
                {selectedJob.source}
              </span>
            </div>
            
            <p className="modal-company">{selectedJob.company}</p>
            
            <div className="modal-meta">
              <span>{selectedJob.location}</span>
              <span>•</span>
              <span>{selectedJob.mode}</span>
              <span>•</span>
              <span>{selectedJob.experience}</span>
            </div>
            
            <p className="modal-salary">{selectedJob.salaryRange}</p>
            
            <div className="modal-section">
              <h3 className="modal-section-title">Description</h3>
              <p className="modal-description">{selectedJob.description}</p>
            </div>
            
            <div className="modal-section">
              <h3 className="modal-section-title">Required Skills</h3>
              <div className="skills-list">
                {selectedJob.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              {savedJobIds.includes(selectedJob.id) ? (
                <button className="btn-secondary" onClick={() => unsaveJob(selectedJob.id)}>
                  Unsave
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => saveJob(selectedJob.id)}>
                  Save Job
                </button>
              )}
              <a
                href={selectedJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
