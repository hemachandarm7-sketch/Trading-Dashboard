# 🗄️ ORBIT - Supabase Database Setup

Your credentials are configured. Now you need to create the database tables.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select project: **orbit-trading**
3. Left sidebar → **SQL Editor**
4. Click **+ New query**

## Step 2: Create Trades Table

Copy-paste this SQL:

```sql
-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('LONG', 'SHORT')),
  leverage INT NOT NULL DEFAULT 10,
  entry_price DECIMAL(20,8) NOT NULL,
  exit_price DECIMAL(20,8),
  current_price DECIMAL(20,8),
  real_margin DECIMAL(20,2) NOT NULL,
  size DECIMAL(20,2) NOT NULL,
  qty DECIMAL(20,8) NOT NULL,
  pnl DECIMAL(20,2),
  roi DECIMAL(10,4),
  roe DECIMAL(10,4),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'WIN', 'LOSS')),
  entry_time TIMESTAMP WITH TIME ZONE,
  exit_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see their own trades
CREATE POLICY "Users can view own trades"
ON trades FOR SELECT
USING (auth.uid() = user_id);

-- Create RLS policy: Users can insert their own trades
CREATE POLICY "Users can insert own trades"
ON trades FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create RLS policy: Users can update their own trades
CREATE POLICY "Users can update own trades"
ON trades FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policy: Users can delete their own trades
CREATE POLICY "Users can delete own trades"
ON trades FOR DELETE
USING (auth.uid() = user_id);
```

Click **Run** button

## Step 3: Create Screenshots Table

```sql
-- Create screenshots table
CREATE TABLE IF NOT EXISTS screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT,
  extracted_text TEXT,
  parsed_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON screenshots(user_id);

-- Enable RLS
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for screenshots
CREATE POLICY "Users can view own screenshots"
ON screenshots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own screenshots"
ON screenshots FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own screenshots"
ON screenshots FOR DELETE
USING (auth.uid() = user_id);
```

Click **Run** button

## Step 4: Verify Tables Created

1. Left sidebar → **Tables**
2. You should see:
   - ✅ `trades` table
   - ✅ `screenshots` table

## Step 5: Test Connection

The dashboard will auto-connect when you:
1. Upload a screenshot (for anonymous users)
2. Sign up with email (creates user account)
3. Sign in to existing account

---

## 🧪 Test Data (Optional)

To test with sample data:

```sql
-- Insert sample trade
INSERT INTO trades (
  user_id, symbol, position, leverage,
  entry_price, exit_price, real_margin, size, qty,
  pnl, roi, status
)
SELECT
  auth.uid(),
  'RARE/USDT',
  'SHORT',
  10,
  0.02270,
  0.01795,
  18.31,
  183.10,
  8073,
  38.26,
  209.00,
  'WIN'
WHERE auth.uid() IS NOT NULL;
```

---

## ✅ Next: Enable Authentication

1. Left sidebar → **Authentication**
2. Click **Providers**
3. Enable:
   - ✅ Email (already enabled)
   - ⭕ Google (optional)
   - ⭕ GitHub (optional)

---

## 🔗 Files Ready

Your dashboard connects via:
- `supabase-client.js` ← Handles all database operations
- `.env.local` ← Your credentials (protected from git)
- `index.html` ← Loads and uses Supabase client

---

## 📊 How It Works

1. **Upload Screenshot** → OCR extracts data
2. **Click "Add to Trades"** → Data saved to Supabase
3. **Refresh Dashboard** → Trades load from database
4. **Multi-device** → Same account sees same trades everywhere

---

## 🐛 Troubleshooting

### Tables not created?
- Check for error messages in SQL Editor
- Make sure you clicked **Run** button

### "User not authenticated"?
- You need to sign up/sign in first
- Anonymous users (no auth) can't access RLS-protected tables

### Can't see trades after saving?
- Make sure user is signed in
- Check browser console for errors
- Verify RLS policies are enabled

### Credentials not working?
- Check `.env.local` file exists
- Make sure values are copied exactly (no extra spaces)
- Refresh page and try again

---

## 📱 Testing Flow

1. Go to dashboard: https://hemachandarm7-sketch.github.io/Trading-Dashboard/
2. Click **Upload** tab
3. Upload CoinDCX screenshot
4. OCR extracts data → Click **"Add to Trades"**
5. Trade appears in **Trades** tab AND saved to Supabase
6. Refresh page → Trade still there (loaded from database)
7. Open on different device with same account → Same trade visible

---

## ✨ You're Ready!

- ✅ Supabase project created
- ✅ Tables created
- ✅ RLS policies enabled
- ✅ Credentials configured
- ✅ Dashboard connected

**Start uploading trades!** 🚀

---

Need help? Check:
- Supabase docs: https://supabase.com/docs
- Dashboard logs: Press F12 → Console tab
- GitHub issues: https://github.com/hemachandarm7-sketch/Trading-Dashboard/issues
