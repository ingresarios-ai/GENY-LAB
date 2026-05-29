-- Create register_lead database function to handle anonymous lead signups safely bypassing RLS
CREATE OR REPLACE FUNCTION public.register_lead(
  p_name text,
  p_email text,
  p_phone text,
  p_country text,
  p_country_name text,
  p_lead_source text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id uuid;
  v_existing_status text;
BEGIN
  -- Normalise email
  p_email := lower(trim(p_email));
  
  -- Check if exists
  SELECT id, status INTO v_existing_id, v_existing_status
  FROM public.enrolled_users
  WHERE email = p_email;
  
  IF FOUND THEN
    -- Only update if they are not active (i.e. don't downgrade active users)
    IF v_existing_status <> 'active' THEN
      UPDATE public.enrolled_users
      SET
        name = p_name,
        phone = p_phone,
        country = p_country,
        country_name = p_country_name,
        status = 'lead',
        lead_source = p_lead_source,
        updated_at = now()
      WHERE id = v_existing_id;
    END IF;
    RETURN json_build_object('success', true, 'id', v_existing_id, 'action', 'updated');
  ELSE
    -- Insert new lead
    INSERT INTO public.enrolled_users (
      name,
      email,
      phone,
      country,
      country_name,
      status,
      lead_source,
      payment_method,
      payment_platform,
      created_at,
      updated_at
    )
    VALUES (
      p_name,
      p_email,
      p_phone,
      p_country,
      p_country_name,
      'lead',
      p_lead_source,
      'generic',
      'generic',
      now(),
      now()
    )
    RETURNING id INTO v_existing_id;
    
    RETURN json_build_object('success', true, 'id', v_existing_id, 'action', 'inserted');
  END IF;
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.register_lead TO anon, authenticated, service_role;
