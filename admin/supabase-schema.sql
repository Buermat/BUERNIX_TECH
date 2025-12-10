-- BUERNIX TECH Database Schema for Supabase
-- Run this in Supabase SQL Editor after creating your project

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  link TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. SERVICES TABLE (Future use)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TEAM MEMBERS TABLE (Future use)
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. MESSAGES TABLE (Future use)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES - PROJECTS
-- ============================================

-- Allow authenticated users (admin) full access
CREATE POLICY "Authenticated users can do everything on projects"
ON projects
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public (website visitors) to read projects
CREATE POLICY "Public read access to projects"
ON projects
FOR SELECT
TO anon
USING (true);

-- ============================================
-- 7. RLS POLICIES - SERVICES
-- ============================================

CREATE POLICY "Authenticated users can manage services"
ON services
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can read visible services"
ON services
FOR SELECT
TO anon
USING (visible = true);

-- ============================================
-- 8. RLS POLICIES - TEAM MEMBERS
-- ============================================

CREATE POLICY "Authenticated users can manage team"
ON team_members
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can read team members"
ON team_members
FOR SELECT
TO anon
USING (true);

-- ============================================
-- 9. RLS POLICIES - MESSAGES
-- ============================================

CREATE POLICY "Authenticated users can read messages"
ON messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update messages"
ON messages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete messages"
ON messages
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert messages"
ON messages
FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_services_visible ON services(visible);
CREATE INDEX IF NOT EXISTS idx_services_order ON services(order_index);
CREATE INDEX IF NOT EXISTS idx_team_order ON team_members(order_index);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ============================================
-- 11. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. ATTACH TRIGGERS
-- ============================================

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_updated_at
BEFORE UPDATE ON team_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Your database is ready.
-- ============================================

-- Next steps:
-- 1. Go to Storage in Supabase dashboard
-- 2. Create a new bucket called "project-images"
-- 3. Make it public
-- 4. Set policies to allow authenticated uploads
