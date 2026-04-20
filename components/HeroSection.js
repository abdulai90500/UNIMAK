'use client';

import { BookOpen, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import s from '@/app/sections.module.css';

export default function HeroSection() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className={s.heroSection}>
      <div className={s.heroBg}>
        <div className={`${s.blob} ${s.blob1}`} />
        <div className={`${s.blob} ${s.blob2}`} />
        <div className={`${s.blob} ${s.blob3}`} />
        <div className={s.gridOverlay} />
      </div>

      <div className={`container ${s.heroContainer}`}>
        <div className={s.heroBadge}>
          <span className={s.badgeDot} />
          University of Makeni — Public Health Society
        </div>

        <h1 className={s.heroTitle}>
          Welcome to the <br />
          <span className={s.textGradient}>Public Health Portal</span>
        </h1>

        <p className={s.heroSubtitle}>
          Your hub for academic notes, exam resources, and career guidance at UNIMAK
        </p>

        <div className={s.heroCta}>
          <Link href="/library" className={s.ctaPrimary}>
            <BookOpen size={20} />
            Browse Library
          </Link>
          <a href="#about" className={s.ctaOutline} onClick={(e) => { e.preventDefault(); scrollToAbout(); }}>
            Learn More
          </a>
        </div>

        <div className={s.heroStats}>
          <div className={s.statCard}>
            <span className={s.statNumber}>4+</span>
            <span className={s.statLabel}>Year Program</span>
          </div>
          <div className={s.statDivider} />
          <div className={s.statCard}>
            <span className={s.statNumber}>2</span>
            <span className={s.statLabel}>Specializations</span>
          </div>
          <div className={s.statDivider} />
          <div className={s.statCard}>
            <span className={s.statNumber}>15+</span>
            <span className={s.statLabel}>Career Paths</span>
          </div>
        </div>
      </div>

      <button className={s.scrollIndicator} onClick={scrollToAbout}>
        <ChevronDown size={24} />
      </button>
    </section>
  );
}
