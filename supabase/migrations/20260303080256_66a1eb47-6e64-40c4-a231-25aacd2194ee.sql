
-- Table: Store user breathing preferences
CREATE TABLE public.breathing_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  inhale_seconds integer NOT NULL DEFAULT 4,
  exhale_seconds integer NOT NULL DEFAULT 6,
  hold_seconds integer NOT NULL DEFAULT 2,
  auto_balance boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.breathing_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.breathing_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.breathing_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.breathing_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_breathing_preferences_updated_at
  BEFORE UPDATE ON public.breathing_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add inhale/exhale settings to breath_flow_sessions for historical tracking
ALTER TABLE public.breath_flow_sessions
  ADD COLUMN inhale_seconds integer NOT NULL DEFAULT 4,
  ADD COLUMN exhale_seconds integer NOT NULL DEFAULT 6,
  ADD COLUMN hold_seconds integer NOT NULL DEFAULT 2;
