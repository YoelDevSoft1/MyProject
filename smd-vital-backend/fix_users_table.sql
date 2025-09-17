-- Fix users table schema for Google OAuth
-- Add missing columns for Google OAuth integration

-- Connect to the auth database
\c smdvital_auth;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Make password_hash nullable for Google OAuth users (who don't have passwords)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Update existing users to have default values
UPDATE users SET 
    first_name = COALESCE(first_name, ''),
    last_name = COALESCE(last_name, ''),
    email_verified = COALESCE(email_verified, FALSE)
WHERE first_name IS NULL OR last_name IS NULL OR email_verified IS NULL;

-- Show the updated table structure
\d users;
