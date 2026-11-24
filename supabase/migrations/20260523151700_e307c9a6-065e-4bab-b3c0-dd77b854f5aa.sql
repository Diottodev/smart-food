
-- ============ DROP OLD SCHEMA ============
DROP TABLE IF EXISTS public.order_item CASCADE;
DROP TABLE IF EXISTS public."order" CASCADE;
DROP TABLE IF EXISTS public.financial_entry CASCADE;
DROP TABLE IF EXISTS public.menu_item_extra CASCADE;
DROP TABLE IF EXISTS public.menu_item CASCADE;
DROP TABLE IF EXISTS public.menu_category CASCADE;
DROP TABLE IF EXISTS public.customer CASCADE;
DROP TABLE IF EXISTS public.rider CASCADE;
DROP TABLE IF EXISTS public.delivery_zone CASCADE;
DROP TABLE IF EXISTS public.team_member CASCADE;
DROP TABLE IF EXISTS public.company_user CASCADE;
DROP TABLE IF EXISTS public.company CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.app_config CASCADE;

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.current_company_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.company_status CASCADE;
DROP TYPE IF EXISTS public.plan_tier CASCADE;

-- ============ TYPES ============
CREATE TYPE public.app_role AS ENUM ('super_admin','admin','garcom','cozinha','entregador','caixa','demo');
CREATE TYPE public.order_status AS ENUM ('novo','preparo','pronto','saiu','entregue','cancelado');
CREATE TYPE public.company_status AS ENUM ('trial','active','inadimplente','suspended','inactive');
CREATE TYPE public.plan_tier AS ENUM ('starter','pro','enterprise');

-- ============ UTIL ============
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ APP_CONFIG ============
CREATE TABLE public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  app_name text DEFAULT 'FoodControl AI',
  super_admin_emails text[] NOT NULL DEFAULT '{}',
  system_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.app_config (singleton, super_admin_emails) VALUES (true, '{}');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ COMPANY ============
CREATE TABLE public.company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  cnpj text,
  email text,
  telefone text,
  whatsapp text,
  endereco jsonb,
  logo_url text,
  cor_primaria text NOT NULL DEFAULT '#EF4444',
  status public.company_status NOT NULL DEFAULT 'trial',
  plano public.plan_tier NOT NULL DEFAULT 'starter',
  valor_mensal numeric NOT NULL DEFAULT 59,
  trial_ate timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  ultimo_acesso timestamptz,
  business_hours jsonb DEFAULT '{}'::jsonb,
  delivery_fee numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  company_id uuid REFERENCES public.company(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, company_id)
);

-- ============ COMPANY_USER ============
CREATE TABLE public.company_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nome text,
  role public.app_role NOT NULL DEFAULT 'admin',
  ativo boolean NOT NULL DEFAULT true,
  ultimo_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);
CREATE INDEX idx_company_user_user ON public.company_user(user_id) WHERE ativo;

-- ============ MENU ============
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
CREATE INDEX idx_menu_category_company ON public.menu_category(company_id);

CREATE TABLE public.menu_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.menu_category(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  available boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  prep_time_minutes int NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_item_company ON public.menu_item(company_id);

CREATE TABLE public.menu_item_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_item(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  max_qty int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ CUSTOMER / RIDER / ZONE ============
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
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, phone)
);

CREATE TABLE public.rider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text DEFAULT 'moto',
  plate text,
  active boolean NOT NULL DEFAULT true,
  commission_pct numeric NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

-- ============ ORDER ============
CREATE TABLE public."order" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customer(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address jsonb,
  type text NOT NULL DEFAULT 'delivery',
  status public.order_status NOT NULL DEFAULT 'novo',
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pendente',
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  rider_id uuid REFERENCES public.rider(id) ON DELETE SET NULL,
  notes text,
  eta_minutes int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_company ON public."order"(company_id, status);

CREATE TABLE public.order_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public."order"(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_item(id) ON DELETE SET NULL,
  name text NOT NULL,
  qty int NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total numeric NOT NULL,
  extras jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ FINANCIAL ============
CREATE TABLE public.financial_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'entrada',
  category text,
  description text,
  amount numeric NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'confirmado',
  reference_order_id uuid REFERENCES public."order"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ TRIGGERS updated_at ============
DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT unnest(ARRAY['app_config','profiles','company','company_user','menu_category','menu_item','menu_item_extra','customer','rider','delivery_zone','order','financial_entry']) LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', replace(t,'"',''), t);
  END LOOP;
END $$;

-- ============ SECURITY DEFINER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_config c, auth.users u
    WHERE u.id = auth.uid() AND lower(u.email) = ANY(SELECT lower(unnest(c.super_admin_emails)))
  )
$$;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.company_user WHERE user_id = auth.uid() AND ativo ORDER BY created_at LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ENABLE RLS ============
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entry ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============
-- app_config
CREATE POLICY ac_select_auth ON public.app_config FOR SELECT TO authenticated USING (true);
CREATE POLICY ac_select_anon ON public.app_config FOR SELECT TO anon USING (true);
CREATE POLICY ac_update_super ON public.app_config FOR UPDATE USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- profiles
CREATE POLICY p_select_self_or_super ON public.profiles FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin());
CREATE POLICY p_insert_self ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY p_update_self ON public.profiles FOR UPDATE USING (user_id = auth.uid() OR public.is_super_admin());

