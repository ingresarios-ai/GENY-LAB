-- Create invitations table for webhook + magic link + password registration flow
CREATE TABLE public.invitations (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token      UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  contact_id TEXT,                    -- GHL contact ID
  status     TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'used' | 'expired'
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at    TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- Índices
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);

-- RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Política: lectura anónima por token (para la página /registro)
CREATE POLICY "Allow anon select by token"
  ON public.invitations
  FOR SELECT
  TO anon
  USING (true);
