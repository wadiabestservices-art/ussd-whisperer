-- Add columns to support multi-level USSD codes
ALTER TABLE public.ussd_codes 
ADD COLUMN IF NOT EXISTS levels jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS current_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS session_data jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.ussd_codes.levels IS 'Array of USSD code levels/steps';
COMMENT ON COLUMN public.ussd_codes.current_level IS 'Current step in the USSD flow';
COMMENT ON COLUMN public.ussd_codes.session_data IS 'Data collected during USSD session';

-- Insert 10 sample multi-level USSD codes
INSERT INTO public.ussd_codes (name, code, description, status, levels) VALUES
('Check Balance - Multi Step', '*123*1#', 'Multi-level balance inquiry with account selection', 'pending', '[
  {"step": 1, "prompt": "Select Account: 1-Savings 2-Current", "code": "*123*1#"},
  {"step": 2, "prompt": "Enter PIN:", "code": "*123*1*{input}#"},
  {"step": 3, "prompt": "Confirm transaction", "code": "*123*1*{input}*1#"}
]'::jsonb),

('Mobile Data Bundle', '*131*1#', 'Purchase data bundle in multiple steps', 'pending', '[
  {"step": 1, "prompt": "Select Bundle: 1-Daily 2-Weekly 3-Monthly", "code": "*131*1#"},
  {"step": 2, "prompt": "Confirm purchase", "code": "*131*1*{input}#"}
]'::jsonb),

('Airtime Transfer', '*141*1#', 'Transfer airtime to another number', 'pending', '[
  {"step": 1, "prompt": "Enter recipient number:", "code": "*141*1#"},
  {"step": 2, "prompt": "Enter amount:", "code": "*141*1*{input}#"},
  {"step": 3, "prompt": "Enter PIN:", "code": "*141*1*{input}*{input2}#"}
]'::jsonb),

('Bill Payment', '*151#', 'Pay bills with multiple selections', 'pending', '[
  {"step": 1, "prompt": "1-Electricity 2-Water 3-Internet", "code": "*151#"},
  {"step": 2, "prompt": "Enter account number:", "code": "*151*{input}#"},
  {"step": 3, "prompt": "Enter amount:", "code": "*151*{input}*{input2}#"}
]'::jsonb),

('Bank Transfer', '*121*1#', 'Multi-step bank transfer', 'pending', '[
  {"step": 1, "prompt": "Select bank from list", "code": "*121*1#"},
  {"step": 2, "prompt": "Enter account number:", "code": "*121*1*{input}#"},
  {"step": 3, "prompt": "Enter amount:", "code": "*121*1*{input}*{input2}#"},
  {"step": 4, "prompt": "Enter PIN:", "code": "*121*1*{input}*{input2}*{input3}#"}
]'::jsonb),

('Loan Request', '*161#', 'Apply for mobile loan', 'pending', '[
  {"step": 1, "prompt": "Select loan amount", "code": "*161#"},
  {"step": 2, "prompt": "Select repayment period", "code": "*161*{input}#"},
  {"step": 3, "prompt": "Confirm loan terms", "code": "*161*{input}*{input2}#"}
]'::jsonb),

('Recharge Card', '*171#', 'Load recharge card', 'pending', '[
  {"step": 1, "prompt": "Enter 16-digit PIN:", "code": "*171#"},
  {"step": 2, "prompt": "Confirm recharge", "code": "*171*{input}#"}
]'::jsonb),

('Check Transaction History', '*181#', 'View account transactions', 'pending', '[
  {"step": 1, "prompt": "1-Last 5 2-Last 10 3-Date Range", "code": "*181#"},
  {"step": 2, "prompt": "Select account type", "code": "*181*{input}#"}
]'::jsonb),

('Mobile Insurance', '*191#', 'Subscribe to mobile insurance', 'pending', '[
  {"step": 1, "prompt": "Select plan: 1-Basic 2-Premium", "code": "*191#"},
  {"step": 2, "prompt": "Enter phone IMEI:", "code": "*191*{input}#"},
  {"step": 3, "prompt": "Confirm subscription", "code": "*191*{input}*{input2}#"}
]'::jsonb),

('Service Activation', '*201#', 'Activate premium services', 'pending', '[
  {"step": 1, "prompt": "1-Music 2-Video 3-Gaming", "code": "*201#"},
  {"step": 2, "prompt": "Select subscription period", "code": "*201*{input}#"},
  {"step": 3, "prompt": "Confirm activation", "code": "*201*{input}*{input2}#"}
]'::jsonb);