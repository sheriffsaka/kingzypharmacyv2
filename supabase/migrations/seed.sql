
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

-- 3. Create a function to handle new user sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, (COALESCE(new.raw_user_meta_data->>'role', 'general_public'))::public.user_role);
  IF (new.raw_user_meta_data->>'role' = 'general_public') THEN
    UPDATE public.profiles SET approval_status = 'approved' WHERE id = new.id;
  END IF;
  -- Example: Give a 5% loyalty discount to a specific test user on sign up
  IF (new.email = 'loyalcustomer@example.com') THEN
    UPDATE public.profiles SET loyalty_discount_percentage = 5.00 WHERE id = new.id;
  END IF;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. Create a helper function to check for admin role (FIX for RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


-- 5. Enable RLS and define policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 6. Create RPC function for admins to fetch pending wholesale buyers
CREATE OR REPLACE FUNCTION get_pending_wholesale_buyers()
RETURNS TABLE(id uuid, email text) AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;
    RETURN QUERY SELECT p.id, u.email FROM public.profiles p JOIN auth.users u ON p.id = u.id WHERE p.role = 'wholesale_buyer' AND p.approval_status = 'pending';
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- NEW PRODUCT CATALOG SCHEMA
-- =================================================================

-- 7. Create Categories Table
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
    id bigserial PRIMARY KEY,
    name text NOT NULL,
    description text,
    image_url text
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);


-- 8. Create Product Stock Status Enum
DROP TYPE IF EXISTS public.stock_status CASCADE;
CREATE TYPE public.stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');


-- 9. Create Products Table with new pricing structure
DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE public.products (
    id bigserial PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    category_id bigint REFERENCES public.categories(id),
    dosage text, -- e.g., "500mg", "20 tablets"
    prices jsonb NOT NULL, -- e.g., {"retail": 10.99, "wholesale_tiers": [{"min_quantity": 10, "price": 8.99}, ...]}
    min_order_quantity integer DEFAULT 1,
    stock_status public.stock_status NOT NULL DEFAULT 'in_stock',
    image_url text
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);


-- 10. Create Related Products (Many-to-Many Join Table)
DROP TABLE IF EXISTS public.related_products CASCADE;
CREATE TABLE public.related_products (
    product_id_1 bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_id_2 bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id_1, product_id_2),
    CONSTRAINT check_different_products CHECK (product_id_1 <> product_id_2)
);
ALTER TABLE public.related_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read related products" ON public.related_products FOR SELECT USING (true);

-- =================================================================
-- ORDER MANAGEMENT SCHEMA
-- =================================================================

-- 11. Create Order Status Enum
DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');


-- 12. Create Orders Table
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    status public.order_status NOT NULL DEFAULT 'pending',
    total_price numeric(10, 2) NOT NULL,
    discount_applied numeric(10, 2) DEFAULT 0.00,
    delivery_address jsonb NOT NULL,
    customer_details jsonb NOT NULL
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own orders" ON public.orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (public.is_admin());


-- 13. Create Order Items Table
DROP TABLE IF EXISTS public.order_items CASCADE;
CREATE TABLE public.order_items (
    id bigserial PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id bigint NOT NULL REFERENCES public.products(id),
    quantity integer NOT NULL,
    unit_price numeric(10, 2) NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can manage their own order items" ON public.order_items;
CREATE POLICY "Users can manage their own order items" ON public.order_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (public.is_admin());


-- =================================================================
-- PAYMENT SCHEMA
-- =================================================================

-- 14. Create Payment Enums
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
CREATE TYPE public.payment_method AS ENUM ('online', 'pay_on_delivery');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'pay_on_delivery', 'awaiting_confirmation');


-- 15. Create Payments Table
DROP TABLE IF EXISTS public.payments CASCADE;
CREATE TABLE public.payments (
    id bigserial PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method public.payment_method NOT NULL,
    payment_status public.payment_status NOT NULL DEFAULT 'pending',
    reference text, -- For payment gateway transaction IDs
    amount numeric(10, 2) NOT NULL,
    verified_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);


-- 16. Enable RLS and define policies for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own payments" ON public.payments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (public.is_admin());

-- =================================================================
-- INVOICE & RECEIPT SCHEMA
-- =================================================================

-- 17. Create Invoice Status Enum
DROP TYPE IF EXISTS public.invoice_status CASCADE;
CREATE TYPE public.invoice_status AS ENUM ('draft', 'locked');

