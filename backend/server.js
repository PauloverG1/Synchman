const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'admin2026';

// ─── DATABASE SETUP ─────────────────────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, 'synchrony.db'));

db.exec(`
  PRAGMA journal_mode=WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT 'AJ',
    member_since TEXT DEFAULT '2019',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type TEXT NOT NULL,
    number TEXT NOT NULL,
    balance REAL DEFAULT 0,
    apy REAL DEFAULT 0,
    interest_earned REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    account_id TEXT,
    description TEXT,
    amount REAL,
    type TEXT,
    category TEXT,
    date TEXT,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pending_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    account_id TEXT,
    type TEXT,
    amount REAL,
    description TEXT,
    date TEXT,
    status TEXT DEFAULT 'pending',
    tx_category TEXT DEFAULT 'banking',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    category TEXT,
    allocation_pct REAL DEFAULT 0,
    value REAL DEFAULT 0,
    color TEXT DEFAULT '#002B5B',
    ticker TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS investment_performance (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    since_inception TEXT DEFAULT '+10.3%',
    ytd_return TEXT DEFAULT '+8.4%',
    one_month_return TEXT DEFAULT '+1.2%',
    dividend_yield TEXT DEFAULT '$1,842.30',
    strategy TEXT DEFAULT 'Balanced Growth',
    rebalancing TEXT DEFAULT 'Quarterly',
    inception_date TEXT DEFAULT 'March 2019'
  );

  CREATE TABLE IF NOT EXISTS investment_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    icon TEXT DEFAULT '⬇',
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    amount_badge TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── SEED ────────────────────────────────────────────────────────────────────
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (userCount.c === 0) {
  const hash = bcrypt.hashSync('password123', 10);
  const userId = db.prepare(
    'INSERT INTO users (name, email, password_hash, avatar, member_since) VALUES (?, ?, ?, ?, ?)'
  ).run('Alex Johnson', 'alex@synchrony.com', hash, 'AJ', '2019').lastInsertRowid;

  db.prepare('INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?)').run('hys_1', userId, 'High Yield Savings', '•••• 8842', 142850, 3.30, 4712.50);
  db.prepare('INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?)').run('mma_1', userId, 'Money Market',        '•••• 3319',  28450, 2.95,  821.25);

  const ins = db.prepare('INSERT INTO transactions (user_id, account_id, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?, ?)');
  [
    ['Interest Payment',    392.60, 'credit', 'Interest',   '2026-08-01'],
    ['Wire Transfer In',   3000.00, 'credit', 'Income',     '2026-07-28'],
    ['Monthly Transfer',  -1000.00, 'debit',  'Transfer',   '2026-07-15'],
    ['Interest Payment',    389.50, 'credit', 'Interest',   '2026-07-01'],
    ['Direct Deposit',     5500.00, 'credit', 'Income',     '2026-06-30'],
    ['ATM Withdrawal',     -500.00, 'debit',  'Withdrawal', '2026-06-20'],
    ['Interest Payment',    381.20, 'credit', 'Interest',   '2026-06-01'],
    ['Wire Transfer In',   2000.00, 'credit', 'Income',     '2026-05-18'],
    ['Monthly Transfer',  -1500.00, 'debit',  'Transfer',   '2026-05-05'],
    ['Interest Payment',    372.10, 'credit', 'Interest',   '2026-05-01'],
    ['Direct Deposit',     6000.00, 'credit', 'Income',     '2026-04-28'],
    ['Inbound Wire',       3500.00, 'credit', 'Income',     '2026-04-10'],
  ].forEach(([desc, amt, type, cat, date]) => ins.run(userId, 'hys_1', desc, amt, type, cat, date));

  db.prepare('INSERT INTO pending_transactions (user_id, account_id, type, amount, description, date, status, tx_category, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(userId, 'hys_1', 'withdrawal', 2000, 'Rent payment wire', '2026-08-19', 'pending', 'banking', 'Client requested wire transfer');
  db.prepare('INSERT INTO pending_transactions (user_id, account_id, type, amount, description, date, status, tx_category, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(userId, 'mma_1', 'deposit', 1500, 'Savings transfer', '2026-08-18', 'pending', 'banking', 'Monthly savings');

  const ii = db.prepare('INSERT INTO investments (user_id, name, category, allocation_pct, value, color, ticker) VALUES (?, ?, ?, ?, ?, ?, ?)');
  [
    ['S&P 500 ETF',         'equity',        35.0, 31575, '#002B5B', 'VOO'],
    ['US Treasury Bonds',   'bond',          20.0, 18043, '#3B82F6', 'VGLT'],
    ['Real Estate ETF',     'real_estate',   15.0, 13532, '#F97316', 'VNQ'],
    ['International ETF',   'international', 15.0, 13532, '#8B5CF6', 'VXUS'],
    ['Bitcoin ETF',         'crypto',        10.0,  9022, '#F7931A', 'IBIT'],
    ['Ethereum ETF',        'crypto',         5.0,  4511, '#627EEA', 'ETHA'],
  ].forEach(([name, cat, pct, val, color, ticker]) => ii.run(userId, name, cat, pct, val, color, ticker));

  console.log('✅ Database seeded — login: alex@synchrony.com / password123');
}

// Ensure all users have investment_performance and default activities
try {
  const allUsersList = db.prepare('SELECT id, member_since FROM users').all();
  allUsersList.forEach(u => {
    const perf = db.prepare('SELECT user_id FROM investment_performance WHERE user_id = ?').get(u.id);
    if (!perf) {
      db.prepare(`INSERT OR IGNORE INTO investment_performance (user_id, since_inception, ytd_return, one_month_return, dividend_yield, strategy, rebalancing, inception_date) 
        VALUES (?, '+10.3%', '+8.4%', '+1.2%', '$1,842.30', 'Balanced Growth', 'Quarterly', ?)`).run(u.id, `March ${u.member_since || '2019'}`);
    }
    const actCount = db.prepare('SELECT COUNT(*) as c FROM investment_activities WHERE user_id = ?').get(u.id).c;
    if (actCount === 0) {
      const insAct = db.prepare('INSERT INTO investment_activities (user_id, icon, title, subtitle, amount_badge) VALUES (?, ?, ?, ?, ?)');
      insAct.run(u.id, '⬇', 'Quarterly Rebalance', 'Aug 1, 2026 · Auto · Completed', 'Rebalanced');
      insAct.run(u.id, '💰', 'Dividend Reinvestment', 'Jul 15, 2026 · Auto · Completed', '+$392.60');
      insAct.run(u.id, '₿', 'BTC ETF Purchase', 'Jul 3, 2026 · Auto · Completed', '+$450.00');
      insAct.run(u.id, '⬇', 'Dividend Reinvestment', 'Jun 15, 2026 · Auto · Completed', '+$381.20');
    }
  });
} catch(e){ console.error('Perf setup error:', e); }


// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'synchrony-secret-2026-xKq9',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
}));

const staticOptions = { maxAge: '1d', index: false };
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Serve root marketing static files (images, css, js, fonts, pages, sections)
const rootDir = path.join(__dirname, '..');
app.use('/css', express.static(path.join(rootDir, 'css'), staticOptions));
app.use('/js', express.static(path.join(rootDir, 'js'), staticOptions));
app.use('/images', express.static(path.join(rootDir, 'images'), staticOptions));
app.use('/fonts', express.static(path.join(rootDir, 'fonts'), staticOptions));
app.use('/pages', express.static(path.join(rootDir, 'pages'), staticOptions));
app.use('/banking', express.static(path.join(rootDir, 'banking'), staticOptions));
app.use('/business', express.static(path.join(rootDir, 'business'), staticOptions));
app.use('/carecredit', express.static(path.join(rootDir, 'carecredit'), staticOptions));
app.use('/prequalify', express.static(path.join(rootDir, 'prequalify'), staticOptions));

// Marketing static pages
app.get('/carecredit.html', (req, res) => res.sendFile(path.join(rootDir, 'carecredit.html')));
app.get('/jpluxury.html', (req, res) => res.sendFile(path.join(rootDir, 'jpluxury.html')));
app.get('/prequalify.html', (req, res) => res.sendFile(path.join(rootDir, 'prequalify.html')));
app.get('/home', (req, res) => res.sendFile(path.join(rootDir, 'Mainindex.html')));
app.get('/main', (req, res) => res.sendFile(path.join(rootDir, 'Mainindex.html')));
app.get('/Mainindex.html', (req, res) => res.sendFile(path.join(rootDir, 'Mainindex.html')));

// ─── AUTH GUARDS ─────────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
};
const requireAdmin = (req, res, next) => {
  if (!req.session.isAdmin) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// ─── USER AUTH ────────────────────────────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.json({ success: false, message: 'Invalid email or password' });
  }
  req.session.userId = user.id;
  req.session.userName = user.name;
  res.json({ success: true, redirect: '/dashboard' });
});

app.post('/auth/logout', (req, res) => {
  req.session.userId = null;
  req.session.userName = null;
  res.json({ success: true });
});

app.get('/auth/me', (req, res) => {
  if (!req.session.userId) return res.json({ authenticated: false });
  res.json({ authenticated: true, name: req.session.userName });
});

// ─── MAIN ROUTES ──────────────────────────────────────────────────────────────
// Root URL serves the main marketing page with full info
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'Mainindex.html'));
});

// Client Banking Dashboard
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/portal', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ─── DASHBOARD API ────────────────────────────────────────────────────────────
app.get('/api/dashboard', requireAuth, (req, res) => {
  const uid = req.session.userId;
  const user = db.prepare('SELECT id, name, email, avatar, member_since FROM users WHERE id = ?').get(uid);
  const accounts = db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(uid);

  // Use actual status column as display_status — 'completed','approved','rejected'
  const completed = db.prepare('SELECT *, status as display_status FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 20').all(uid);

  // Only show truly PENDING from pending_transactions (rejected ones now appear in transactions)
  const pendingRows = db.prepare("SELECT * FROM pending_transactions WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC").all(uid);
  const pendingMapped = pendingRows.map(p => ({
    id: 'pending_' + p.id,
    user_id: p.user_id,
    account_id: p.account_id,
    description: p.description,
    amount: p.type === 'deposit' ? p.amount : -p.amount,
    type: p.type === 'deposit' ? 'credit' : 'debit',
    category: p.tx_category === 'investment' ? 'Investment' : 'Transfer',
    date: p.date,
    display_status: 'pending'
  }));

  // Merge and sort newest first, cap at 20
  const allTxns = [...completed, ...pendingMapped]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  const investments = db.prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY allocation_pct DESC').all(uid);
  const performance = db.prepare('SELECT * FROM investment_performance WHERE user_id = ?').get(uid) || {
    since_inception: '+10.3%',
    ytd_return: '+8.4%',
    one_month_return: '+1.2%',
    dividend_yield: '$1,842.30',
    strategy: 'Balanced Growth',
    rebalancing: 'Quarterly',
    inception_date: `March ${user.member_since || '2019'}`
  };
  const activities = db.prepare('SELECT * FROM investment_activities WHERE user_id = ? ORDER BY id DESC').all(uid);

  res.json({
    user: { ...user, memberSince: user.member_since },
    accounts,
    transactions: allTxns,
    investments,
    investment_performance: performance,
    investment_activities: activities
  });
});

app.get('/api/investments', requireAuth, (req, res) => {
  const uid = req.session.userId;
  const investments = db.prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY allocation_pct DESC').all(uid);
  const totalValue = investments.reduce((s, i) => s + i.value, 0);
  res.json({ investments, totalValue });
});

app.post('/api/investment/request', requireAuth, (req, res) => {
  const { type, amount, notes, tx_category } = req.body;
  const uid = req.session.userId;
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO pending_transactions (user_id, account_id, type, amount, description, date, status, tx_category, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uid, 'invest_1', type, parseFloat(amount) || 0, type === 'deposit' ? 'Crypto investment deposit' : 'Investment withdrawal', today, 'pending', tx_category || 'investment', notes || '');
  res.json({ success: true });
});

// Transfer submit — creates a pending withdrawal in admin
app.post('/api/transfer/submit', requireAuth, (req, res) => {
  const { recipientName, bankName, accountNumber, routingNumber, fromAccount, amount, transferType, scheduledDate, memo } = req.body;
  const uid = req.session.userId;
  const today = new Date().toISOString().split('T')[0];
  const sendDate = scheduledDate || today;
  // Title-case helper — capitalises first letter of every word
  const tc = s => (s || '').replace(/\b\w/g, c => c.toUpperCase());
  // Short type labels for the user-facing description
  const shortType = { 'Standard ACH': 'Standard ACH', 'Same Day ACH': 'Same Day ACH', 'Wire Transfer': 'Wire Transfer' };
  const typeLabel = shortType[transferType] || 'Transfer';
  const fees = { 'Standard ACH': 0, 'Same Day ACH': 2.50, 'Wire Transfer': 25.00 };
  const fee = fees[transferType] || 0;
  const totalAmount = parseFloat(amount) + fee;
  const acctId = fromAccount === 'mma' ? 'mma_1' : 'hys_1';
  // Short description: "Wire Transfer to Poli Sins · Bank: Grey Win"
  const shortDesc = `${typeLabel} to ${tc(recipientName)} · Bank: ${tc(bankName)}`;

  // Full details stored in notes for admin view only
  const notes = [
    `To: ${recipientName}`,
    `Bank: ${bankName}`,
    `Acct: ****${(accountNumber||'').slice(-4)}`,
    `Routing: ${routingNumber}`,
    `Type: ${typeLabel}`,
    fee > 0 ? `Fee: $${fee.toFixed(2)}` : 'Fee: Free',
    memo ? `Memo: ${memo}` : null,
    scheduledDate ? `Scheduled: ${scheduledDate}` : null
  ].filter(Boolean).join(' | ');
  db.prepare('INSERT INTO pending_transactions (user_id, account_id, type, amount, description, date, status, tx_category, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uid, acctId, 'withdrawal', totalAmount, shortDesc, sendDate, 'pending', 'banking', notes);
  res.json({ success: true });
});

// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.post('/admin/auth/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Incorrect password' });
  }
});

app.post('/admin/auth/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ success: true });
});

app.get('/admin/auth/me', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

// ─── ADMIN API ────────────────────────────────────────────────────────────────

// All users list
app.get('/admin/api/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, email, avatar, member_since, created_at FROM users').all();
  const result = users.map(u => {
    const accounts = db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(u.id);
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const investments = db.prepare('SELECT * FROM investments WHERE user_id = ?').all(u.id);
    const totalInvested = investments.reduce((s, i) => s + i.value, 0);
    const pendingCount = db.prepare("SELECT COUNT(*) as c FROM pending_transactions WHERE user_id = ? AND status = 'pending'").get(u.id).c;
    return { ...u, accounts, totalBalance, totalInvested, pendingCount };
  });
  res.json(result);
});

// Single user detail
app.get('/admin/api/user/:id', requireAdmin, (req, res) => {
  const uid = parseInt(req.params.id, 10);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const accounts = db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(uid);
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC').all(uid);
  const pending = db.prepare('SELECT * FROM pending_transactions WHERE user_id = ? ORDER BY created_at DESC').all(uid);
  const investments = db.prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY allocation_pct DESC').all(uid);
  const performance = db.prepare('SELECT * FROM investment_performance WHERE user_id = ?').get(uid) || {
    since_inception: '+10.3%',
    ytd_return: '+8.4%',
    one_month_return: '+1.2%',
    dividend_yield: '$1,842.30',
    strategy: 'Balanced Growth',
    rebalancing: 'Quarterly',
    inception_date: `March ${user.member_since || '2019'}`
  };
  const activities = db.prepare('SELECT * FROM investment_activities WHERE user_id = ? ORDER BY id DESC').all(uid);
  res.json({ user, accounts, transactions, pending, investments, performance, activities });
});


// Create new client user
app.post('/admin/api/user/create', requireAdmin, (req, res) => {
  const { name, email, password, memberSince, hysBalance, mmaBalance, investBalance } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A client with this email already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const initials = name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CL';
  const year = (memberSince || '').toString().trim() || new Date().getFullYear().toString();

  const userId = db.prepare(
    'INSERT INTO users (name, email, password_hash, avatar, member_since) VALUES (?, ?, ?, ?, ?)'
  ).run(name.trim(), email.trim().toLowerCase(), hash, initials, year).lastInsertRowid;

  const rand4 = () => Math.floor(1000 + Math.random() * 9000).toString();
  const hysVal = parseFloat(hysBalance) || 0;
  const mmaVal = parseFloat(mmaBalance) || 0;
  const invVal = parseFloat(investBalance) || 0;

  // Create accounts
  db.prepare('INSERT INTO accounts (id, user_id, type, number, balance, apy, interest_earned) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(`hys_${userId}`, userId, 'High Yield Savings', `•••• ${rand4()}`, hysVal, 3.30, 0);

  db.prepare('INSERT INTO accounts (id, user_id, type, number, balance, apy, interest_earned) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(`mma_${userId}`, userId, 'Money Market', `•••• ${rand4()}`, mmaVal, 2.95, 0);

  // Create standard default investments
  const defaultInvs = [
    ['S&P 500 ETF',       'equity',        35.0, invVal * 0.35, '#002B5B', 'VOO'],
    ['US Treasury Bonds', 'bond',          20.0, invVal * 0.20, '#3B82F6', 'VGLT'],
    ['Real Estate ETF',   'real_estate',   15.0, invVal * 0.15, '#F97316', 'VNQ'],
    ['International ETF', 'international', 15.0, invVal * 0.15, '#8B5CF6', 'VXUS'],
    ['Bitcoin ETF',       'crypto',        10.0, invVal * 0.10, '#F7931A', 'IBIT'],
    ['Ethereum ETF',      'crypto',         5.0, invVal * 0.05, '#627EEA', 'ETHA'],
  ];

  const insInv = db.prepare('INSERT INTO investments (user_id, name, category, allocation_pct, value, color, ticker) VALUES (?, ?, ?, ?, ?, ?, ?)');
  defaultInvs.forEach(([invName, cat, pct, val, color, ticker]) => {
    insInv.run(userId, invName, cat, pct, val, color, ticker);
  });

  // Welcome initial transaction
  const today = new Date().toISOString().split('T')[0];
  if (hysVal > 0) {
    db.prepare('INSERT INTO transactions (user_id, account_id, description, amount, type, category, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(userId, `hys_${userId}`, 'Initial Deposit', hysVal, 'credit', 'Income', today, 'completed');
  }

  res.json({ success: true, userId, user: { id: userId, name: name.trim(), email: email.trim().toLowerCase(), member_since: year } });
});

// Update user profile details (Member Since year, Name)
app.post('/admin/api/user/:id/profile', requireAdmin, (req, res) => {
  const { memberSince, name } = req.body;
  const uid = parseInt(req.params.id, 10);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (memberSince !== undefined && memberSince.toString().trim()) {
    db.prepare('UPDATE users SET member_since = ? WHERE id = ?').run(memberSince.toString().trim(), uid);
  }
  if (name !== undefined && name.trim()) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), uid);
  }
  const updated = db.prepare('SELECT id, name, email, avatar, member_since FROM users WHERE id = ?').get(uid);
  res.json({ success: true, user: updated });
});


// Update total investment portfolio value
app.post('/admin/api/user/:id/total-investment', requireAdmin, (req, res) => {
  const uid = req.params.id;
  const newTotal = parseFloat(req.body.newTotal) || 0;
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(uid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const existingInvs = db.prepare('SELECT * FROM investments WHERE user_id = ?').all(uid);
  if (existingInvs.length > 0) {
    const totalPct = existingInvs.reduce((s, i) => s + (i.allocation_pct || 0), 0) || 100;
    const upd = db.prepare('UPDATE investments SET value = ? WHERE id = ?');
    existingInvs.forEach(inv => {
      const share = (inv.allocation_pct / totalPct) * newTotal;
      upd.run(share, inv.id);
    });
  } else {
    // Seed default allocations
    const defaultInvs = [
      ['S&P 500 ETF',       'equity',        35.0, newTotal * 0.35, '#002B5B', 'VOO'],
      ['US Treasury Bonds', 'bond',          20.0, newTotal * 0.20, '#3B82F6', 'VGLT'],
      ['Real Estate ETF',   'real_estate',   15.0, newTotal * 0.15, '#F97316', 'VNQ'],
      ['International ETF', 'international', 15.0, newTotal * 0.15, '#8B5CF6', 'VXUS'],
      ['Bitcoin ETF',       'crypto',        10.0, newTotal * 0.10, '#F7931A', 'IBIT'],
      ['Ethereum ETF',      'crypto',         5.0, newTotal * 0.05, '#627EEA', 'ETHA'],
    ];
    const ins = db.prepare('INSERT INTO investments (user_id, name, category, allocation_pct, value, color, ticker) VALUES (?, ?, ?, ?, ?, ?, ?)');
    defaultInvs.forEach(([invName, cat, pct, val, color, ticker]) => {
      ins.run(uid, invName, cat, pct, val, color, ticker);
    });
  }

  const investments = db.prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY allocation_pct DESC').all(uid);
  res.json({ success: true, total: newTotal, investments });
});

// Update account balance (silent — does NOT create a transaction record)
app.post('/admin/api/user/:id/balance', requireAdmin, (req, res) => {
  const { accountId, newBalance } = req.body;
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  db.prepare('UPDATE accounts SET balance = ? WHERE id = ?').run(parseFloat(newBalance), accountId);
  res.json({ success: true });
});




// Approve / Reject pending transaction
app.post('/admin/api/transaction/:id/:action', requireAdmin, (req, res) => {
  const { id, action } = req.params;
  const txn = db.prepare('SELECT * FROM pending_transactions WHERE id = ?').get(id);
  if (!txn) return res.status(404).json({ error: 'Not found' });

  const today = new Date().toISOString().split('T')[0];

  if (action === 'approve') {
    db.prepare("UPDATE pending_transactions SET status = 'approved' WHERE id = ?").run(id);

    if (txn.tx_category === 'banking') {
      const acc = db.prepare('SELECT * FROM accounts WHERE id = ?').get(txn.account_id);
      if (acc) {
        const newBal = txn.type === 'deposit' ? acc.balance + txn.amount : acc.balance - txn.amount;
        db.prepare('UPDATE accounts SET balance = ? WHERE id = ?').run(newBal, txn.account_id);
      }
    } else if (txn.tx_category === 'investment') {
      const invs = db.prepare('SELECT * FROM investments WHERE user_id = ?').all(txn.user_id);
      const totalPct = invs.reduce((s, i) => s + i.allocation_pct, 0) || 100;
      invs.forEach(inv => {
        const delta = (inv.allocation_pct / totalPct) * txn.amount * (txn.type === 'deposit' ? 1 : -1);
        db.prepare('UPDATE investments SET value = value + ? WHERE id = ?').run(delta, inv.id);
      });
    }

    // Insert with status='approved' so user sees green Approved badge
    db.prepare('INSERT INTO transactions (user_id, account_id, description, amount, type, category, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      txn.user_id, txn.account_id, txn.description,
      txn.type === 'deposit' ? txn.amount : -txn.amount,
      txn.type === 'deposit' ? 'credit' : 'debit',
      txn.tx_category === 'investment' ? 'Investment' : (txn.type === 'deposit' ? 'Income' : 'Withdrawal'),
      today, 'approved'
    );
  } else {
    // Mark pending as rejected AND create a dated transactions record so it appears at top of user history
    db.prepare("UPDATE pending_transactions SET status = 'rejected' WHERE id = ?").run(id);
    db.prepare('INSERT INTO transactions (user_id, account_id, description, amount, type, category, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      txn.user_id, txn.account_id, txn.description,
      txn.type === 'deposit' ? txn.amount : -txn.amount,
      txn.type === 'deposit' ? 'credit' : 'debit',
      txn.tx_category === 'investment' ? 'Investment' : 'Transfer',
      today, 'rejected'
    );
  }
  res.json({ success: true });
});


// Manage investments (add / update / delete)
app.post('/admin/api/user/:id/investment', requireAdmin, (req, res) => {
  const uid = req.params.id;
  const { action, investmentId, name, category, allocation_pct, value, color, ticker } = req.body;

  if (action === 'update') {
    db.prepare('UPDATE investments SET name=?, category=?, allocation_pct=?, value=?, color=?, ticker=? WHERE id=? AND user_id=?')
      .run(name, category, parseFloat(allocation_pct), parseFloat(value), color, ticker, investmentId, uid);
  } else if (action === 'add') {
    db.prepare('INSERT INTO investments (user_id, name, category, allocation_pct, value, color, ticker) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(uid, name, category, parseFloat(allocation_pct), parseFloat(value), color || '#002B5B', ticker || '');
  } else if (action === 'delete') {
    db.prepare('DELETE FROM investments WHERE id=? AND user_id=?').run(investmentId, uid);
  }

  const investments = db.prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY allocation_pct DESC').all(uid);
  res.json({ success: true, investments });
});

// Update investment performance overview
app.post('/admin/api/user/:id/investment-performance', requireAdmin, (req, res) => {
  const uid = parseInt(req.params.id, 10);
  const { since_inception, ytd_return, one_month_return, dividend_yield, strategy, rebalancing, inception_date } = req.body;
  const existing = db.prepare('SELECT user_id FROM investment_performance WHERE user_id = ?').get(uid);
  if (existing) {
    db.prepare(`UPDATE investment_performance SET 
      since_inception = ?, ytd_return = ?, one_month_return = ?, dividend_yield = ?, strategy = ?, rebalancing = ?, inception_date = ? 
      WHERE user_id = ?`
    ).run(since_inception, ytd_return, one_month_return, dividend_yield, strategy, rebalancing, inception_date, uid);
  } else {
    db.prepare(`INSERT INTO investment_performance 
      (user_id, since_inception, ytd_return, one_month_return, dividend_yield, strategy, rebalancing, inception_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(uid, since_inception, ytd_return, one_month_return, dividend_yield, strategy, rebalancing, inception_date);
  }
  const updated = db.prepare('SELECT * FROM investment_performance WHERE user_id = ?').get(uid);
  res.json({ success: true, performance: updated });
});

