const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const teamMembers = [
  { name: 'Ibrahim Joseph Kamara', role: 'President', image: '/images/unimak (2).jpeg' },
  { name: 'Sorie Ibrahim Conteh', role: 'Vice President', image: '/images/unimak (3).jpeg' },
  { name: 'Mariama Turay', role: 'Secretary General', image: '/images/unimak (4).jpeg' },
  { name: 'Abdul Rahman Bangura', role: 'Financial Secretary', image: '/images/unimak (5).jpeg' },
  { name: 'Fatimatou Bah', role: 'Welfare Officer', image: '/images/unimak (6).jpeg' },
  { name: 'Mohamed Alpha Jalloh', role: 'Public Relations Officer', image: '/images/unimak (7).jpeg' },
  { name: 'Alice Koroma', role: 'Auditor', image: '/images/unimak (8).jpeg' },
  { name: 'Abu Bakarr Sesay', role: 'Organizing Secretary', image: '/images/unimak (9).jpeg' },
];

async function seedTeam() {
  console.log('Seeding team members...');
  
  // First, clear existing team (optional, but good for consistent demo)
  // const { error: deleteError } = await supabase.from('team_members').delete().neq('id', 0);
  // if (deleteError) console.error('Error clearing team:', deleteError.message);

  for (let i = 0; i < teamMembers.length; i++) {
    const member = teamMembers[i];
    const { error } = await supabase.from('team_members').insert([{
      name: member.name,
      role: member.role,
      image_url: member.image,
      display_order: i
    }]);

    if (error) {
      console.error(`Error inserting ${member.name}:`, error.message);
    } else {
      console.log(`Successfully added ${member.name}`);
    }
  }

  console.log('Seeding complete!');
}

seedTeam();
