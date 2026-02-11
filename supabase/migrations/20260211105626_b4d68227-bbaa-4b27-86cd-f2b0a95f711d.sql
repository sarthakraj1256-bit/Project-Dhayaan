
-- Jap Bank entries (personal chant ledger)
CREATE TABLE public.jap_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mantra_name TEXT NOT NULL,
  chant_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.jap_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own jap entries" ON public.jap_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jap entries" ON public.jap_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jap entries" ON public.jap_entries FOR DELETE USING (auth.uid() = user_id);

-- Jap Goals
CREATE TABLE public.jap_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mantra_name TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  current_count INTEGER NOT NULL DEFAULT 0,
  deadline DATE,
  dedication TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.jap_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own jap goals" ON public.jap_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jap goals" ON public.jap_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jap goals" ON public.jap_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jap goals" ON public.jap_goals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_jap_goals_updated_at BEFORE UPDATE ON public.jap_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Jap Requests (delegation system)
CREATE TABLE public.jap_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  performer_id UUID,
  mantra_name TEXT NOT NULL,
  required_count INTEGER NOT NULL,
  completed_count INTEGER NOT NULL DEFAULT 0,
  dedicated_to TEXT,
  deadline DATE,
  karma_reward INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.jap_requests ENABLE ROW LEVEL SECURITY;
-- Anyone authenticated can see pending requests (marketplace)
CREATE POLICY "Authenticated users can view pending requests" ON public.jap_requests FOR SELECT USING (
  auth.uid() IS NOT NULL AND (status = 'pending' OR requester_id = auth.uid() OR performer_id = auth.uid())
);
CREATE POLICY "Users can create jap requests" ON public.jap_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requester or performer can update" ON public.jap_requests FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = performer_id);
CREATE POLICY "Requester can delete pending requests" ON public.jap_requests FOR DELETE USING (auth.uid() = requester_id AND status = 'pending');
CREATE TRIGGER update_jap_requests_updated_at BEFORE UPDATE ON public.jap_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Jap Proofs
CREATE TABLE public.jap_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.jap_requests(id) ON DELETE CASCADE,
  performer_id UUID NOT NULL,
  proof_type TEXT NOT NULL DEFAULT 'screenshot',
  proof_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.jap_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requester and performer can view proofs" ON public.jap_proofs FOR SELECT USING (
  auth.uid() IN (SELECT requester_id FROM public.jap_requests WHERE id = request_id)
  OR auth.uid() = performer_id
);
CREATE POLICY "Performer can submit proofs" ON public.jap_proofs FOR INSERT WITH CHECK (auth.uid() = performer_id);

-- Storage bucket for proof uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('jap-proofs', 'jap-proofs', false);
CREATE POLICY "Users can upload their own proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'jap-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view relevant proofs" ON storage.objects FOR SELECT USING (bucket_id = 'jap-proofs' AND auth.uid() IS NOT NULL);

-- Leaderboard function
CREATE OR REPLACE FUNCTION public.get_jap_leaderboard(mantra_filter TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 50)
RETURNS TABLE(user_id UUID, display_name TEXT, avatar_url TEXT, total_chants BIGINT, mantra_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    je.user_id,
    p.display_name,
    p.avatar_url,
    SUM(je.chant_count)::BIGINT as total_chants,
    je.mantra_name
  FROM public.jap_entries je
  LEFT JOIN public.profiles p ON je.user_id = p.user_id
  WHERE (mantra_filter IS NULL OR je.mantra_name = mantra_filter)
  GROUP BY je.user_id, je.mantra_name, p.display_name, p.avatar_url
  ORDER BY total_chants DESC
  LIMIT limit_count;
END;
$$;
