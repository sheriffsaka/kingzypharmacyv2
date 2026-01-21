-- 1. Create custom types for roles and status
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.approval_status CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'wholesale_buyer', 'general_public', 'logistics');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create the profiles table with loyalty discount
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NULL DEFAULT now(),
  role public.user_role NOT NULL DEFAULT 'general_public'::public.user_role,
  approval_status public.approval_status NOT NULL DEFAULT 'pending'::public.approval_status,
  loyalty_discount_percentage numeric(5, 2) DEFAULT 0.00, -- e.g., 5.50 for 5.50%
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- 3. Create a function to handle new user sign-ups.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, role, approval_status)
  VALUES (
    new.id, 
    (COALESCE(new.raw_user_meta_data->>'role', 'general_public'))::public.user_role,
    CASE 
      WHEN (COALESCE(new.raw_user_meta_data->>'role', 'general_public')) = 'general_public' THEN 'approved'::public.approval_status
      ELSE 'pending'::public.approval_status
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable RLS and define policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON public.profiles FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->'user_metadata'->>'role' = 'admin');


-- =================================================================
-- PRODUCT CATALOG SCHEMA (STRUCTURE ONLY)
-- =================================================================
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (id bigserial PRIMARY KEY, name text NOT NULL, description text, image_url text);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->'user_metadata'->>'role' = 'admin');

DROP TYPE IF EXISTS public.stock_status CASCADE;
CREATE TYPE public.stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');

DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE public.products ( 
    id bigserial PRIMARY KEY, 
    name text NOT NULL, 
    description text NOT NULL, 
    category_id bigint REFERENCES public.categories(id), 
    dosage text, 
    prices jsonb NOT NULL, 
    min_order_quantity integer DEFAULT 1, 
    stock_status public.stock_status NOT NULL DEFAULT 'in_stock', 
    image_url text,
    wholesale_display_unit TEXT
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->'user_metadata'->>'role' = 'admin');

DROP TABLE IF EXISTS public.related_products CASCADE;
CREATE TABLE public.related_products ( product_id_1 bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, product_id_2 bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, PRIMARY KEY (product_id_1, product_id_2), CONSTRAINT check_different_products CHECK (product_id_1 <> product_id_2) );
ALTER TABLE public.related_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read related products" ON public.related_products FOR SELECT USING (true);


-- =================================================================
-- ORDER & PAYMENT SCHEMA
-- =================================================================
DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('ORDER_RECEIVED', 'ORDER_ACKNOWLEDGED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders ( id bigserial PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id), created_at timestamp with time zone NOT NULL DEFAULT now(), status public.order_status NOT NULL DEFAULT 'ORDER_RECEIVED', total_price numeric(10, 2) NOT NULL, discount_applied numeric(10, 2) DEFAULT 0.00, delivery_address jsonb NOT NULL, customer_details jsonb NOT NULL );
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own orders" ON public.orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins or Logistics can view all orders" ON public.orders FOR SELECT USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->'user_metadata'->>'role' = 'admin' OR auth.jwt()->'user_metadata'->>'role' = 'logistics');

DROP TABLE IF EXISTS public.order_items CASCADE;
CREATE TABLE public.order_items ( id bigserial PRIMARY KEY, order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE, product_id bigint NOT NULL REFERENCES public.products(id), quantity integer NOT NULL, unit_price numeric(10, 2) NOT NULL );
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own order items" ON public.order_items FOR ALL USING ( EXISTS ( SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid() ) );
CREATE POLICY "Admins/Logistics can view all order items" ON public.order_items FOR SELECT USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->'user_metadata'->>'role' = 'admin' OR auth.jwt()->'user_metadata'->>'role' = 'logistics');

DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
CREATE TYPE public.payment_method AS ENUM ('online', 'pay_on_delivery');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'pay_on_delivery', 'awaiting_confirmation');
DROP TABLE IF EXISTS public.payments CASCADE;
CREATE TABLE public.payments ( id bigserial PRIMARY KEY, order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE, payment_method public.payment_method NOT NULL, payment_status public.payment_status NOT NULL DEFAULT 'pending', reference text, amount numeric(10, 2) NOT NULL, verified_at timestamp with time zone, created_at timestamp with time zone NOT NULL DEFAULT now() );
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own payments" ON public.payments FOR ALL USING ( EXISTS ( SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid() ) );
CREATE POLICY "Admins/Logistics can view all payments" ON public.payments FOR SELECT USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->'user_metadata'->>'role' = 'admin' OR auth.jwt()->'user_metadata'->>'role' = 'logistics');

-- ... Rest of schema definitions for invoices, receipts, logistics etc.
-- For brevity in this response, the full schema is assumed to be present.
