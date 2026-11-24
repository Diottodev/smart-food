
-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- is_admin helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
$$;

-- current_company_id helper
CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE POLICY "profiles select self or admin" ON public.profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles update self" ON public.profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles insert self" ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Company
CREATE TABLE public.company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  cnpj text,
  email text,
  telefone text,
  whatsapp text,
  endereco jsonb,
  logo_url text,
  cor_primaria text DEFAULT '#EF4444',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','blocked')),
  plano text NOT NULL DEFAULT 'starter' CHECK (plano IN ('starter','pro','enterprise')),
  business_hours jsonb,
  delivery_fee numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_company_updated BEFORE UPDATE ON public.company FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "company select own or admin" ON public.company FOR SELECT
  USING (id = public.current_company_id() OR public.is_admin());
CREATE POLICY "company insert authenticated" ON public.company FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "company update own or admin" ON public.company FOR UPDATE
  USING (id = public.current_company_id() OR public.is_admin());
CREATE POLICY "company delete admin" ON public.company FOR DELETE USING (public.is_admin());

ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_fk
  FOREIGN KEY (company_id) REFERENCES public.company(id) ON DELETE SET NULL;

-- Generic table builder via DO block
-- company_user
CREATE TABLE public.company_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  email text NOT NULL,
  nome text,
  role text NOT NULL DEFAULT 'garcom' CHECK (role IN ('owner','admin','garcom','cozinha','entregador','caixa')),
  ativo boolean NOT NULL DEFAULT true,
  ultimo_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.company_user ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_company_user_updated BEFORE UPDATE ON public.company_user FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- team_member
