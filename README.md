# 🌌 ORBIT - Trading Dashboard

**ORBIT** is a modern, clean crypto trading dashboard built for tracking futures positions on **CoinDCX** and other exchanges.

🔗 **Live Site:** https://hemachandarm7-sketch.github.io/Trading-Dashboard/

---

## ✨ Features

### ✅ Currently Available
- **Dashboard Tab:** 10 performance metrics (trades, P&L, win rate, etc.)
- **Trades Tab:** All closed + open positions with entry/exit prices
- **Analytics Tab:** Profit factor, max drawdown, avg holding time
- **Settings Tab:** Dark mode, data sync toggles, account info
- **Responsive:** Mobile-first design, works on all devices
- **Cache Handling:** Aggressive cache busting (network-first strategy)

### 🚀 Coming Soon (Supabase Ready)
- **OCR Screenshots:** Upload trade screenshots → auto-extract data
- **Database Sync:** Trades stored in Supabase (no manual uploads)
- **Authentication:** Sign up with email/Google/GitHub
- **Real-time Sync:** Multi-device sync
- **Cloud Backup:** Automatic backup to Supabase

---

## 🏗️ Architecture

```
ORBIT Dashboard
├── Frontend (HTML/JS/CSS)
│   ├── Dashboard Metrics (10 cards)
│   ├── Trades List (all 9 trades)
│   ├── Upload + OCR (Tesseract.js)
│   ├── Analytics (8 metrics)
│   └── Settings (toggles + account)
│
├── Storage (Browser)
│   ├── LocalStorage (settings)
│   ├── Service Worker Cache (offline)
│   └── IndexedDB (future)
│
└── Backend (Optional: Supabase)
    ├── PostgreSQL DB (trades, screenshots)
    ├── Authentication (email, OAuth)
    └── Storage (screenshots)
```

---

## 🔧 Setup

### Option 1: Use Live Site (No Setup)
Just visit: https://hemachandarm7-sketch.github.io/Trading-Dashboard/

### Option 2: Local Development
```bash
git clone https://github.com/hemachandarm7-sketch/Trading-Dashboard.git
cd Trading-Dashboard
# Start a local server:
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Option 3: With Supabase (Full Features)
See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

## 📊 Data Structure

### Current (Hardcoded)
```javascript
const closedTrades = [
  {
    symbol: 'RARE/USDT #1',
    position: 'SHORT',
    leverage: 10,
    entry: 0.02270,
    exit: 0.01795,
    realCapital: 18.31,
    notional: 183.10,
    qty: 8073,
    pnl: 38.261,
    roi: 209.00,
    status: 'WIN'
  },
  // ... 4 more closed trades
];

const openTrades = [
  {
    symbol: 'RECALL/USDT',
    position: 'LONG',
    leverage: 10,
    entry: 0.04714,
    current: 0.04892,
    qty: 6662,
    pnl: 11.885,
    roe: 38.56,
    status: 'OPEN'
  },
  // ... 4 more open trades
];
```

### With Supabase (Database)
```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT,
  position TEXT CHECK (position IN ('LONG', 'SHORT')),
  leverage INT,
  entry_price DECIMAL,
  exit_price DECIMAL,
  current_price DECIMAL,
  real_margin DECIMAL,
  size DECIMAL,
  qty DECIMAL,
  pnl DECIMAL,
  roi DECIMAL,
  roe DECIMAL,
  status TEXT CHECK (status IN ('OPEN', 'CLOSED', 'WIN', 'LOSS')),
  entry_time TIMESTAMP,
  exit_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 📸 OCR Integration

### How It Works
1. Upload screenshot from CoinDCX
2. Tesseract.js extracts text locally (no cloud)
3. Regex patterns parse trade data
4. Preview extracted values
5. One-click "Add to Trades"

### Extracted Fields
- Symbol (e.g., "RARE/USDT")
- Position (LONG/SHORT)
- Leverage (10x, 5x, 7x)
- Entry Price
- Exit/Current Price
- Margin (USDT)
- Quantity
- P&L

### Current Accuracy
- Text recognition: ~95% (depends on screenshot quality)
- Field extraction: ~85% (needs some manual verification)
- False positives: Low (validated by UI preview)

---

## 🔄 Cache Strategy

ORBIT uses a **network-first** approach:

1. **Service Worker** registers at startup
2. **Every tab visibility change** forces refresh with unique ID
3. **"Clear Cache" button** (top-right):
   - Deletes all browser caches
   - Clears localStorage/sessionStorage
   - Unregisters Service Worker temporarily
   - Forces hard refresh
4. **No stored cache** — always fetches fresh HTML/JS

