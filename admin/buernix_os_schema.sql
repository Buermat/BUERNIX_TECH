-- BUERNIX OS: Enterprise Database Schema
-- Version 2.0 (Evolution from Basic Admin)

-- 1️⃣ RBAC & PROFILES (The Backbone)
-- Extends the auth.users to store role and region data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin', -- 'super_admin', 'admin', 'manager', 'sales', 'editor'
  region TEXT DEFAULT 'global', -- 'uae', 'ghana', 'global'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admins view all" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- 2️⃣ CMS SYSTEM (Blog & Pages)
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT, -- HTML/Markdown content
  excerpt TEXT,
  featured_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id),
  author_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'scheduled'
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3️⃣ CRM CORE (Clients & Deals)
CREATE TABLE IF NOT EXISTS public.crm_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  industry TEXT,
  region TEXT DEFAULT 'uae', -- 'uae', 'ghana'
  status TEXT DEFAULT 'lead', -- 'lead', 'prospect', 'active', 'churned'
  total_value DECIMAL(10,2) DEFAULT 0,
  assigned_to UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value DECIMAL(10,2) DEFAULT 0,
  stage TEXT DEFAULT 'new', -- 'new', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'note', 'call', 'email', 'meeting'
  content TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4️⃣ OPERATIONS (Quotes & Bookings)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number SERIAL,
  client_id UUID REFERENCES public.crm_clients(id),
  title TEXT,
  items JSONB, -- Array of {description, qty, price}
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'AED', -- 'AED', 'GHS', 'USD'
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'approved', 'rejected'
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5️⃣ ANALYTICS (Internal)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'form_submit'
  page_path TEXT,
  source TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Simplified for Admin Panel Access)
-- Allow authenticated users (staff) to do everything for now
-- In a real enterprise setup, we would filter by role permissions here
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff Full Access Posts" ON public.blog_posts FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff Full Access Clients" ON public.crm_clients FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff Full Access Deals" ON public.crm_deals FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff Full Access Activities" ON public.crm_activities FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff Full Access Quotes" ON public.quotes FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff View Analytics" ON public.analytics_events FOR SELECT USING (auth.role() = 'authenticated');
-- Allow public insert for analytics (for the frontend tracker)
CREATE POLICY "Public Insert Analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Functions
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_modtime
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_clients_modtime
    BEFORE UPDATE ON public.crm_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6️⃣ TEAM & RBAC (The Staff Directory)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  bio TEXT,
  photo_url TEXT,
  permissions JSONB DEFAULT '{}', -- Format: { "cms": "write", "crm": "read", "analytics": "none" }
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Team
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff Full Access Team" ON public.team_members FOR ALL USING (auth.role() = 'authenticated');