-- 18. Create Invoices Table
DROP TABLE IF EXISTS public.invoices CASCADE;
CREATE TABLE public.invoices (
    id bigserial PRIMARY KEY,
    invoice_number text NOT NULL UNIQUE,
    order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    status public.invoice_status NOT NULL DEFAULT 'draft',
    invoice_data jsonb NOT NULL,
    pdf_storage_path text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 19. Enable RLS and define policies for invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all invoices" ON public.invoices FOR ALL USING (public.is_admin());


-- 20. Create Receipts Table
DROP TABLE IF EXISTS public.receipts CASCADE;
CREATE TABLE public.receipts (
    id bigserial PRIMARY KEY,
    receipt_number text NOT NULL UNIQUE,
    payment_id bigint NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE UNIQUE,
    order_id bigint NOT NULL REFERENCES public.orders(id),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    receipt_data jsonb NOT NULL,
    pdf_storage_path text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 21. Enable RLS and define policies for receipts table
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own receipts" ON public.receipts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all receipts" ON public.receipts FOR ALL USING (public.is_admin());


-- =================================================================
-- DATABASE TRIGGERS FOR AUTOMATION
-- =================================================================

-- 22. Trigger Function to create Proforma Invoice on new order
CREATE OR REPLACE FUNCTION public.create_proforma_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    items_json jsonb;
    invoice_data_json jsonb;
    delivery_fee numeric := 500; -- Assuming fixed delivery fee
BEGIN
    -- Aggregate order items into a JSON array
    SELECT jsonb_agg(
        jsonb_build_object(
            'product_name', p.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'line_total', oi.quantity * oi.unit_price
        )
    )
    INTO items_json
    FROM public.order_items oi
    JOIN public.products p ON oi.product_id = p.id
    WHERE oi.order_id = NEW.id;

    -- Construct the final invoice data JSON
    invoice_data_json := jsonb_build_object(
        'buyerDetails', jsonb_build_object(
            'deliveryAddress', NEW.delivery_address,
            'customerDetails', NEW.customer_details
        ),
        'items', items_json,
        'pricing', jsonb_build_object(
            'subtotal', NEW.total_price - delivery_fee + NEW.discount_applied,
            'discount_applied', NEW.discount_applied,
            'delivery_fee', delivery_fee,
            'total_price', NEW.total_price
        )
    );

    -- Insert the new invoice
    INSERT INTO public.invoices (invoice_number, order_id, user_id, status, invoice_data)
    VALUES (
        'INV-' || to_char(NEW.created_at, 'YYYYMMDD') || '-' || NEW.id,
        NEW.id,
        NEW.user_id,
        'draft',
        invoice_data_json
    );

    RETURN NEW;
END;
$$;

-- 23. Attach the invoice trigger to the orders table
DROP TRIGGER IF EXISTS on_order_created_create_invoice ON public.orders;
CREATE TRIGGER on_order_created_create_invoice
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.create_proforma_invoice();


-- 24. Trigger function to create Receipt and Lock Invoice on successful payment
CREATE OR REPLACE FUNCTION public.create_payment_receipt_and_lock_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    order_details record;
    invoice_details record;
    receipt_data_json jsonb;
BEGIN
    -- Only run for 'paid' status
    IF NEW.payment_status = 'paid' THEN
        -- Get corresponding order and invoice details
        SELECT * INTO order_details FROM public.orders WHERE id = NEW.order_id;
        SELECT * INTO invoice_details FROM public.invoices WHERE order_id = NEW.order_id;

        -- Construct the receipt data JSON
        receipt_data_json := jsonb_build_object(
            'buyerDetails', jsonb_build_object(
                'deliveryAddress', order_details.delivery_address,
                'customerDetails', order_details.customer_details
            ),
            'paymentDetails', jsonb_build_object(
                'payment_method', NEW.payment_method,
                'amount_paid', NEW.amount,
                'verified_at', NEW.verified_at
            ),
            'relatedInvoiceNumber', invoice_details.invoice_number
        );
        
        -- Insert the new receipt
        INSERT INTO public.receipts (receipt_number, payment_id, order_id, user_id, receipt_data)
        VALUES (
            'RCPT-' || to_char(NEW.verified_at, 'YYYYMMDD') || '-' || NEW.id,
            NEW.id,
            NEW.order_id,
            order_details.user_id,
            receipt_data_json
        );

        -- Lock the invoice
        UPDATE public.invoices SET status = 'locked' WHERE id = invoice_details.id;
    END IF;

    RETURN NEW;
END;
$$;

-- 25. Attach the receipt trigger to the payments table
DROP TRIGGER IF EXISTS on_payment_paid_create_receipt ON public.payments;
CREATE TRIGGER on_payment_paid_create_receipt
    AFTER UPDATE OF payment_status ON public.payments
    FOR EACH ROW
    WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'paid')
    EXECUTE FUNCTION public.create_payment_receipt_and_lock_invoice();


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

-- Seed Products with Naira prices and new, working image URLs
INSERT INTO public.products (name, description, category_id, dosage, prices, min_order_quantity, stock_status, image_url) VALUES
('Paracetamol', 'Effective relief from pain and fever. Suitable for adults and children over 12 years.', 1, '500mg, 16 tablets', '{"retail": 1500, "wholesale_tiers": [{"min_quantity": 20, "price": 1200}, {"min_quantity": 100, "price": 1050}]}', 20, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png'),
('Ibuprofen', 'Anti-inflammatory tablets for relief from rheumatic and muscular pain.', 1, '200mg, 16 tablets', '{"retail": 2200, "wholesale_tiers": [{"min_quantity": 20, "price": 1800}, {"min_quantity": 100, "price": 1650}]}', 20, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png'),
('Vitamin C Effervescent', 'High-strength Vitamin C to support your immune system.', 2, '1000mg, 20 tablets', '{"retail": 3500, "wholesale_tiers": [{"min_quantity": 10, "price": 3000}, {"min_quantity": 50, "price": 2750}]}', 10, 'low_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr10_ogxr0t.png'),
('Cetirizine Hydrochloride', 'Provides fast and effective 24-hour relief from hay fever and other allergy symptoms.', 3, '10mg, 30 tablets', '{"retail": 4000, "wholesale_tiers": [{"min_quantity": 10, "price": 3500}, {"min_quantity": 50, "price": 3200}]}', 10, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr3_ocnlnb.png'),
('Antacid Tablets', 'Helps relieve symptoms of indigestion and heartburn with natural enzymes.', 4, '60 chewable tablets', '{"retail": 2800, "wholesale_tiers": [{"min_quantity": 15, "price": 2400}, {"min_quantity": 60, "price": 2100}]}', 15, 'out_of_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819814/pr1_vc2pne.png'),
('Daily Multivitamin Gummies', 'A daily multivitamin for adults in a delicious, easy-to-take gummy form.', 2, '60 gummies', '{"retail": 5500, "wholesale_tiers": [{"min_quantity": 12, "price": 4800}, {"min_quantity": 48, "price": 4300}]}', 12, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr5_jpaxlh.png'),
('Glycerol Cough Syrup', 'Soothing relief for dry, tickly coughs. Non-drowsy formula.', 5, '200ml bottle', '{"retail": 2500, "wholesale_tiers": [{"min_quantity": 24, "price": 2100}, {"min_quantity": 96, "price": 1900}]}', 24, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819814/pr4_sl96nd.png'),
('Melatonin Sleep Aid', 'Natural melatonin to help you fall asleep faster and improve sleep quality.', 2, '5mg, 90 tablets', '{"retail": 4200, "wholesale_tiers": [{"min_quantity": 10, "price": 3600}, {"min_quantity": 50, "price": 3300}]}', 10, 'low_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr8_w8bqcm.png'),
('Loratadine Allergy Relief', 'Non-drowsy allergy relief for indoor and outdoor allergies.', 3, '10mg, 30 tablets', '{"retail": 4500, "wholesale_tiers": [{"min_quantity": 10, "price": 3900}, {"min_quantity": 50, "price": 3600}]}', 10, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr7_ytnwx5.png'),
('Aspirin', 'Low-dose aspirin for pain relief and prevention of blood clots.', 1, '75mg, 28 tablets', '{"retail": 1200, "wholesale_tiers": [{"min_quantity": 25, "price": 950}, {"min_quantity": 100, "price": 800}]}', 25, 'in_stock', 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819814/pr2_jxbqeh.png');


-- Seed Related Products (Symmetric relationships)
-- Paracetamol related to Ibuprofen and Aspirin
INSERT INTO public.related_products (product_id_1, product_id_2) VALUES (1, 2), (1, 10), (2, 1), (10, 1);
-- Vitamin C related to Multivitamins
INSERT INTO public.related_products (product_id_1, product_id_2) VALUES (3, 6), (6, 3);
-- Allergy meds related to each other
INSERT INTO public.related_products (product_id_1, product_id_2) VALUES (4, 9), (9, 4);
