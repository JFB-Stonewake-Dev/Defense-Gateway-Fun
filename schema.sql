-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roblox_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  main_group_rank INT DEFAULT 0,
  police_group_rank INT DEFAULT 0,
  qualifications JSONB DEFAULT '[]'::jsonb,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is disabled or set up correctly (for this prototype we'll just use service role / direct db for backend routes)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.disciplinary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  type TEXT NOT NULL,
  description TEXT,
  issued_by UUID REFERENCES public.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.disciplinary_records DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.armoury_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  weapon_kit JSONB,
  auth_reason TEXT,
  ammo INT,
  status TEXT,
  date_out TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_in TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.armoury_ledger DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.operations_map_plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_x INT NOT NULL,
  grid_y INT NOT NULL,
  identity TEXT,
  asset_type TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);
ALTER TABLE public.operations_map_plots DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.watch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type TEXT,
  description TEXT,
  priority BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.watch_logs DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suspect_roblox_user TEXT,
  offense TEXT,
  grid_location TEXT,
  issuing_officer UUID REFERENCES public.users(id),
  narrative TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.incident_reports DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.asset_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT UNIQUE NOT NULL,
  type TEXT,
  current_status TEXT
);
ALTER TABLE public.asset_ledger DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.asset_signout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_ledger_id UUID REFERENCES public.asset_ledger(id),
  crew TEXT,
  task TEXT,
  etr TEXT,
  status_out TEXT,
  status_in TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.asset_signout DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.intsum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  author UUID REFERENCES public.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.intsum_posts DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.mission_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_leader UUID REFERENCES public.users(id),
  outcome TEXT,
  grid_contacts TEXT,
  enemy_cas INT,
  friendly_ammo INT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.mission_reports DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.intel_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  accessed_item_type TEXT,
  accessed_item_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.intel_access_logs DISABLE ROW LEVEL SECURITY;