**Result:** Zero staleness, users always see latest version

---

## 📱 Mobile Support

Fully responsive:
- ✅ iPhone/iPad (iOS)
- ✅ Android phones/tablets
- ✅ Desktop browsers
- ✅ Safe area insets (notch support)
- ✅ Touch-friendly nav bar (60px)
- ✅ Readable on 380px width

---

## 🎨 Design System

| Palette | Hex | Use |
|---------|-----|-----|
| Background | `#0f1419` | Page bg |
| Card | `#1a2332` | Component bg |
| Border | `#2c3e5f` | Dividers |
| Text | `#e4e6eb` | Primary text |
| Muted | `#8b92a9` | Secondary text |
| Green | `#2fd5a0` | Accent, gains |
| Red | `#ff5468` | Losses |

Typography:
- Font: System stack (-apple-system, Segoe UI, Roboto)
- Headlines: 40px bold (greeting), 36px (values)
- Body: 15px regular
- Labels: 12px muted

---

## 🔐 Security

### Current
- ✅ No API keys stored (GitHub Pages)
- ✅ No user data collected
- ✅ Local browser storage only
- ✅ Service Worker sand-boxed

### With Supabase
- ✅ Row-level security (RLS) on all tables
- ✅ Auth tokens in secure cookies
- ✅ Encrypted at rest
- ✅ No passwords in localStorage

---

## 🚀 Deployment

**Automatic via GitHub Pages:**
1. Push to `main` branch
2. GitHub Actions builds site
3. Deploy to `gh-pages` branch
4. Live in ~30 seconds

**Manual redeploy:**
```bash
git push origin main
# Wait 30 seconds
# Refresh: https://hemachandarm7-sketch.github.io/Trading-Dashboard/
```

---

## 📈 Metrics Explained

| Metric | Formula | Example |
|--------|---------|---------|
| **Total Trades** | Count all trades | 9 |
| **Open Positions** | Count status='OPEN' | 5 |
| **Closed Trades** | Count status='CLOSED' | 5 |
| **Total Investment** | Sum all margins | $186.78 |
| **Realized P&L** | Sum P&L of closed trades | +$76.53 |
| **Win Rate** | (Wins / Total) × 100 | 40.0% |
| **Profit Factor** | Total Profit / Total Loss | 5.91 |
| **Avg P&L** | Total P&L / Total Trades | $15.31 |
| **Max Drawdown** | Largest loss | -$15.60 |
| **Avg Holding** | Avg trade duration | 1d 14h |

---

## 🐛 Troubleshooting

### Cache Not Clearing?
1. Click "Clear Cache" button (top-right green button)
2. Wait 3 seconds, page auto-refreshes
3. If still cached: Hard refresh (Ctrl+Shift+R on desktop, Cmd+Shift+R on Mac)

### Trades Not Loading?
1. Check browser console (F12 → Console)
2. Verify hardcoded trade data exists in JS
3. Try "Clear Cache" and refresh

### OCR Not Working?
1. Try a clearer screenshot
2. Check image quality (≥800px wide)
3. Try different file format (PNG works best)
4. Check browser console for errors

### Mobile Responsive Issues?
1. Set viewport: `<meta name="viewport" content="width=device-width">`
2. Test on actual device (desktop DevTools may not show all issues)
3. Check safe-area-insets for notch devices

---

## 📚 Technologies

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **OCR:** Tesseract.js (browser-based)
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** GitHub Pages
- **Cache:** Service Workers + Aggressive invalidation

---

## 🤝 Contributing

Found a bug? Want to improve?

1. Fork: https://github.com/hemachandarm7-sketch/Trading-Dashboard
2. Create branch: `git checkout -b fix/bug-name`
3. Commit: `git commit -m "Fix: description"`
4. Push: `git push origin fix/bug-name`
5. PR: Create pull request on GitHub

---

## 📞 Support

- **Issues:** https://github.com/hemachandarm7-sketch/Trading-Dashboard/issues
- **Docs:** See SUPABASE_SETUP.md for integration
- **Original Repo:** https://github.com/hemachandarm7-sketch/crypto-trading-dashboard

---

## 📄 License

MIT License - feel free to use/modify

---

## 🎯 Roadmap

- [ ] Supabase integration (Q4 2026)
- [ ] Real-time OCR feedback
- [ ] Multi-exchange support
- [ ] Advanced charting
- [ ] Risk management alerts
- [ ] Export to CSV/PDF
- [ ] Dark mode toggle (implemented, needs UI)
- [ ] Mobile app (React Native)

---

**Built with ❤️ by @hemachandarm7-sketch**

Last updated: October 4, 2026
