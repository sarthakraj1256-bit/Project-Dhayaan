-- Create table for darshan chat messages
CREATE TABLE public.darshan_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  temple_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries by temple
CREATE INDEX idx_darshan_chat_temple_id ON public.darshan_chat_messages(temple_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.darshan_chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view chat messages (public chat)
CREATE POLICY "Anyone can view chat messages"
ON public.darshan_chat_messages
FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own messages
CREATE POLICY "Users can send chat messages"
ON public.darshan_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.darshan_chat_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for the chat table
ALTER PUBLICATION supabase_realtime ADD TABLE public.darshan_chat_messages;

-- Auto-delete old messages (older than 24 hours) to keep the table clean
-- This is handled by a scheduled function, but we'll add a simple cleanup trigger
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete messages older than 24 hours when new messages are inserted
  DELETE FROM public.darshan_chat_messages
  WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$;

-- Create trigger to cleanup on insert (runs occasionally)
CREATE TRIGGER cleanup_chat_on_insert
AFTER INSERT ON public.darshan_chat_messages
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_chat_messages();