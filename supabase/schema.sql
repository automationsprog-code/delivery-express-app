-- Delivery Express Comprehensive Supabase Schema & Realtime Sync

CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  gcash_name TEXT DEFAULT 'DELIVERY EXPRESS BALAMBAN',
  gcash_number TEXT DEFAULT '0917-882-1923',
  gcash_qr_url TEXT,
  maya_name TEXT DEFAULT 'DELIVERY EXPRESS',
  maya_number TEXT DEFAULT '0928-441-9012',
  maya_qr_url TEXT,
  operating_hours_display TEXT DEFAULT '8:00 AM - 2:00 AM Daily',
  services_rates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.riders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  plate TEXT NOT NULL,
  zone TEXT NOT NULL,
  municipality TEXT DEFAULT 'Balamban',
  avatar TEXT,
  password_hash TEXT,
  rating NUMERIC DEFAULT 5.0,
  trips INT DEFAULT 0,
  is_online BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  lat NUMERIC DEFAULT 10.5015,
  lng NUMERIC DEFAULT 123.7150,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  pickup_address TEXT NOT NULL,
  pickup_landmark TEXT,
  pickup_lat NUMERIC,
  pickup_lng NUMERIC,
  dropoff_address TEXT NOT NULL,
  dropoff_landmark TEXT,
  dropoff_lat NUMERIC,
  dropoff_lng NUMERIC,
  distance_km NUMERIC,
  estimated_fare NUMERIC,
  item_cost NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash on Delivery',
  status TEXT DEFAULT 'pending',
  status_text TEXT,
  rider_id TEXT REFERENCES public.riders(id) ON DELETE SET NULL,
  rider_name TEXT,
  rider_phone TEXT,
  details JSONB,
  customer_notes TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  logs JSONB DEFAULT '[]'::jsonb,
  proof_of_delivery_url TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Realtime Broadcast
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read App Settings" ON public.app_settings;
CREATE POLICY "Public Read App Settings" ON public.app_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Riders" ON public.riders;
CREATE POLICY "Public Read Riders" ON public.riders FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR ALL USING (true);

-- Enable Realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;