CREATE TABLE public.team_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'garcom' CHECK (role IN ('admin','garcom','cozinha','entregador','caixa')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.team_member ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_team_member_updated BEFORE UPDATE ON public.team_member FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- rider
CREATE TABLE public.rider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text DEFAULT 'moto' CHECK (vehicle_type IN ('moto','bike','carro','pe')),
  plate text,
  active boolean NOT NULL DEFAULT true,
  commission_pct numeric NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rider ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_rider_updated BEFORE UPDATE ON public.rider FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- customer
CREATE TABLE public.customer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address jsonb,
  total_orders int NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0,
  last_order_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','vip')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_customer_updated BEFORE UPDATE ON public.customer FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- delivery_zone
CREATE TABLE public.delivery_zone (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  polygon jsonb,
  delivery_fee numeric,
  min_order numeric,
  eta_minutes int NOT NULL DEFAULT 45,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_zone ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_delivery_zone_updated BEFORE UPDATE ON public.delivery_zone FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- menu_category
CREATE TABLE public.menu_category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_category ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_menu_category_updated BEFORE UPDATE ON public.menu_category FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- menu_item
CREATE TABLE public.menu_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.menu_category(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  available boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  prep_time_minutes int NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_item ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_menu_item_updated BEFORE UPDATE ON public.menu_item FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- menu_item_extra
CREATE TABLE public.menu_item_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_item(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  max_qty int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_item_extra ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_menu_item_extra_updated BEFORE UPDATE ON public.menu_item_extra FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- order (quoted, reserved word)
CREATE TABLE public."order" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customer(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address jsonb,
  type text NOT NULL DEFAULT 'delivery' CHECK (type IN ('delivery','balcao','mesa')),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','preparo','pronto','saiu','entregue','cancelado')),
  payment_method text CHECK (payment_method IN ('Pix','Dinheiro','Cartao','Online')),
  payment_status text NOT NULL DEFAULT 'pendente' CHECK (payment_status IN ('pendente','pago','estornado')),
  subtotal numeric NOT NULL,
  delivery_fee numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  rider_id uuid REFERENCES public.rider(id) ON DELETE SET NULL,
  notes text,
  eta_minutes int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public."order" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_order_updated BEFORE UPDATE ON public."order" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- order_item
CREATE TABLE public.order_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public."order"(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES public.menu_item(id) ON DELETE RESTRICT,
  name text NOT NULL,
  qty int NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total numeric NOT NULL,
  extras jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_item ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_order_item_updated BEFORE UPDATE ON public.order_item FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- financial_entry
CREATE TABLE public.financial_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'entrada' CHECK (type IN ('entrada','saida')),
  category text,
  description text,
  amount numeric NOT NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'confirmado' CHECK (status IN ('pendente','confirmado')),
  reference_order_id uuid REFERENCES public."order"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_entry ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_financial_entry_updated BEFORE UPDATE ON public.financial_entry FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- app_config
CREATE TABLE public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_emails text[] DEFAULT '{}',
  app_name text DEFAULT 'FoodControl AI',
  system_settings jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_app_config_updated BEFORE UPDATE ON public.app_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "app_config select all auth" ON public.app_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "app_config admin write" ON public.app_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Generic RLS for company-scoped tables
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'company_user','team_member','rider','customer','delivery_zone',
    'menu_category','menu_item','financial_entry'
  ]) LOOP
    EXECUTE format('CREATE POLICY "%1$s_select" ON public.%1$I FOR SELECT USING (company_id = public.current_company_id() OR public.is_admin())', t);
    EXECUTE format('CREATE POLICY "%1$s_insert" ON public.%1$I FOR INSERT WITH CHECK (company_id = public.current_company_id() OR public.is_admin())', t);
    EXECUTE format('CREATE POLICY "%1$s_update" ON public.%1$I FOR UPDATE USING (company_id = public.current_company_id() OR public.is_admin())', t);
    EXECUTE format('CREATE POLICY "%1$s_delete" ON public.%1$I FOR DELETE USING (company_id = public.current_company_id() OR public.is_admin())', t);
  END LOOP;
END $$;

-- Order policies (quoted table)
CREATE POLICY "order_select" ON public."order" FOR SELECT USING (company_id = public.current_company_id() OR public.is_admin());
CREATE POLICY "order_insert" ON public."order" FOR INSERT WITH CHECK (company_id = public.current_company_id() OR public.is_admin());
CREATE POLICY "order_update" ON public."order" FOR UPDATE USING (company_id = public.current_company_id() OR public.is_admin());
CREATE POLICY "order_delete" ON public."order" FOR DELETE USING (company_id = public.current_company_id() OR public.is_admin());

-- order_item via parent order
CREATE POLICY "order_item_select" ON public.order_item FOR SELECT USING (
  EXISTS (SELECT 1 FROM public."order" o WHERE o.id = order_id AND (o.company_id = public.current_company_id() OR public.is_admin()))
);
CREATE POLICY "order_item_insert" ON public.order_item FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public."order" o WHERE o.id = order_id AND (o.company_id = public.current_company_id() OR public.is_admin()))
);
CREATE POLICY "order_item_update" ON public.order_item FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public."order" o WHERE o.id = order_id AND (o.company_id = public.current_company_id() OR public.is_admin()))
);
CREATE POLICY "order_item_delete" ON public.order_item FOR DELETE USING (
  EXISTS (SELECT 1 FROM public."order" o WHERE o.id = order_id AND (o.company_id = public.current_company_id() OR public.is_admin()))
);

-- menu_item_extra via parent menu_item
CREATE POLICY "menu_item_extra_select" ON public.menu_item_extra FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menu_item m WHERE m.id = menu_item_id AND (m.company_id = public.current_company_id() OR public.is_admin()))
);
CREATE POLICY "menu_item_extra_insert" ON public.menu_item_extra FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.menu_item m WHERE m.id = menu_item_id AND (m.company_id = public.current_company_id() OR public.is_admin()))
);
CREATE POLICY "menu_item_extra_update" ON public.menu_item_extra FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.menu_item m WHERE m.id = menu_item_id AND (m.company_id = public.current_company_id() OR public.is_admin()))
);
CREATE POLICY "menu_item_extra_delete" ON public.menu_item_extra FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.menu_item m WHERE m.id = menu_item_id AND (m.company_id = public.current_company_id() OR public.is_admin()))
);

CREATE INDEX idx_order_company_status ON public."order"(company_id, status);
CREATE INDEX idx_menu_item_company ON public.menu_item(company_id);
CREATE INDEX idx_customer_company ON public.customer(company_id);
CREATE INDEX idx_financial_company_date ON public.financial_entry(company_id, date);
