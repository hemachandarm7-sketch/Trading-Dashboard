/**
 * ORBIT Dashboard - Supabase Client
 * Handles all database operations for trades, screenshots, and auth
 * 
 * Requires:
 * - @supabase/supabase-js loaded in HTML
 * - .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */

// Initialize Supabase client
const supabaseUrl = 'https://hqjdcqofotscnhuppqgd.supabase.co';
const supabaseKey = 'sb_publishable_L1EgmZf6JURBj9Uggoisrg_tHNYAib';

const { createClient } = window.supabase;

let supabaseClient = null;
let currentUserId = null;

/**
 * Initialize Supabase connection
 */
async function initSupabase() {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase initialized');
    
    // Check if user is logged in
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      currentUserId = session.user.id;
      console.log('👤 User logged in:', currentUserId);
      return true;
    } else {
      console.log('📝 No user logged in - using anonymous');
      return false;
    }
  } catch (err) {
    console.error('❌ Supabase init failed:', err);
    return false;
  }
}

/**
 * Load all trades from database
 */
async function loadTradesFromDatabase() {
  if (!supabaseClient) {
    console.warn('Supabase not initialized');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error loading trades:', error);
      return null;
    }

    console.log('✅ Loaded', data.length, 'trades from database');
    return data;
  } catch (err) {
    console.error('Load trades error:', err);
    return null;
  }
}

/**
 * Save a single trade to database
 */
async function saveTradeToDatabase(tradeData) {
  if (!supabaseClient || !currentUserId) {
    console.warn('Supabase not ready or user not logged in');
    return null;
  }

  try {
    // Determine status
    let status = 'OPEN';
    if (tradeData.exit_price && tradeData.pnl) {
      status = tradeData.pnl > 0 ? 'WIN' : 'LOSS';
    }

    const payload = {
      user_id: currentUserId,
      symbol: tradeData.symbol,
      position: tradeData.position || 'LONG',
      leverage: tradeData.leverage || 10,
      entry_price: tradeData.entry,
      exit_price: tradeData.exit || null,
      current_price: tradeData.current || null,
      real_margin: tradeData.margin || tradeData.realCapital,
      size: tradeData.size || tradeData.notional,
      qty: tradeData.qty,
      pnl: tradeData.pnl,
      roi: tradeData.roi || ((tradeData.pnl / tradeData.margin) * 100),
      roe: tradeData.roe || null,
      status: status,
      entry_time: tradeData.entry_time || new Date().toISOString(),
      exit_time: tradeData.exit_time || null,
    };

    const { data, error } = await supabaseClient
      .from('trades')
      .insert([payload])
      .select();

    if (error) {
      console.error('❌ Error saving trade:', error);
      return null;
    }

    console.log('✅ Trade saved:', data[0]);
    return data[0];
  } catch (err) {
    console.error('Save trade error:', err);
    return null;
  }
}

/**
 * Update existing trade
 */
async function updateTradeInDatabase(tradeId, updates) {
  if (!supabaseClient) {
    console.warn('Supabase not initialized');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('trades')
      .update(updates)
      .eq('id', tradeId)
      .select();

    if (error) {
      console.error('❌ Error updating trade:', error);
      return null;
    }

    console.log('✅ Trade updated:', data[0]);
    return data[0];
  } catch (err) {
    console.error('Update trade error:', err);
    return null;
  }
}

/**
 * Delete trade from database
 */
async function deleteTradeFromDatabase(tradeId) {
  if (!supabaseClient) {
    console.warn('Supabase not initialized');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('trades')
      .delete()
      .eq('id', tradeId);

    if (error) {
      console.error('❌ Error deleting trade:', error);
      return false;
    }

    console.log('✅ Trade deleted:', tradeId);
    return true;
  } catch (err) {
    console.error('Delete trade error:', err);
    return false;
  }
}

/**
 * Save screenshot record
 */
async function saveScreenshotRecord(file, extractedText, parsedData) {
  if (!supabaseClient || !currentUserId) {
    console.warn('Supabase not ready');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('screenshots')
      .insert([{
        user_id: currentUserId,
        file_path: file.name,
        extracted_text: extractedText,
        parsed_data: parsedData,
        status: 'success'
      }])
      .select();

    if (error) {
      console.error('❌ Error saving screenshot:', error);
      return null;
    }

    console.log('✅ Screenshot saved:', data[0].id);
    return data[0];
  } catch (err) {
    console.error('Save screenshot error:', err);
    return null;
  }
}

