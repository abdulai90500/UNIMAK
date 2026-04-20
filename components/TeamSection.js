'use client';

import s from '@/app/sections.module.css';

const teamMembers = [
  { name: 'Ibrahim Joseph Kamara', role: 'President', initials: 'IK' },
  { name: 'MABINTY MANSARAY', role: 'Vice President', initials: 'MM' },
  { name: 'Simeon Sallieu Kanu', role: 'Secretary General', initials: 'SK' },
  { name: 'Mariama Turay', role: 'Public Relations Officer', initials: 'MT' },
  { name: 'Jeffinatu A. Turay', role: 'Organising Secretary', initials: 'JT' },
  { name: 'Massah Jina Kamara', role: 'Financial Secretary', initials: 'MK' },
  { name: 'Maimouna Yahya Jalloh', role: 'Chief Minister', initials: 'MY' },
];

const colors = ['#003D7A','#00A3AD','#1E5AA0','#005f8a','#0077B6','#023E8A','#0096C7'];

export default function TeamSection() {
  return (
    <section id="team" className={s.teamSection}>
      <div className="container">
        <div className={s.sectionHeader}>
          <span className={s.sectionTag}>Our Leadership</span>
          <h2 className={s.sectionTitle}>Public Health Society – Executive Members</h2>
          <p className={s.sectionSubtitle}>
            Meet the dedicated leaders driving the UNIMAK Public Health Society forward.
          </p>
        </div>

        <div className={s.teamGrid}>
          {teamMembers.map((member, i) => (
            <div key={member.name} className={s.memberCard}>
              <div className={s.memberAvatar} style={{ background: colors[i % colors.length] }}>
                {member.initials}
              </div>
              <div className={s.memberInfo}>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
              <div className={s.memberNumber}>0{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
