const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log(`Creating/Updating admin: ${adminEmail}...`);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Admin user already exists. Updating password...');
      // Find user by email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      const user = users.users.find(u => u.email === adminEmail);
      
      if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: adminPassword
        });
        if (updateError) console.error('Error updating password:', updateError.message);
        else console.log('Password updated successfully!');
      }
    } else {
      console.error('Error creating admin:', error.message);
    }
  } else {
    console.log('Admin user created successfully!');
  }
}

createAdmin();
