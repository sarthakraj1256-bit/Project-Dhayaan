
-- Add acknowledgement columns
ALTER TABLE public.temple_jap_reports 
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS blessing_message text;

-- Function to auto-acknowledge submitted reports after 24 hours
CREATE OR REPLACE FUNCTION public.auto_acknowledge_temple_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  blessings text[] := ARRAY[
    'May the divine light of this mantra illuminate your path. Om Shanti. 🙏',
    'Your devotion has been received with grace. May blessings flow abundantly upon you and your family. 🙏',
    'The sacred vibrations of your chanting resonate through the temple halls. May peace be with you. 🕉️',
    'Your offering of devotion is acknowledged with gratitude. May the divine fulfill your Sankalpa. 🙏',
    'The temple gratefully receives your spiritual offering. May your prayers be answered. 🕉️',
    'Your dedication shines like a lamp in the temple. May this light guide you always. 🪔',
    'Blessed is the devotee who chants with sincerity. Your offering brings merit to all beings. 🙏',
    'The divine hears every syllable of your devotion. May grace surround you. Om Tat Sat. 🕉️'
  ];
BEGIN
  UPDATE public.temple_jap_reports
  SET 
    status = 'acknowledged',
    acknowledged_at = now(),
    blessing_message = blessings[1 + floor(random() * array_length(blessings, 1))::int]
  WHERE status = 'submitted'
    AND created_at < now() - interval '24 hours';
END;
$$;
