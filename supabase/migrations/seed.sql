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

-- 3. Create a ROBUST function to handle new user sign-ups.
-- This function is now idempotent and safer for seeding.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to avoid errors if a profile for the user already exists.
  -- This makes the seeding process much more reliable.
  INSERT INTO public.profiles (id, role, approval_status)
  VALUES (
    new.id, 
    (COALESCE(new.raw_user_meta_data->>'role', 'general_public'))::public.user_role,
    -- Automatically approve general public users, others are pending by default.
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


-- 4. Create helper functions to check roles (FIX for RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'); END; $$;

CREATE OR REPLACE FUNCTION public.is_logistics()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'logistics'); END; $$;


-- 5. Enable RLS and define policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 6. RPC function for admins to fetch pending wholesale buyers
CREATE OR REPLACE FUNCTION get_pending_wholesale_buyers()
RETURNS TABLE(id uuid, email text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'User is not an admin'; END IF;
    RETURN QUERY SELECT p.id, u.email FROM public.profiles p JOIN auth.users u ON p.id = u.id WHERE p.role = 'wholesale_buyer' AND p.approval_status = 'pending';
END;
$$;

-- New RPC function for admin to fetch logistics staff
CREATE OR REPLACE FUNCTION get_logistics_staff()
RETURNS TABLE(id uuid, email text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'User is not an admin'; END IF;
    RETURN QUERY SELECT p.id, u.email FROM public.profiles p JOIN auth.users u ON p.id = u.id WHERE p.role = 'logistics';
END;
$$;


-- =================================================================
-- PRODUCT CATALOG SCHEMA (UPGRADED for Wholesale)
-- =================================================================
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (id bigserial PRIMARY KEY, name text NOT NULL, description text, image_url text);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


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
    wholesale_display_unit TEXT -- NEW: Column for wholesale unit description
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TABLE IF EXISTS public.related_products CASCADE;
CREATE TABLE public.related_products ( product_id_1 bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, product_id_2 bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, PRIMARY KEY (product_id_1, product_id_2), CONSTRAINT check_different_products CHECK (product_id_1 <> product_id_2) );
ALTER TABLE public.related_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read related products" ON public.related_products FOR SELECT USING (true);

-- =================================================================
-- ORDER MANAGEMENT SCHEMA (UPGRADED)
-- =================================================================

-- 11. Create Order Status Enum (NEW)
DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('ORDER_RECEIVED', 'ORDER_ACKNOWLEDGED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');


-- 12. Create Orders Table (UPGRADED)
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    status public.order_status NOT NULL DEFAULT 'ORDER_RECEIVED',
    total_price numeric(10, 2) NOT NULL,
    discount_applied numeric(10, 2) DEFAULT 0.00,
    delivery_address jsonb NOT NULL,
    customer_details jsonb NOT NULL
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own orders" ON public.orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins or Logistics can view all orders" ON public.orders FOR SELECT USING (public.is_admin() or public.is_logistics());
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 13. Create Order Items Table (Unchanged)
DROP TABLE IF EXISTS public.order_items CASCADE;
CREATE TABLE public.order_items ( id bigserial PRIMARY KEY, order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE, product_id bigint NOT NULL REFERENCES public.products(id), quantity integer NOT NULL, unit_price numeric(10, 2) NOT NULL );
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own order items" ON public.order_items FOR ALL USING ( EXISTS ( SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid() ) );
CREATE POLICY "Admins/Logistics can view all order items" ON public.order_items FOR SELECT USING (public.is_admin() or public.is_logistics());

-- =================================================================
-- LOGISTICS & TRACKING SCHEMA (NEW)
-- =================================================================

-- 14. Create Order Status History Table (FIXED)
DROP TABLE IF EXISTS public.order_status_history CASCADE;
CREATE TABLE public.order_status_history (
    id bigserial PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status public.order_status NOT NULL,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id), -- FIX: References auth.users(id) directly for robustness
    note text
);
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order history" ON public.order_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins/Logistics can view all order history" ON public.order_status_history FOR SELECT USING (public.is_admin() or public.is_logistics());


-- 15. Create Logistics Assignments Table (NEW)
DROP TABLE IF EXISTS public.logistics_assignments CASCADE;
CREATE TABLE public.logistics_assignments (
    id bigserial PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
    logistics_user_id uuid NOT NULL REFERENCES public.profiles(id),
    assigned_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.logistics_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own assignments" ON public.logistics_assignments FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = logistics_assignments.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins/Logistics can manage assignments" ON public.logistics_assignments FOR ALL USING (public.is_admin() or public.is_logistics());


-- =================================================================
-- PAYMENT, INVOICE, RECEIPT SCHEMA (Mostly Unchanged)
-- =================================================================
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
CREATE TYPE public.payment_method AS ENUM ('online', 'pay_on_delivery');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'pay_on_delivery', 'awaiting_confirmation');

DROP TABLE IF EXISTS public.payments CASCADE;
CREATE TABLE public.payments ( id bigserial PRIMARY KEY, order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE, payment_method public.payment_method NOT NULL, payment_status public.payment_status NOT NULL DEFAULT 'pending', reference text, amount numeric(10, 2) NOT NULL, verified_at timestamp with time zone, created_at timestamp with time zone NOT NULL DEFAULT now() );
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own payments" ON public.payments FOR ALL USING ( EXISTS ( SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid() ) );
CREATE POLICY "Admins/Logistics can view all payments" ON public.payments FOR SELECT USING (public.is_admin() or public.is_logistics());

DROP TYPE IF EXISTS public.invoice_status CASCADE;
CREATE TYPE public.invoice_status AS ENUM ('draft', 'locked');
DROP TABLE IF EXISTS public.invoices CASCADE;
CREATE TABLE public.invoices ( id bigserial PRIMARY KEY, invoice_number text NOT NULL UNIQUE, order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE, user_id uuid NOT NULL REFERENCES auth.users(id), status public.invoice_status NOT NULL DEFAULT 'draft', invoice_data jsonb NOT NULL, pdf_storage_path text, created_at timestamp with time zone NOT NULL DEFAULT now() );
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins/Logistics can view all invoices" ON public.invoices FOR SELECT USING (public.is_admin() or public.is_logistics());

DROP TABLE IF EXISTS public.receipts CASCADE;
CREATE TABLE public.receipts ( id bigserial PRIMARY KEY, receipt_number text NOT NULL UNIQUE, payment_id bigint NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE UNIQUE, order_id bigint NOT NULL REFERENCES public.orders(id), user_id uuid NOT NULL REFERENCES auth.users(id), receipt_data jsonb NOT NULL, pdf_storage_path text, created_at timestamp with time zone NOT NULL DEFAULT now() );
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own receipts" ON public.receipts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins/Logistics can view all receipts" ON public.receipts FOR SELECT USING (public.is_admin() or public.is_logistics());

-- =================================================================
-- DATABASE TRIGGERS & FUNCTIONS
-- =================================================================

-- 22. Trigger Function to create initial status history entry
CREATE OR REPLACE FUNCTION public.log_initial_order_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.order_status_history (order_id, status, updated_by)
    VALUES (NEW.id, NEW.status, NEW.user_id);
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_order_created_log_status ON public.orders;
CREATE TRIGGER on_order_created_log_status AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_initial_order_status();


-- 23. Proforma Invoice Trigger (Unchanged)
CREATE OR REPLACE FUNCTION public.create_proforma_invoice()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE items_json jsonb; invoice_data_json jsonb; delivery_fee numeric := 500;
BEGIN
    SELECT jsonb_agg(jsonb_build_object('product_name', p.name, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'line_total', oi.quantity * oi.unit_price)) INTO items_json FROM public.order_items oi JOIN public.products p ON oi.product_id = p.id WHERE oi.order_id = NEW.id;
    invoice_data_json := jsonb_build_object('buyerDetails', jsonb_build_object('deliveryAddress', NEW.delivery_address, 'customerDetails', NEW.customer_details), 'items', items_json, 'pricing', jsonb_build_object('subtotal', NEW.total_price - delivery_fee + NEW.discount_applied, 'discount_applied', NEW.discount_applied, 'delivery_fee', delivery_fee, 'total_price', NEW.total_price));
    INSERT INTO public.invoices (invoice_number, order_id, user_id, status, invoice_data) VALUES ('INV-' || to_char(NEW.created_at, 'YYYYMMDD') || '-' || NEW.id, NEW.id, NEW.user_id, 'draft', invoice_data_json);
    RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_order_created_create_invoice ON public.orders;
CREATE TRIGGER on_order_created_create_invoice AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.create_proforma_invoice();


-- 24. Receipt & Invoice Lock Trigger (Unchanged)
CREATE OR REPLACE FUNCTION public.create_payment_receipt_and_lock_invoice()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE order_details record; invoice_details record; receipt_data_json jsonb;
BEGIN
    IF NEW.payment_status = 'paid' THEN
        SELECT * INTO order_details FROM public.orders WHERE id = NEW.order_id;
        SELECT * INTO invoice_details FROM public.invoices WHERE order_id = NEW.order_id;
        receipt_data_json := jsonb_build_object('buyerDetails', jsonb_build_object('deliveryAddress', order_details.delivery_address, 'customerDetails', order_details.customer_details), 'paymentDetails', jsonb_build_object('payment_method', NEW.payment_method, 'amount_paid', NEW.amount, 'verified_at', NEW.verified_at), 'relatedInvoiceNumber', invoice_details.invoice_number);
        INSERT INTO public.receipts (receipt_number, payment_id, order_id, user_id, receipt_data) VALUES ('RCPT-' || to_char(NEW.verified_at, 'YYYYMMDD') || '-' || NEW.id, NEW.id, NEW.order_id, order_details.user_id, receipt_data_json);
        UPDATE public.invoices SET status = 'locked' WHERE id = invoice_details.id;
    END IF;
    RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_payment_paid_create_receipt ON public.payments;
CREATE TRIGGER on_payment_paid_create_receipt AFTER UPDATE OF payment_status ON public.payments FOR EACH ROW WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'paid') EXECUTE FUNCTION public.create_payment_receipt_and_lock_invoice();


-- =================================================================
-- SECURE RPC FUNCTIONS FOR STATUS UPDATES (NEW)
-- =================================================================

-- 25. RPC for Admin to acknowledge and assign an order
CREATE OR REPLACE FUNCTION acknowledge_and_assign_order(p_order_id bigint, p_logistics_user_id uuid, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    current_status public.order_status;
    admin_id uuid := auth.uid();
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Permission denied: User is not an admin.'; END IF;

    SELECT status INTO current_status FROM public.orders WHERE id = p_order_id;
    IF current_status != 'ORDER_RECEIVED' THEN RAISE EXCEPTION 'Order cannot be acknowledged. Current status is %', current_status; END IF;
    
    -- Check payment status
    IF NOT EXISTS (SELECT 1 FROM public.payments WHERE order_id = p_order_id AND (payment_status = 'paid' OR payment_status = 'pay_on_delivery')) THEN
        RAISE EXCEPTION 'Cannot process order: Payment not confirmed.';
    END IF;

    -- Update 1: Acknowledge
    UPDATE public.orders SET status = 'ORDER_ACKNOWLEDGED' WHERE id = p_order_id;
    INSERT INTO public.order_status_history (order_id, status, updated_by, note) VALUES (p_order_id, 'ORDER_ACKNOWLEDGED', admin_id, 'Order acknowledged by admin.');

    -- Assign to logistics
    INSERT INTO public.logistics_assignments (order_id, logistics_user_id) VALUES (p_order_id, p_logistics_user_id);

    -- Update 2: Move to Processing
    UPDATE public.orders SET status = 'PROCESSING' WHERE id = p_order_id;
    INSERT INTO public.order_status_history (order_id, status, updated_by, note) VALUES (p_order_id, 'PROCESSING', admin_id, p_note);
END;
$$;


-- 26. RPC for Logistics to update order status
CREATE OR REPLACE FUNCTION update_order_status_by_logistics(p_order_id bigint, p_new_status public.order_status, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    current_status public.order_status;
    logistics_id uuid := auth.uid();
    is_assigned boolean;
BEGIN
    IF NOT public.is_logistics() THEN RAISE EXCEPTION 'Permission denied: User is not logistics staff.'; END IF;
    
    -- Check if this logistics user is assigned to this order
    SELECT EXISTS (SELECT 1 FROM public.logistics_assignments WHERE order_id = p_order_id AND logistics_user_id = logistics_id) INTO is_assigned;
    IF NOT is_assigned THEN RAISE EXCEPTION 'Permission denied: You are not assigned to this order.'; END IF;

    SELECT status INTO current_status FROM public.orders WHERE id = p_order_id;

    -- Enforce sequential status updates
    IF (current_status = 'PROCESSING' AND p_new_status = 'DISPATCHED') OR
       (current_status = 'DISPATCHED' AND p_new_status = 'IN_TRANSIT') OR
       (current_status = 'IN_TRANSIT' AND p_new_status = 'DELIVERED')
    THEN
        UPDATE public.orders SET status = p_new_status WHERE id = p_order_id;
        INSERT INTO public.order_status_history (order_id, status, updated_by, note) VALUES (p_order_id, p_new_status, logistics_id, p_note);
    ELSE
        RAISE EXCEPTION 'Invalid status transition from % to %.', current_status, p_new_status;
    END IF;
END;
$$;


-- =================================================================
-- SEED DATA
-- =================================================================
-- Seed Categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Pain Relief', 'Medications to alleviate various types of pain.', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768841164/Painrelief-removebg-preview_g5uapx.png'),
('Vitamins & Supplements', 'Products to supplement your diet and support overall health.', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768841163/vit_premovebg-preview_xljooq.png'),
('Allergy & Hay Fever', 'Relief from seasonal and perennial allergy symptoms.', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768841165/allergymain-removebg-preview_xfjzyx.png'),
('Digestive Health', 'Aids for indigestion, heartburn, and other digestive issues.', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768841163/digestive-removebg-preview_cjabvu.png'),
('Cough, Cold & Flu', 'Remedies for common respiratory illnesses.', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768841163/cough-removebg-preview_eojqan.png');

-- Seed Products with Wholesale Units
INSERT INTO public.products (name, description, category_id, dosage, prices, min_order_quantity, stock_status, image_url, wholesale_display_unit) VALUES
('Paracetamol', 'Effective relief from pain and fever. Suitable for adults and children over 12 years.', 1, '500mg, 16 tablets', '{"retail": 1500, "wholesale_tiers": [{"min_quantity": 20, "price": 1200}, {"min_quantity": 100, "price": 1050}]}', 20, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png', 'Pack of 16 tablets'),
('Ibuprofen', 'Anti-inflammatory tablets for relief from rheumatic and muscular pain.', 1, '200mg, 16 tablets', '{"retail": 2200, "wholesale_tiers": [{"min_quantity": 20, "price": 1800}, {"min_quantity": 100, "price": 1650}]}', 20, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png', 'Pack of 16 tablets'),
('Vitamin C Effervescent', 'High-strength Vitamin C to support your immune system.', 2, '1000mg, 20 tablets', '{"retail": 3500, "wholesale_tiers": [{"min_quantity": 10, "price": 3000}, {"min_quantity": 50, "price": 2750}]}', 10, 'low_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr10_ogxr0t.png', 'Tube of 20 tablets'),
('Cetirizine Hydrochloride', 'Provides fast and effective 24-hour relief from hay fever and other allergy symptoms.', 3, '10mg, 30 tablets', '{"retail": 4000, "wholesale_tiers": [{"min_quantity": 10, "price": 3500}, {"min_quantity": 50, "price": 3200}]}', 10, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819815/pr8_x30k6m.png', 'Box of 30 tablets'),
('Gaviscon Double Action', 'Effective relief from heartburn and indigestion.', 4, '300ml Liquid', '{"retail": 6500, "wholesale_tiers": [{"min_quantity": 5, "price": 6000}, {"min_quantity": 20, "price": 5500}]}', 5, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr2_b8czjp.png', '300ml Bottle'),
('Benylin Chesty Coughs', 'A soothing syrup to help relieve chesty coughs.', 5, '150ml Syrup', '{"retail": 5200, "wholesale_tiers": [{"min_quantity": 10, "price": 4800}, {"min_quantity": 40, "price": 4500}]}', 10, 'out_of_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819811/pr1_lqysgq.png', '150ml Bottle'),
('Amoxicillin', 'A broad-spectrum antibiotic for treating bacterial infections. Prescription required.', 1, '500mg, 21 capsules', '{"retail": 4800, "wholesale_tiers": [{"min_quantity": 15, "price": 4200}, {"min_quantity": 60, "price": 3900}]}', 15, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819814/pr7_bmyz5o.png', 'Pack of 21 capsules'),
('Loratadine', 'Non-drowsy antihistamine for allergy relief.', 3, '10mg, 30 tablets', '{"retail": 3800, "wholesale_tiers": [{"min_quantity": 10, "price": 3300}, {"min_quantity": 50, "price": 3000}]}', 10, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr3_mwhz27.png', 'Box of 30 tablets'),
('Omeprazole', 'Reduces stomach acid. Used to treat indigestion, heartburn and acid reflux.', 4, '20mg, 14 capsules', '{"retail": 5500, "wholesale_tiers": [{"min_quantity": 10, "price": 5000}, {"min_quantity": 40, "price": 4600}]}', 10, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819811/pr5_j7qjmw.png', 'Pack of 14 capsules'),
('Folic Acid', 'A Vitamin B supplement essential for cell growth, often recommended during pregnancy.', 2, '5mg, 28 tablets', '{"retail": 1200, "wholesale_tiers": [{"min_quantity": 50, "price": 950}, {"min_quantity": 200, "price": 800}]}', 50, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819811/pr4_xndkqv.png', 'Pack of 28 tablets');


-- =================================================================
-- SEED TEST USERS & PROFILES (RELIABLE METHOD)
-- Password for all users is: password123
-- =================================================================

-- Step 1: Clean up previous test users to ensure a fresh start.
-- This is critical for avoiding conflicts and ensuring the seed script is re-runnable.
DELETE FROM auth.users WHERE email IN (
    'admin@kingzy.com',
    'logistics@kingzy.com',
    'wholesale@kingzy.com',
    'pending.wholesale@kingzy.com',
    'buyer@kingzy.com'
);

-- Step 2: Insert users into the `auth.users` table.
-- The robust `handle_new_user` trigger will now automatically create their profiles.
-- We no longer need to manually insert into `public.profiles`.
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, email_change, email_change_sent_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@kingzy.com', '$2b$10$w2k.1.s2i/B8Z7l0qgZ9QeWPlAR2.ZXf5jQ8P3B.f5xS5r.zB6xYm', now(), '', now(), now(), '{"provider":"email","providers":["email"]}', '{"role": "admin"}', false, now(), now(), null, null, '', null),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'logistics@kingzy.com', '$2b$10$w2k.1.s2i/B8Z7l0qgZ9QeWPlAR2.ZXf5jQ8P3B.f5xS5r.zB6xYm', now(), '', now(), now(), '{"provider":"email","providers":["email"]}', '{"role": "logistics"}', false, now(), now(), null, null, '', null),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'wholesale@kingzy.com', '$2b$10$w2k.1.s2i/B8Z7l0qgZ9QeWPlAR2.ZXf5jQ8P3B.f5xS5r.zB6xYm', now(), '', now(), now(), '{"provider":"email","providers":["email"]}', '{"role": "wholesale_buyer"}', false, now(), now(), null, null, '', null),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pending.wholesale@kingzy.com', '$2b$10$w2k.1.s2i/B8Z7l0qgZ9QeWPlAR2.ZXf5jQ8P3B.f5xS5r.zB6xYm', now(), '', now(), now(), '{"provider":"email","providers":["email"]}', '{"role": "wholesale_buyer"}', false, now(), now(), null, null, '', null),
    ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'buyer@kingzy.com', '$2b$10$w2k.1.s2i/B8Z7l0qgZ9QeWPlAR2.ZXf5jQ8P3B.f5xS5r.zB6xYm', now(), '', now(), now(), '{"provider":"email","providers":["email"]}', '{"role": "general_public"}', false, now(), now(), null, null, '', null)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Explicitly set approval status for specific test users.
-- The trigger handles the initial creation, and this step overrides the status for testing purposes.
UPDATE public.profiles SET approval_status = 'approved' WHERE id = '00000000-0000-0000-0000-000000000001'; -- admin
UPDATE public.profiles SET approval_status = 'approved' WHERE id = '00000000-0000-0000-0000-000000000002'; -- logistics
UPDATE public.profiles SET approval_status = 'approved' WHERE id = '00000000-0000-0000-0000-000000000003'; -- wholesale (approved)
UPDATE public.profiles SET approval_status = 'pending' WHERE id = '00000000-0000-0000-0000-000000000004'; -- wholesale (pending)