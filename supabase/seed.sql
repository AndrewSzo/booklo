-- Create test data for e2e tests
-- Note: Users should be created through the application's registration process

-- Create some tags for testing
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;

INSERT INTO tags (name) VALUES
  ('Fiction'),
  ('Classic'),
  ('Science Fiction'),
  ('Fantasy'),
  ('Drama'),
  ('Adventure'),
  ('Romance'),
  ('Mystery'),
  ('Biography'),
  ('History')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create helper functions for tests
CREATE OR REPLACE FUNCTION setup_test_user_data(user_id UUID)
RETURNS void AS $$
BEGIN
  -- This function can be called by tests to set up user data after user is created
  -- For now, just a placeholder
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a helper function to check if user exists
CREATE OR REPLACE FUNCTION create_test_user_if_not_exists(email_param TEXT, password_param TEXT)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to find existing user
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = email_param;
    
    -- If user doesn't exist, return null (tests should create user through registration)
    IF user_id IS NULL THEN
        RAISE NOTICE 'User % not found. Test should create this user through registration.', email_param;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Refresh materialized views if they exist
DO $$
BEGIN
  -- Refresh user reading stats
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'user_reading_stats') THEN
    REFRESH MATERIALIZED VIEW user_reading_stats;
  END IF;
  
  -- Refresh book popularity stats  
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'book_popularity_stats') THEN
    REFRESH MATERIALIZED VIEW book_popularity_stats;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if views don't exist yet
    NULL;
END $$; 