'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/saved', label: 'Saved' },
  { href: '/digest', label: 'Digest' },
  { href: '/settings', label: 'Settings' },
  { href: '/proof', label: 'Proof' },
];

export const JobTrackerNav: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
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
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href} className="job-tracker-nav__item">
              <Link
                href={link.href}
                className={`job-tracker-nav__link ${isActive ? 'job-tracker-nav__link--active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