/**
 * Populate trades table UI from database
 */
async function populateTradesFromDatabase() {
  const trades = await loadTradesFromDatabase();
  
  if (!trades) {
    console.warn('No trades loaded from database');
    return;
  }

  // Separate closed and open trades
  const closedTrades = trades.filter(t => t.status === 'WIN' || t.status === 'LOSS');
  const openTrades = trades.filter(t => t.status === 'OPEN');

  // Clear existing trades UI
  const tradesTab = document.getElementById('trades-tab');
  if (tradesTab) {
    tradesTab.innerHTML = '<div style="margin-bottom:20px"></div>';
  }

  // Add closed trades
  if (closedTrades.length > 0) {
    const header = document.createElement('h3');
    header.style.cssText = 'font-size:16px;margin-bottom:14px;margin-top:0;font-weight:600;color:var(--mut);text-transform:uppercase';
    header.textContent = `Closed Trades (${closedTrades.length})`;
    tradesTab.appendChild(header);

    closedTrades.forEach(trade => {
      const row = createTradeRow(trade);
      tradesTab.appendChild(row);
    });
  }

  // Add open trades
  if (openTrades.length > 0) {
    const header = document.createElement('h3');
    header.style.cssText = 'font-size:16px;margin-bottom:14px;margin-top:24px;font-weight:600;color:var(--mut);text-transform:uppercase';
    header.textContent = `Open Positions (${openTrades.length})`;
    tradesTab.appendChild(header);

    openTrades.forEach(trade => {
      const row = createTradeRow(trade);
      tradesTab.appendChild(row);
    });
  }

  console.log(`✅ Populated UI with ${closedTrades.length} closed + ${openTrades.length} open trades`);
}

/**
 * Create trade row HTML element
 */
function createTradeRow(trade) {
  const row = document.createElement('div');
  row.className = 'trade-row';
  
  const pnlClass = trade.pnl >= 0 ? 'gain' : 'loss';
  const pnlSign = trade.pnl >= 0 ? '+' : '';
  
  row.innerHTML = `
    <div class="trade-field">
      <div class="trade-field-label">Symbol</div>
      <div class="trade-field-value">${trade.symbol}</div>
      <div class="trade-tag">${trade.position} ${trade.leverage}x</div>
    </div>
    <div class="trade-field">
      <div class="trade-field-label">${trade.status === 'OPEN' ? 'Entry / Current' : 'Entry / Exit'}</div>
      <div class="trade-field-value">${trade.entry_price.toFixed(6)} → ${(trade.current_price || trade.exit_price || 0).toFixed(6)}</div>
      <div class="trade-field-label" style="margin-top:8px">P&L</div>
      <div class="trade-field-value ${pnlClass}">${pnlSign}$${trade.pnl.toFixed(2)} (${trade.roi?.toFixed(2) || '0'}%)</div>
    </div>
  `;
  
  return row;
}

/**
 * Authentication Functions
 */

async function signUpUser(email, password, displayName) {
  if (!supabaseClient) return false;

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName }
      }
    });

    if (error) {
      console.error('❌ Sign up error:', error);
      return false;
    }

    currentUserId = data.user.id;
    console.log('✅ User signed up:', email);
    return true;
  } catch (err) {
    console.error('Sign up error:', err);
    return false;
  }
}

async function signInUser(email, password) {
  if (!supabaseClient) return false;

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Sign in error:', error);
      return false;
    }

    currentUserId = data.user.id;
    console.log('✅ User signed in:', email);
    return true;
  } catch (err) {
    console.error('Sign in error:', err);
    return false;
  }
}

async function signOutUser() {
  if (!supabaseClient) return false;

  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
      return false;
    }

    currentUserId = null;
    console.log('✅ User signed out');
    return true;
  } catch (err) {
    console.error('Sign out error:', err);
    return false;
  }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌌 ORBIT Dashboard - Supabase Integration');
  await initSupabase();
  
  // Optionally load trades from DB on startup
  // Uncomment to enable:
  // await populateTradesFromDatabase();
});

// Export functions for use in other scripts
window.orbitSupabase = {
  initSupabase,
  loadTradesFromDatabase,
  saveTradeToDatabase,
  updateTradeInDatabase,
  deleteTradeFromDatabase,
  saveScreenshotRecord,
  populateTradesFromDatabase,
  signUpUser,
  signInUser,
  signOutUser,
  getClient: () => supabaseClient,
  getUserId: () => currentUserId
};
