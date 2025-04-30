-- Create schema for trading journal

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Instruments table
CREATE TABLE instruments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  broker TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategies table
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  instrument_id UUID REFERENCES instruments NOT NULL,
  account_id UUID REFERENCES accounts NOT NULL,
  strategy_id UUID REFERENCES strategies NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  qty NUMERIC NOT NULL,
  entry_px NUMERIC NOT NULL,
  stop_px NUMERIC NOT NULL,
  take_px NUMERIC NOT NULL,
  notes TEXT,
  risk_total NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN direction = 'long' THEN (entry_px - stop_px) * qty
      ELSE (stop_px - entry_px) * qty
    END
  ) STORED,
  reward_total NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN direction = 'long' THEN (take_px - entry_px) * qty
      ELSE (entry_px - take_px) * qty
    END
  ) STORED,
  r_multiple NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN direction = 'long' AND (entry_px - stop_px) > 0 THEN (take_px - entry_px) / (entry_px - stop_px)
      WHEN direction = 'short' AND (stop_px - entry_px) > 0 THEN (entry_px - take_px) / (stop_px - entry_px)
      ELSE 0
    END
  ) STORED,
  status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (SELECT COALESCE(SUM(qty), 0) FROM trade_closures WHERE trade_id = trades.id) = 0 THEN 'open'
      WHEN (SELECT COALESCE(SUM(qty), 0) FROM trade_closures WHERE trade_id = trades.id) < qty THEN 'partial'
      ELSE 'closed'
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trade closures table
CREATE TABLE trade_closures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID REFERENCES trades NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  qty NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  fee NUMERIC DEFAULT 0,
  closure_type TEXT DEFAULT 'normal' CHECK (closure_type IN ('normal', 'stopped', 'target')),
  pl NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN (SELECT direction FROM trades WHERE id = trade_id) = 'long' THEN (price - (SELECT entry_px FROM trades WHERE id = trade_id)) * qty
      ELSE ((SELECT entry_px FROM trades WHERE id = trade_id) - price) * qty
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal weeks table
CREATE TABLE journal_weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  weekly_plan TEXT,
  weekly_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal days table
CREATE TABLE journal_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id UUID REFERENCES journal_weeks NOT NULL,
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  daily_plan TEXT,
  daily_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week_id, date)
);

-- Create views for statistics
CREATE VIEW v_daily_stats AS
SELECT 
  t.user_id,
  DATE_TRUNC('day', t.opened_at) AS trade_date,
  COUNT(*) AS total_trades,
  SUM(CASE WHEN tc.pl > 0 THEN 1 ELSE 0 END) AS winning_trades,
  SUM(CASE WHEN tc.pl < 0 THEN 1 ELSE 0 END) AS losing_trades,
  SUM(tc.pl) AS total_pl,
  AVG(t.r_multiple) AS avg_r_multiple
FROM trades t
LEFT JOIN trade_closures tc ON t.id = tc.trade_id
GROUP BY t.user_id, DATE_TRUNC('day', t.opened_at);

CREATE VIEW v_weekly_stats AS
SELECT 
  t.user_id,
  DATE_TRUNC('week', t.opened_at) AS trade_week,
  COUNT(*) AS total_trades,
  SUM(CASE WHEN tc.pl > 0 THEN 1 ELSE 0 END) AS winning_trades,
  SUM(CASE WHEN tc.pl < 0 THEN 1 ELSE 0 END) AS losing_trades,
  SUM(tc.pl) AS total_pl,
  AVG(t.r_multiple) AS avg_r_multiple
FROM trades t
LEFT JOIN trade_closures tc ON t.id = tc.trade_id
GROUP BY t.user_id, DATE_TRUNC('week', t.opened_at);

-- Function to update unrealized P/L
CREATE OR REPLACE FUNCTION update_unrealized_pl()
RETURNS TRIGGER AS $$
BEGIN
  -- Logic to update unrealized P/L would go here
  -- This is a placeholder for the actual implementation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Row-Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_days ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Accounts policies
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Strategies policies
CREATE POLICY "Users can view their own strategies"
  ON strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strategies"
  ON strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies"
  ON strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies"
  ON strategies FOR DELETE
  USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view their own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- Trade closures policies
CREATE POLICY "Users can view their own trade closures"
  ON trade_closures FOR SELECT
  USING ((SELECT user_id FROM trades WHERE id = trade_id) = auth.uid());

CREATE POLICY "Users can insert their own trade closures"
  ON trade_closures FOR INSERT
  WITH CHECK ((SELECT user_id FROM trades WHERE id = trade_id) = auth.uid());

CREATE POLICY "Users can update their own trade closures"
  ON trade_closures FOR UPDATE
  USING ((SELECT user_id FROM trades WHERE id = trade_id) = auth.uid());

CREATE POLICY "Users can delete their own trade closures"
  ON trade_closures FOR DELETE
  USING ((SELECT user_id FROM trades WHERE id = trade_id) = auth.uid());

-- Journal weeks policies
CREATE POLICY "Users can view their own journal weeks"
  ON journal_weeks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal weeks"
  ON journal_weeks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal weeks"
  ON journal_weeks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal weeks"
  ON journal_weeks FOR DELETE
  USING (auth.uid() = user_id);

-- Journal days policies
CREATE POLICY "Users can view their own journal days"
  ON journal_days FOR SELECT
  USING ((SELECT user_id FROM journal_weeks WHERE id = week_id) = auth.uid());

CREATE POLICY "Users can insert their own journal days"
  ON journal_days FOR INSERT
  WITH CHECK ((SELECT user_id FROM journal_weeks WHERE id = week_id) = auth.uid());

CREATE POLICY "Users can update their own journal days"
  ON journal_days FOR UPDATE
  USING ((SELECT user_id FROM journal_weeks WHERE id = week_id) = auth.uid());

CREATE POLICY "Users can delete their own journal days"
  ON journal_days FOR DELETE
  USING ((SELECT user_id FROM journal_weeks WHERE id = week_id) = auth.uid());

-- Instruments are shared across all users
CREATE POLICY "All users can view instruments"
  ON instruments FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify instruments
CREATE POLICY "Only admins can insert instruments"
  ON instruments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

CREATE POLICY "Only admins can update instruments"
  ON instruments FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

CREATE POLICY "Only admins can delete instruments"
  ON instruments FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));
