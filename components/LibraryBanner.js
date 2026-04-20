'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function LibraryBanner() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      padding: '4rem 0',
      color: 'white',
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '2rem',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '1.5rem',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <BookOpen size={40} />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem' }}>
            📚 Public Health Library
          </h2>
          <p style={{ opacity: 0.85, fontSize: '1rem' }}>
            Access academic notes, past exam papers, and course materials uploaded by your society.
          </p>
        </div>
        <Link href="/library" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'white',
          color: 'var(--primary)',
          padding: '0.9rem 2rem',
          borderRadius: '0.75rem',
          fontWeight: 700,
          fontSize: '1rem',
          textDecoration: 'none',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: 'var(--transition)',
        }}>
          Open Library <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
