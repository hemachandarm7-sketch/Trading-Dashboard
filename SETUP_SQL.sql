-- ============================================
-- ORBIT Dashboard - Database Setup
-- Copy everything below and paste into Supabase SQL Editor
-- Then click RUN button
-- ============================================

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('LONG', 'SHORT')),
  leverage INT NOT NULL DEFAULT 10,
  entry_price NUMERIC(20,8) NOT NULL,
  exit_price NUMERIC(20,8),
  current_price NUMERIC(20,8),
  real_margin NUMERIC(20,2) NOT NULL,
  size NUMERIC(20,2) NOT NULL,
  qty NUMERIC(20,8) NOT NULL,
  pnl NUMERIC(20,2),
  roi NUMERIC(10,4),
  roe NUMERIC(10,4),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'WIN', 'LOSS')),
  entry_time TIMESTAMP WITH TIME ZONE,
  exit_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trades
CREATE POLICY "Users can view own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trades FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trades FOR DELETE USING (auth.uid() = user_id);

-- ============================================

-- Create screenshots table
CREATE TABLE IF NOT EXISTS public.screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT,
  extracted_text TEXT,
  parsed_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON public.screenshots(user_id);

-- Enable Row Level Security
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for screenshots
CREATE POLICY "Users can view own screenshots" ON public.screenshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own screenshots" ON public.screenshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own screenshots" ON public.screenshots FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ✅ Setup Complete!
-- Tables created:
--   ✓ trades       - Store all trading data
--   ✓ screenshots  - Store screenshot metadata
-- ============================================
