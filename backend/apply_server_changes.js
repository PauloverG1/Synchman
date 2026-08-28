const fs = require('fs');

let server_js = fs.readFileSync('server.js', 'utf8');

const admin_routes = `// Admin: get all data
app.get('/api/admin/data', (req, res) => {
  res.json(getData());
});

// Admin: update account balance
app.post('/api/admin/update-balance', (req, res) => {
  const { accountId, newBalance } = req.body;
  const data = getData();
  const account = data.accounts.find(a => a.id === accountId);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  const oldBalance = account.balance;
  account.balance = parseFloat(newBalance);
  // Add transaction record
  data.transactions.unshift({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    description: \`Admin balance adjustment\`,
    amount: parseFloat(newBalance) - oldBalance,
    type: parseFloat(newBalance) > oldBalance ? 'credit' : 'debit',
    category: 'Adjustment'
  });
  fs.writeFileSync(path.join(__dirname, 'data', 'accounts.json'), JSON.stringify(data, null, 2));
  res.json({ success: true, account });
});

// Admin: approve/reject pending transaction
app.post('/api/admin/transaction/:id/:action', (req, res) => {
  const { id, action } = req.params;
  const data = getData();
  const txn = data.pendingTransactions && data.pendingTransactions.find(t => t.id == id);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  if (action === 'approve') {
    txn.status = 'approved';
    // Apply to balance
    const acct = data.accounts[0]; // simplified
    if (txn.type === 'deposit') acct.balance += txn.amount;
    else if (txn.type === 'withdrawal') acct.balance -= txn.amount;
    // Add to transactions
    data.transactions.unshift({
      id: Date.now(),
      date: txn.date,
      description: txn.type === 'deposit' ? 'Admin-approved deposit' : 'Admin-approved withdrawal',
      amount: txn.type === 'deposit' ? txn.amount : -txn.amount,
      type: txn.type === 'deposit' ? 'credit' : 'debit',
      category: txn.type === 'deposit' ? 'Income' : 'Withdrawal'
    });
  } else {
    txn.status = 'rejected';
  }
  fs.writeFileSync(path.join(__dirname, 'data', 'accounts.json'), JSON.stringify(data, null, 2));
  res.json({ success: true, txn });
});

// Admin: add manual transaction
app.post('/api/admin/add-transaction', (req, res) => {
  const { description, amount, type, category } = req.body;
  const data = getData();
  const newTxn = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    description, amount: parseFloat(amount),
    type, category: category || 'Adjustment'
  };
  data.transactions.unshift(newTxn);
  // Update balance
  if (type === 'credit') data.accounts[0].balance += parseFloat(amount);
  else data.accounts[0].balance -= parseFloat(amount);
  fs.writeFileSync(path.join(__dirname, 'data', 'accounts.json'), JSON.stringify(data, null, 2));
  res.json({ success: true, transaction: newTxn });
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server`;
server_js = server_js.replace('// Start server', admin_routes);

fs.writeFileSync('server.js', server_js);