// Manage investment activity items (add / update / delete)
app.post('/admin/api/user/:id/investment-activity', requireAdmin, (req, res) => {
  const uid = parseInt(req.params.id, 10);
  const { action, activityId, icon, title, subtitle, amount_badge } = req.body;
  if (action === 'add') {
    db.prepare('INSERT INTO investment_activities (user_id, icon, title, subtitle, amount_badge) VALUES (?, ?, ?, ?, ?)')
      .run(uid, icon || '⬇', title, subtitle, amount_badge);
  } else if (action === 'update') {
    db.prepare('UPDATE investment_activities SET icon = ?, title = ?, subtitle = ?, amount_badge = ? WHERE id = ? AND user_id = ?')
      .run(icon || '⬇', title, subtitle, amount_badge, activityId, uid);
  } else if (action === 'delete') {
    db.prepare('DELETE FROM investment_activities WHERE id = ? AND user_id = ?').run(activityId, uid);
  }
  const activities = db.prepare('SELECT * FROM investment_activities WHERE user_id = ? ORDER BY id DESC').all(uid);
  res.json({ success: true, activities });
});


// Add manual transaction
app.post('/admin/api/user/:id/transaction', requireAdmin, (req, res) => {
  const { description, amount, type, category, accountId } = req.body;
  const uid = req.params.id;
  const acctId = accountId || 'hys_1';
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO transactions (user_id, account_id, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(uid, acctId, description, parseFloat(amount), type, category || 'Adjustment', today);
  if (type === 'credit') {
    db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?').run(parseFloat(amount), acctId, uid);
  } else {
    db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?').run(parseFloat(amount), acctId, uid);
  }
  res.json({ success: true });
});

// ─── LEGACY compat (old admin API used by old admin.html) ─────────────────────
app.get('/api/admin/data', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  const allAccounts = db.prepare('SELECT * FROM accounts').all();
  const allTxns = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
  const allPending = db.prepare('SELECT * FROM pending_transactions ORDER BY created_at DESC').all();
  res.json({ users, accounts: allAccounts, transactions: allTxns, pendingTransactions: allPending });
});

app.post('/api/admin/update-balance', requireAdmin, (req, res) => {
  const { accountId, newBalance } = req.body;
  db.prepare('UPDATE accounts SET balance = ? WHERE id = ?').run(parseFloat(newBalance), accountId);
  res.json({ success: true });
});

app.post('/api/admin/transaction/:id/:action', requireAdmin, (req, res) => {
  req.params; // forward to new handler logic
  res.redirect(307, `/admin/api/transaction/${req.params.id}/${req.params.action}`);
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏦  Synchrony Bank running at http://localhost:${PORT}`);
  console.log(`    Dashboard : http://localhost:${PORT}/`);
  console.log(`    Admin     : http://localhost:${PORT}/admin`);
  console.log(`    Login     : alex@synchrony.com / password123`);
  console.log(`    Admin pw  : admin2026\n`);
});
