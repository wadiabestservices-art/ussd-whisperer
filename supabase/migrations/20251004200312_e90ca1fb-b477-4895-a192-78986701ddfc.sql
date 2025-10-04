-- Create enum types for categories and operators
CREATE TYPE public.ussd_category AS ENUM ('topup', 'activation', 'check');
CREATE TYPE public.operator_type AS ENUM ('inwi', 'iam', 'orange');

-- Add category and operator columns to ussd_codes table
ALTER TABLE public.ussd_codes 
ADD COLUMN category public.ussd_category NOT NULL DEFAULT 'check',
ADD COLUMN operator public.operator_type NOT NULL DEFAULT 'inwi';

-- Create sim_cards table
CREATE TABLE public.sim_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  operator public.operator_type NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  daily_activation_count INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS on sim_cards
ALTER TABLE public.sim_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for sim_cards
CREATE POLICY "Anyone can view SIM cards"
ON public.sim_cards
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert SIM cards"
ON public.sim_cards
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update SIM cards"
ON public.sim_cards
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete SIM cards"
ON public.sim_cards
FOR DELETE
USING (true);

-- Create trigger for sim_cards updated_at
CREATE TRIGGER update_sim_cards_updated_at
BEFORE UPDATE ON public.sim_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to reset daily counts if date changed
CREATE OR REPLACE FUNCTION public.reset_daily_activation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_reset_date < CURRENT_DATE THEN
    NEW.daily_activation_count := 0;
    NEW.last_reset_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-reset daily counts
CREATE TRIGGER auto_reset_daily_count
BEFORE UPDATE ON public.sim_cards
FOR EACH ROW
EXECUTE FUNCTION public.reset_daily_activation_count();