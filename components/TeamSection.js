'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import s from '@/app/sections.module.css';

const colors = ['#003D7A', '#00A3AD', '#1E5AA0', '#005f8a', '#0077B6', '#023E8A', '#0096C7'];

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function TeamSection() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setTeam(data || []);
    } catch (err) {
      console.error('Error fetching team:', err.message);
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <div className={s.loadingGhost}>Loading executives...</div>
          ) : team.length === 0 ? (
            <div className={s.emptyState}>Check back soon for our executive team!</div>
          ) : (
            team.map((member, i) => (
              <div key={member.id || member.name} className={s.memberCard}>
                <div className={s.memberAvatar} style={{ 
                  background: colors[i % colors.length],
                  backgroundImage: member.image_url ? `url(${member.image_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  {!member.image_url && getInitials(member.name)}
                </div>
                <div className={s.memberInfo}>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
                <div className={s.memberNumber}>0{i + 1}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
