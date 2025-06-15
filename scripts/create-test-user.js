const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('Creating test user with email: test@test.com');
    console.log('Using Supabase URL:', supabaseUrl);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@test.com',
      password: 'Test12!@',
      email_confirm: true
    });
    
    if (error) {
      console.error('Error creating test user:', error.message);
      // Don't exit with error if user already exists
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        console.log('Test user already exists - this is OK');
        return;
      }
      process.exit(1);
    } else {
      console.log('Test user created successfully:', data.user.email);
      console.log('User ID:', data.user.id);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createTestUser();