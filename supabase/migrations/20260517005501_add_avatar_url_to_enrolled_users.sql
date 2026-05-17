-- Add avatar_url column to enrolled_users
ALTER TABLE enrolled_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
