# 🗄️ ORBIT + Supabase Integration Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com → Sign up (free tier)
2. Create new project → Name it "orbit-trading"
3. Set password & wait for provisioning (~1 min)
4. In **Settings → API**, copy:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (Anon Key)

## Step 2: Create Database Tables

Copy-paste into **SQL Editor**:

```sql
-- Users table (auto-created by Supabase Auth)
-- We'll use Supabase Auth for users

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('LONG', 'SHORT')),
  leverage INT NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  exit_price DECIMAL(20,8),
  current_price DECIMAL(20,8),
  real_margin DECIMAL(20,2) NOT NULL,
  size DECIMAL(20,2) NOT NULL,
  qty DECIMAL(20,8) NOT NULL,
  pnl DECIMAL(20,2),
  roi DECIMAL(10,4),
  roe DECIMAL(10,4),
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED', 'WIN', 'LOSS')),
  entry_time TIMESTAMP WITH TIME ZONE,
  exit_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Screenshots table
CREATE TABLE screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT,
  extracted_text TEXT,
  parsed_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own trades"
ON trades FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own trades"
ON trades FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own trades"
ON trades FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own trades"
ON trades FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users see own screenshots"
ON screenshots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own screenshots"
ON screenshots FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Step 3: Enable Auth Methods

1. **Authentication → Providers**
2. Enable:
   - ✅ Email
   - ✅ Google (optional)
   - ✅ GitHub (optional)

## Step 4: Environment Setup

Create `.env.local` in repo root:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 5: Update Dashboard

You have 2 options:

### Option A: Simple Integration (Current ORBIT)
- Keep HTML/JS dashboard
- Add Supabase JS library
- Replace hardcoded data with DB queries
- Use Tesseract.js for OCR

### Option B: Full TypeScript (Recommended)
- Use the code from `/home/claude/crypto-trading-dashboard/`
- Has full OCR + Supabase integration
- Professional error handling
- Test coverage

---

## 🔌 Quick JavaScript Integration

Add to HTML `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
```

Add to JS:

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const { createClient } = supabase;

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fetch trades
async function loadTrades() {
  const { data, error } = await db
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) console.error(error);
  return data;
}

// Insert trade
async function saveTrade(tradeData) {
  const { data, error } = await db
    .from('trades')
    .insert([tradeData]);
  
  if (error) console.error(error);
  return data;
}
```

---

## 📸 OCR Integration (Tesseract.js)

Add to HTML `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/tesseract.js"></script>
```

Add to Upload tab:

```javascript
async function extractFromScreenshot(file) {
  const { createWorker } = Tesseract;
  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();
  
  // Parse extracted text for trade data
  const tradeData = parseTradeText(text);
  return tradeData;
}

function parseTradeText(text) {
  // Regex patterns to extract:
  // - Symbol, Entry, Exit, Margin, Qty, P&L, etc.
  const patterns = {
    symbol: /([A-Z]{3,}\/USDT)/,
    entry: /Entry[:\s]+([0-9.]+)/i,
    exit: /Exit[:\s]+([0-9.]+)/i,
    margin: /Margin[:\s]+([0-9.]+)/i,
    pnl: /P&L[:\s]+([+-]?[0-9.]+)/i
  };
  
  return {
    symbol: text.match(patterns.symbol)?.[1],
    entry: parseFloat(text.match(patterns.entry)?.[1]),
    exit: parseFloat(text.match(patterns.exit)?.[1]),
    realMargin: parseFloat(text.match(patterns.margin)?.[1]),
    pnl: parseFloat(text.match(patterns.pnl)?.[1])
  };
}
```

---

## 🚀 Production Checklist

- [ ] Supabase project created
- [ ] Tables created with RLS policies
- [ ] `.env.local` added (don't commit!)
- [ ] Test data inserted
- [ ] Auth tested (sign up/sign in)
- [ ] OCR tested with sample screenshot
- [ ] Trades sync confirmed
- [ ] Mobile responsive verified

---

## 📞 Support

If you get CORS errors, update `.env.local` with:
```
VITE_SUPABASE_CORS=true
```

Questions? Check Supabase docs: https://supabase.com/docs
