'use client';

import { GraduationCap, Microscope, CheckCircle } from 'lucide-react';
import s from '@/app/sections.module.css';

export default function AboutSection() {
  return (
    <section id="about" className={s.aboutSection}>
      <div className="container">
        <div className={s.sectionHeader}>
          <span className={s.sectionTag}>Our Program</span>
          <h2 className={s.sectionTitle}>About Public Health – UNIMAK</h2>
          <p className={s.sectionSubtitle}>
            The Public Health BSc (Hons) program at the University of Makeni is a four-year degree 
            that includes coursework, dissertation writing, and an internship.
          </p>
        </div>

        <div className={s.aboutGrid}>
          <div>
            <p className={s.aboutText}>
              The program is structured into two major areas. In the second year, students have the opportunity 
              to specialize in distinct tracks, equipping them with essential skills and knowledge relevant 
              to both epidemiology and the public health laboratory sector.
            </p>
            <div className={s.aboutHighlights}>
              {[
                'Four-year BSc (Hons) Degree',
                'Choose a specialization in Year 2',
                'Dissertation & Internship Included',
                'Highly skilled faculty & researchers',
              ].map((item) => (
                <div key={item} className={s.highlightItem}>
                  <CheckCircle size={20} className={s.checkIcon} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.specCards}>
            <div className={s.specCard}>
              <div className={s.specIconWrap}>
                <GraduationCap size={36} />
              </div>
              <h3>Public Health Epidemiology</h3>
              <p>
                Focus on disease surveillance, population health, environmental factors, and data-driven 
                health interventions at the community and national level.
              </p>
              <div className={s.specBadge}>Specialization Track 1</div>
            </div>

            <div className={`${s.specCard} ${s.specCardLab}`}>
              <div className={`${s.specIconWrap} ${s.labIcon}`}>
                <Microscope size={36} />
              </div>
              <h3>Public Health Laboratory Sciences</h3>
              <p>
                Master laboratory techniques for diagnostics, microbiology, biostatistics, 
                and cutting-edge research methodologies in public health.
              </p>
              <div className={`${s.specBadge} ${s.labBadge}`}>Specialization Track 2</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
