-- Migration: Add terms acceptance to enrolled_users
ALTER TABLE public.enrolled_users 
ADD COLUMN IF NOT EXISTS accepted_terms boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS accepted_terms_at timestamp with time zone;

-- Create function to enforce accepted_terms constraint
CREATE OR REPLACE FUNCTION public.check_enrolled_users_terms_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- If terms were already accepted (true), do not allow turning it back to false
  IF OLD.accepted_terms = true AND NEW.accepted_terms = false THEN
    RAISE EXCEPTION 'La aceptación de los términos y condiciones no puede ser revertida.';
  END IF;
  
  -- If terms are being accepted now, auto-set accepted_terms_at to NOW() on the server
  IF NEW.accepted_terms = true AND (OLD.accepted_terms = false OR OLD.accepted_terms IS NULL) THEN
    NEW.accepted_terms_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trg_check_enrolled_users_terms_acceptance ON public.enrolled_users;
CREATE TRIGGER trg_check_enrolled_users_terms_acceptance
BEFORE UPDATE ON public.enrolled_users
FOR EACH ROW
EXECUTE FUNCTION public.check_enrolled_users_terms_acceptance();
