-- Ensure app_config singleton row exists
INSERT INTO public.app_config (singleton, super_admin_emails)
SELECT true, '{}'::text[]
WHERE NOT EXISTS (SELECT 1 FROM public.app_config);

-- Function: on new auth user, if no super admin set yet, make them super admin
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_admins text[];
BEGIN
  SELECT super_admin_emails INTO current_admins FROM public.app_config LIMIT 1;
  IF current_admins IS NULL OR array_length(current_admins, 1) IS NULL OR array_length(current_admins, 1) = 0 THEN
    UPDATE public.app_config SET super_admin_emails = ARRAY[NEW.email], updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_bootstrap_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_super_admin();

-- Ensure profile creation trigger exists (uses existing handle_new_user)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();