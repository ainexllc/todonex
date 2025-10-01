'use client';

import React from 'react';

interface HeroSectionV2Props {
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

export default function HeroSectionV2({ authMode, setAuthMode }: HeroSectionV2Props) {
  const scrollToAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    const authSection = document.getElementById('auth-section');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1
          className="font-bold text-foreground mb-6"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}
        >
          Organize Your Life with AI
        </h1>

        {/* Subheadline */}
        <p
          className="text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ fontSize: 'clamp(1.125rem, 3vw, 1.5rem)' }}
        >
          Smart task management powered by AI. Simple, beautiful, effective.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary Button - Get Started */}
          <button
            onClick={() => scrollToAuth('signup')}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}
          >
            Get Started Free
          </button>

          {/* Secondary Button - Sign In */}
          <button
            onClick={() => scrollToAuth('signin')}
            className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-all duration-200 border border-border"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
}
