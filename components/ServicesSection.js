'use client';

import { BarChart2, FlaskConical, ArrowRight } from 'lucide-react';
import s from '@/app/sections.module.css';

const epidemiologyRoles = [
  'Public Health Consultant','Epidemiologist','Researcher','Health Services Manager',
  'Health Promotion Officer','Health Educator Officer','Surveillance Officer',
  'Environmental Health Officer','Public Health Researcher',
  'Monitoring & Evaluation (M&E) Officer','Occupational Health & Safety Officer',
  'WASH Officer (Water, Sanitation & Hygiene)',
];

const labRoles = [
  'Public Health Laboratory Scientist','Laboratory Director','Microbiologist',
  'Research Scientist','Epidemiologist','Biostatistician',
  'Clinical Laboratory Scientist','Laboratory Research Lead',
];

export default function ServicesSection() {
  return (
    <section id="services" className={s.servicesSection}>
      <div className="container">
        <div className={s.sectionHeader}>
          <span className={s.sectionTag}>Career Paths</span>
          <h2 className={s.sectionTitle}>Services & Career Opportunities</h2>
          <p className={s.sectionSubtitle}>
            Graduates of the UNIMAK Public Health program are prepared for a wide range of 
            impactful careers in the health sector across Sierra Leone and beyond.
          </p>
        </div>

        <div className={s.servicesGrid}>
          <div className={s.serviceCard}>
            <div className={s.serviceHeader}>
              <div className={s.serviceIcon}><BarChart2 size={32} /></div>
              <div>
                <h3>Public Health Epidemiology</h3>
                <p>Population health & disease surveillance</p>
              </div>
            </div>
            <ul className={s.rolesList}>
              {epidemiologyRoles.map((role) => (
                <li key={role} className={s.roleItem}>
                  <ArrowRight size={16} className={s.roleArrow} />{role}
                </li>
              ))}
              <li className={`${s.roleItem} ${s.roleMore}`}>
                <ArrowRight size={16} className={s.roleArrow} />And other related roles
              </li>
            </ul>
          </div>

          <div className={s.serviceCard}>
            <div className={`${s.serviceHeader} ${s.labHeader}`}>
              <div className={s.serviceIcon}><FlaskConical size={32} /></div>
              <div>
                <h3>Public Health Laboratory</h3>
                <p>Diagnostics, research & technology</p>
              </div>
            </div>
            <ul className={s.rolesList}>
              {labRoles.map((role) => (
                <li key={role} className={s.roleItem}>
                  <ArrowRight size={16} className={`${s.roleArrow} ${s.labArrow}`} />{role}
                </li>
              ))}
              <li className={`${s.roleItem} ${s.roleMore}`}>
                <ArrowRight size={16} className={`${s.roleArrow} ${s.labArrow}`} />And other related roles
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
