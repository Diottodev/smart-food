
-- Storage bucket for tenant logos/photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read (bucket is public for logos shown on /pedir/:slug)
DROP POLICY IF EXISTS "tenant_assets_public_read" ON storage.objects;
CREATE POLICY "tenant_assets_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'tenant-assets');

-- Authenticated upload restricted to own company folder (path: <company_id>/...)
DROP POLICY IF EXISTS "tenant_assets_insert_own" ON storage.objects;
CREATE POLICY "tenant_assets_insert_own" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'tenant-assets'
  AND (
    public.is_super_admin()
    OR (storage.foldername(name))[1] = public.current_company_id()::text
  )
);

DROP POLICY IF EXISTS "tenant_assets_update_own" ON storage.objects;
CREATE POLICY "tenant_assets_update_own" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'tenant-assets'
  AND (
    public.is_super_admin()
    OR (storage.foldername(name))[1] = public.current_company_id()::text
  )
);

DROP POLICY IF EXISTS "tenant_assets_delete_own" ON storage.objects;
CREATE POLICY "tenant_assets_delete_own" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'tenant-assets'
  AND (
    public.is_super_admin()
    OR (storage.foldername(name))[1] = public.current_company_id()::text
  )
);

-- Revoke EXECUTE from anon/authenticated on internal trigger-only functions
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin() FROM anon, authenticated, public;

-- NOTE (by-design):
--   public.is_super_admin(), public.current_company_id(), public.has_role(uuid, app_role)
--   permanecem executáveis pois sao usadas dentro de políticas RLS avaliadas com o role do usuario.
--   Revogar EXECUTE quebraria o controle de acesso.
--
--   `company` co_insert_auth WITH CHECK (true) e `company_user` cu_insert sao necessarias
--   para o fluxo de onboarding (usuario autenticado cria sua propria empresa). A validacao
--   de tenancy acontece em UPDATE/SELECT/DELETE.
