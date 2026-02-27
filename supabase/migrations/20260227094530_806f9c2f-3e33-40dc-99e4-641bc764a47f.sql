
-- Step 1: Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Step 3: Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: RLS policies - only admins can view roles, users can see their own
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 6: Insert admin role for your account
INSERT INTO public.user_roles (user_id, role)
VALUES ('c3202f01-a8d1-42bd-8426-9395e0e525c5', 'admin');

-- Step 7: Create admin-only function to list all users with profiles
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text,
  karma_points integer,
  last_activity_date date,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.avatar_url,
    COALESCE(usp.karma_points, 0) as karma_points,
    usp.last_activity_date,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_spiritual_progress usp ON p.user_id = usp.user_id
  ORDER BY p.created_at DESC
  LIMIT 100;
END;
$$;

-- Step 8: Create admin function to list jap proofs
CREATE OR REPLACE FUNCTION public.admin_get_jap_proofs()
RETURNS TABLE(
  id uuid,
  request_id uuid,
  performer_id uuid,
  proof_url text,
  proof_type text,
  notes text,
  created_at timestamp with time zone,
  performer_name text,
  mantra_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    jp.id,
    jp.request_id,
    jp.performer_id,
    jp.proof_url,
    jp.proof_type,
    jp.notes,
    jp.created_at,
    p.display_name as performer_name,
    jr.mantra_name
  FROM public.jap_proofs jp
  LEFT JOIN public.profiles p ON jp.performer_id = p.user_id
  LEFT JOIN public.jap_requests jr ON jp.request_id = jr.id
  ORDER BY jp.created_at DESC
  LIMIT 100;
END;
$$;
