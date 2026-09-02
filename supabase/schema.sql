-- ==============================================================================
-- DELIVERY EXPRESS DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Branding: "Your first choice in delivery. Anything, Anywhere!"
-- Operating Hours: 8:00 AM - 2:00 AM
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'rider', 'admin', 'dispatcher');
CREATE TYPE service_category AS ENUM (
    'food_delivery',
    'pasabuy',
    'cake_flower',
    'medicine_delivery',
    'parcel_pickup_dropoff',
    'bills_payment',
    'general_errands',
    'market_mall_kumpra',
    'documents_transport'
);
CREATE TYPE order_status AS ENUM (
    'pending',
    'assigned',
    'heading_to_pickup',
    'at_pickup_purchasing',
    'out_for_delivery',
    'delivered',
    'cancelled'
);
CREATE TYPE payment_mode AS ENUM ('cash_on_delivery', 'gcash', 'maya', 'bank_transfer');

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RIDERS TABLE
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    motorcycle_plate TEXT,
    is_online BOOLEAN DEFAULT TRUE,
    is_busy BOOLEAN DEFAULT FALSE,
    current_lat NUMERIC,
    current_lng NUMERIC,
    rating NUMERIC DEFAULT 5.0,
    total_completed_trips INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SERVICES & RATES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    base_fare NUMERIC NOT NULL DEFAULT 50.00,
    per_km_rate NUMERIC NOT NULL DEFAULT 12.00,
    errand_fee NUMERIC DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number TEXT UNIQUE NOT NULL,
    service_id TEXT REFERENCES public.services(id),
    service_type service_category NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Location & Delivery Details
    pickup_address TEXT NOT NULL,
    pickup_landmark TEXT,
    pickup_lat NUMERIC,
    pickup_lng NUMERIC,
    
    dropoff_address TEXT NOT NULL,
    dropoff_landmark TEXT,
    dropoff_lat NUMERIC,
    dropoff_lng NUMERIC,
    
    distance_km NUMERIC DEFAULT 3.5,
    estimated_fare NUMERIC NOT NULL,
    item_estimated_cost NUMERIC DEFAULT 0.00,
    payment_method payment_mode DEFAULT 'cash_on_delivery',
    is_paid BOOLEAN DEFAULT FALSE,
    
    -- Specific Errand Details (JSON for flexibility: shopping list, prescription image, fragile cake flags, etc.)
    details JSONB DEFAULT '{}'::jsonb,
    customer_notes TEXT,
    
    -- Assignment & Status
    status order_status DEFAULT 'pending',
    rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
    
    -- Media & Proof
    receipt_url TEXT,
    proof_of_delivery_url TEXT,
    delivery_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REALTIME ENABLEMENT
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read on services
CREATE POLICY "Public services are viewable by everyone" ON public.services FOR SELECT USING (true);

-- Allow public insert and read on orders (for guest/direct bookings)
CREATE POLICY "Orders are viewable by everyone" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders can be created by everyone" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders can be updated by authenticated/riders/admins" ON public.orders FOR UPDATE USING (true);

-- Allow riders read and location updates
CREATE POLICY "Riders are viewable by everyone" ON public.riders FOR SELECT USING (true);
CREATE POLICY "Riders can update their status" ON public.riders FOR UPDATE USING (true);

-- 9. SEED DATA FOR SERVICES (9 Delivery Express Services)
INSERT INTO public.services (id, name, icon, description, base_fare, per_km_rate, errand_fee) VALUES
('food_delivery', 'Food Delivery', 'Utensils', 'Restaurant takeout, fast food, and local eateries pick-up & doorstep drop-off.', 50.00, 10.00, 15.00),
('pasabuy', 'Pasabuy Service', 'ShoppingBag', 'Shopping errands on your behalf at convenience stores, bakeries, or specialty shops.', 60.00, 12.00, 30.00),
('cake_flower', 'Cake / Flower Delivery', 'Gift', 'Fragile & delicate care transport for cakes, pastries, flower bouquets, and surprise gifts.', 75.00, 15.00, 20.00),
('medicine_delivery', 'Medicine Delivery', 'Pill', 'Pharmacy purchase & prescription pickup from Mercury Drug, Southstar, Watsons, etc.', 55.00, 10.00, 20.00),
('parcel_pickup_dropoff', 'Pick up & Drop off Parcels', 'Package', 'Fast point-to-point courier for personal items, packages, online orders, and retail boxes.', 50.00, 10.00, 10.00),
('bills_payment', 'Bills Payment', 'Receipt', 'Avoid long lines. Our riders queue and pay electricity, water, internet, and government dues.', 70.00, 12.00, 35.00),
('general_errands', 'General Errands', 'Zap', 'Custom tasks, item pickup/return, dry cleaning, queuing, key retrieval, and odd jobs.', 60.00, 12.00, 25.00),
('market_mall_kumpra', 'Market & Mall Kumpra', 'Store', 'Heavy & bulk wet market (palengke) and department store grocery shopping with itemized list.', 80.00, 15.00, 50.00),
('documents_transport', 'Documents Transport', 'FileText', 'Secure, tamper-proof and confidential delivery for legal, bank, corporate, or school papers.', 55.00, 10.00, 15.00)
ON CONFLICT (id) DO NOTHING;
