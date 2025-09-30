-- Create ussd_codes table
CREATE TABLE public.ussd_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  last_result TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ussd_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth required)
CREATE POLICY "Anyone can view USSD codes" 
ON public.ussd_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert USSD codes" 
ON public.ussd_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update USSD codes" 
ON public.ussd_codes 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete USSD codes" 
ON public.ussd_codes 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ussd_codes_updated_at
BEFORE UPDATE ON public.ussd_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ussd_codes;