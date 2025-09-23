-- Create earnings table for tracking user earnings
CREATE TABLE public.earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  source TEXT NOT NULL, -- 'ad_revenue', 'tips', 'promotions'
  story_id UUID REFERENCES stories(id),
  chapter_id UUID REFERENCES chapters(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payouts table for tracking payout history
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  method TEXT NOT NULL, -- 'paypal', 'bank_transfer'
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for earnings
CREATE POLICY "Users can view their own earnings" 
ON public.earnings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert earnings" 
ON public.earnings 
FOR INSERT 
WITH CHECK (true);

-- Create policies for payouts
CREATE POLICY "Users can view their own payouts" 
ON public.payouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create payout requests" 
ON public.payouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payouts" 
ON public.payouts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert some sample earnings data for testing
INSERT INTO public.earnings (user_id, amount, source, earned_at) VALUES 
('792d4939-fab9-4e22-87a6-0c93423753a8', 45.20, 'ad_revenue', now() - interval '5 days'),
('792d4939-fab9-4e22-87a6-0c93423753a8', 15.80, 'tips', now() - interval '3 days'),
('792d4939-fab9-4e22-87a6-0c93423753a8', 28.30, 'ad_revenue', now() - interval '1 day');

-- Insert some sample payout history
INSERT INTO public.payouts (user_id, amount, status, method, requested_at, processed_at) VALUES 
('792d4939-fab9-4e22-87a6-0c93423753a8', 125.50, 'completed', 'paypal', now() - interval '30 days', now() - interval '28 days'),
('792d4939-fab9-4e22-87a6-0c93423753a8', 98.20, 'completed', 'bank_transfer', now() - interval '60 days', now() - interval '58 days');