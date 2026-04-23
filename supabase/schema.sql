-- ============================================
-- Unimak Public Health Portal - Supabase Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Resources table (Library)
CREATE TABLE IF NOT EXISTS resources (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Notes', 'Exam')),
  year TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT
);

-- 2. Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 0
);

-- 3. Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Resources: Public read, admin write
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read resources"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (true);

-- Team Members: Public read, admin write
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read team"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can manage team"
  ON team_members FOR ALL
  TO authenticated
  USING (true);

-- Contact Messages: Only authenticated can read
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can read contacts"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- Storage bucket for resource files
-- ============================================
-- In Supabase Dashboard > Storage, create a bucket named: resources
-- Set it to PUBLIC so download links work.

-- STORAGE POLICIES (Run these if uploads fail)
-- --------------------------------------------
/*
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Authenticated users can update resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resources');

CREATE POLICY "Authenticated users can delete resources"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources');

CREATE POLICY "Public access to resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');
*/

-- ============================================
-- Sample data (optional)
-- ============================================
INSERT INTO resources (title, type, year, category, file_url, file_name) VALUES
  ('Introduction to Epidemiology Notes', 'Notes', 'Year 1', 'SEMESTER 1', '#', 'epi_intro.pdf'),
  ('Public Health Exam Paper 2024', 'Exam', 'Year 2', 'SEMESTER 2', '#', 'ph_exam_2024.pdf');