-- company: members see own; super sees all; anon can SELECT by slug for public menu
CREATE POLICY co_select_member ON public.company FOR SELECT USING (id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY co_select_anon_public ON public.company FOR SELECT TO anon USING (status IN ('trial','active'));
CREATE POLICY co_insert_auth ON public.company FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY co_update_member ON public.company FOR UPDATE USING (id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY co_delete_super ON public.company FOR DELETE USING (public.is_super_admin());

-- user_roles: self read; super manages
CREATE POLICY ur_select ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin());
CREATE POLICY ur_insert_super ON public.user_roles FOR INSERT WITH CHECK (public.is_super_admin() OR user_id = auth.uid());
CREATE POLICY ur_delete_super ON public.user_roles FOR DELETE USING (public.is_super_admin());

-- company_user: self read; member of same company reads; insert by self for own membership
CREATE POLICY cu_select ON public.company_user FOR SELECT USING (user_id = auth.uid() OR company_id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY cu_insert ON public.company_user FOR INSERT WITH CHECK (user_id = auth.uid() OR company_id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY cu_update ON public.company_user FOR UPDATE USING (company_id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY cu_delete ON public.company_user FOR DELETE USING (company_id = public.current_company_id() OR public.is_super_admin());

-- menu_category: tenant + public anon by company status active
CREATE POLICY mc_select ON public.menu_category FOR SELECT USING (company_id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY mc_select_anon ON public.menu_category FOR SELECT TO anon USING (active AND EXISTS (SELECT 1 FROM public.company c WHERE c.id = menu_category.company_id AND c.status IN ('trial','active')));
CREATE POLICY mc_cud ON public.menu_category FOR ALL USING (company_id = public.current_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin());

-- menu_item
CREATE POLICY mi_select ON public.menu_item FOR SELECT USING (company_id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY mi_select_anon ON public.menu_item FOR SELECT TO anon USING (available AND EXISTS (SELECT 1 FROM public.company c WHERE c.id = menu_item.company_id AND c.status IN ('trial','active')));
CREATE POLICY mi_cud ON public.menu_item FOR ALL USING (company_id = public.current_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin());

-- menu_item_extra
CREATE POLICY me_select ON public.menu_item_extra FOR SELECT USING (EXISTS (SELECT 1 FROM public.menu_item m WHERE m.id = menu_item_extra.menu_item_id AND (m.company_id = public.current_company_id() OR public.is_super_admin())));
CREATE POLICY me_select_anon ON public.menu_item_extra FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.menu_item m JOIN public.company c ON c.id = m.company_id WHERE m.id = menu_item_extra.menu_item_id AND c.status IN ('trial','active')));
CREATE POLICY me_cud ON public.menu_item_extra FOR ALL USING (EXISTS (SELECT 1 FROM public.menu_item m WHERE m.id = menu_item_extra.menu_item_id AND (m.company_id = public.current_company_id() OR public.is_super_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.menu_item m WHERE m.id = menu_item_extra.menu_item_id AND (m.company_id = public.current_company_id() OR public.is_super_admin())));

-- customer: tenant only; anon can INSERT (público criando pedido)
CREATE POLICY cs_select ON public.customer FOR SELECT USING (company_id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY cs_insert_anon ON public.customer FOR INSERT TO anon WITH CHECK (EXISTS (SELECT 1 FROM public.company c WHERE c.id = customer.company_id AND c.status IN ('trial','active')));
CREATE POLICY cs_cud ON public.customer FOR ALL USING (company_id = public.current_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin());

-- rider
CREATE POLICY rd_all ON public.rider FOR ALL USING (company_id = public.current_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin());

-- delivery_zone (anon select for public menu)
CREATE POLICY dz_select ON public.delivery_zone FOR SELECT USING (company_id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY dz_select_anon ON public.delivery_zone FOR SELECT TO anon USING (active AND EXISTS (SELECT 1 FROM public.company c WHERE c.id = delivery_zone.company_id AND c.status IN ('trial','active')));
CREATE POLICY dz_cud ON public.delivery_zone FOR ALL USING (company_id = public.current_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin());

-- order: tenant + anon INSERT
CREATE POLICY or_select ON public."order" FOR SELECT USING (company_id = public.current_company_id() OR public.is_super_admin());
CREATE POLICY or_insert_anon ON public."order" FOR INSERT TO anon WITH CHECK (EXISTS (SELECT 1 FROM public.company c WHERE c.id = "order".company_id AND c.status IN ('trial','active')));
CREATE POLICY or_cud ON public."order" FOR ALL USING (company_id = public.current_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin());

-- order_item: via parent
CREATE POLICY oi_select ON public.order_item FOR SELECT USING (EXISTS (SELECT 1 FROM public."order" o WHERE o.id = order_item.order_id AND (o.company_id = public.current_company_id() OR public.is_super_admin())));
CREATE POLICY oi_insert_anon ON public.order_item FOR INSERT TO anon WITH CHECK (EXISTS (SELECT 1 FROM public."order" o JOIN public.company c ON c.id = o.company_id WHERE o.id = order_item.order_id AND c.status IN ('trial','active')));
CREATE POLICY oi_cud ON public.order_item FOR ALL USING (EXISTS (SELECT 1 FROM public."order" o WHERE o.id = order_item.order_id AND (o.company_id = public.current_company_id() OR public.is_super_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM public."order" o WHERE o.id = order_item.order_id AND (o.company_id = public.current_company_id() OR public.is_super_admin())));

-- financial_entry
CREATE POLICY fe_all ON public.financial_entry FOR ALL USING (company_id = public.current_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin());
