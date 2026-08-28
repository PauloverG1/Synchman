const fs = require('fs');

// 1. Update dashboard.html
let dashboard_html = fs.readFileSync('public/dashboard.html', 'utf8');

// Task 1
const nav_fix = `// Fix sidebar nav
document.querySelectorAll('.ni[data-p]').forEach(btn => {
  btn.addEventListener('click', () => goto(btn.dataset.p));
});

/* INIT */`;
dashboard_html = dashboard_html.replace('/* INIT */', nav_fix);

// Task 2
const transfer_html_old = dashboard_html.match(/<!-- ████ TRANSFER ████ -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/)[0];

const transfer_html_new = `<!-- ████ TRANSFER ████ -->
    <div class="page" id="pg-transfer">
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px" class="mid-split">
        <div class="gap">
          <div class="card">
            <div class="ch"><div><div class="ct">Bank Transfer</div><div class="cs">Send money to any bank account</div></div></div>

            <div class="field">
              <label>Recipient Full Name</label>
              <input type="text" id="tr-name" placeholder="e.g. John Smith" oninput="updateTrPreview($('tr-amt')?.value)">
            </div>
            <div class="field">
              <label>Recipient Bank Name</label>
              <input type="text" id="tr-bank" placeholder="e.g. First National Bank">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="field">
                <label>Account Number</label>
                <input type="text" id="tr-acct-no" placeholder="Enter account number">
              </div>
              <div class="field">
                <label>Routing Number</label>
                <input type="text" id="tr-routing" placeholder="9-digit routing number">
              </div>
            </div>
            <div class="field">
              <label>Transfer From</label>
              <select id="tr-from">
                <option>High Yield Savings •••• 8842 — $142,850.00</option>
                <option>Money Market •••• 3319 — $28,450.00</option>
              </select>
            </div>
            <div class="field">
              <label>Amount ($)</label>
              <input type="text" id="tr-amt" placeholder="$0.00" oninput="updateTrPreview(this.value)">
              <span class="hint">Available balance: $142,850.00 · Min $1.00</span>
            </div>
            <div class="pills">
              <span class="pill" onclick="setTrAmt(100)">$100</span>
              <span class="pill" onclick="setTrAmt(500)">$500</span>
              <span class="pill" onclick="setTrAmt(1000)">$1,000</span>
              <span class="pill" onclick="setTrAmt(2500)">$2,500</span>
              <span class="pill" onclick="setTrAmt(5000)">$5,000</span>
            </div>
            <div class="field">
              <label>Transfer Date</label>
              <select>
                <option>Today — Processing begins immediately</option>
                <option>Tomorrow</option>
                <option>In 2 business days</option>
                <option>Schedule a specific date…</option>
              </select>
            </div>
            <div class="field">
              <label>Transfer Type</label>
              <select>
                <option>Standard (1–3 business days) — Free</option>
                <option>Same Day ACH — $2.50 fee</option>
                <option>Wire Transfer — $25.00 fee</option>
              </select>
            </div>
            <div class="field">
              <label>Note / Memo (optional)</label>
              <input type="text" placeholder="e.g. Rent payment, Invoice #123">
            </div>
            <button class="btn btn-gd btn-fw" onclick="submitTr()">Send Transfer →</button>
          </div>
        </div>
        <div class="gap">
          <div class="card" style="background:linear-gradient(140deg,var(--navy),#004080);border:none">
            <p style="font-size:14px;font-weight:700;color:#fff;margin-bottom:16px">Transfer Summary</p>
            <div class="ir" style="border-color:rgba(255,255,255,.1)"><span style="color:rgba(255,255,255,.5);font-weight:500">To</span><span style="color:#fff;font-weight:600" id="tr-preview-name">—</span></div>
            <div class="ir" style="border-color:rgba(255,255,255,.1)"><span style="color:rgba(255,255,255,.5);font-weight:500">Amount</span><span style="color:var(--gold);font-weight:700" id="tr-preview">$0.00</span></div>
            <div class="ir" style="border-color:rgba(255,255,255,.1)"><span style="color:rgba(255,255,255,.5);font-weight:500">Delivery</span><span style="color:#fff;font-weight:600">1–3 business days</span></div>
            <div class="ir" style="border-color:rgba(255,255,255,.1)"><span style="color:rgba(255,255,255,.5);font-weight:500">Fee</span><span style="color:var(--green);font-weight:700">Free</span></div>
            <div style="margin-top:14px;padding:10px 14px;background:rgba(244,197,0,.15);border-radius:var(--rs)">
              <p style="font-size:12px;color:var(--gold)">🔒 Transfers are encrypted and protected by 256-bit SSL. Funds are FDIC-insured up to $250,000.</p>
            </div>
          </div>
          <div class="card">
            <div class="ct" style="margin-bottom:14px">Recent Transfers</div>
            <div class="tr"><div class="tr-ico" style="background:var(--blue-bg)">↗</div><div class="tr-b"><div class="tr-d">Wire to James Okafor</div><div class="tr-m">Aug 17 · Standard ACH · Completed</div></div><div class="tr-a dr">-$1,000.00</div></div>
            <div class="tr"><div class="tr-ico" style="background:var(--green-bg)">⬇</div><div class="tr-b"><div class="tr-d">Inbound — Marcus Ltd</div><div class="tr-m">Aug 12 · Wire · Completed</div></div><div class="tr-a cr">+$2,500.00</div></div>
            <div class="tr"><div class="tr-ico" style="background:var(--blue-bg)">↗</div><div class="tr-b"><div class="tr-d">Wire to Sarah Chen</div><div class="tr-m">Aug 3 · Standard ACH · Completed</div></div><div class="tr-a dr">-$1,500.00</div></div>
            <div class="tr"><div class="tr-ico" style="background:var(--green-bg)">⬇</div><div class="tr-b"><div class="tr-d">Inbound — Apex Corp</div><div class="tr-m">Jul 28 · Wire · Completed</div></div><div class="tr-a cr">+$3,000.00</div></div>
          </div>
        </div>
      </div>
    </div>`;
dashboard_html = dashboard_html.replace(transfer_html_old, transfer_html_new);

const js_transfer_old = `/* TRANSFER */
function setTrAmt(n){
  $('tr-amt').value='$'+fmt(n);updateTrPreview('$'+fmt(n));
  document.querySelectorAll('#pg-transfer .pill').forEach(p=>p.classList.remove('sel'));
  event.target.classList.add('sel');
}
function updateTrPreview(v){const n=parseFloat((v||'').replace(/[^0-9.]/g,''))||0;if($('tr-preview'))$('tr-preview').textContent='$'+fmt(n);}
function updateTrType(){const m={deposit:'Deposit',transfer:'Internal Transfer',withdraw:'Withdrawal'};if($('tr-type-label'))$('tr-type-label').textContent=m[$('tr-type').value]||'';}
function submitTr(){const v=$('tr-amt').value||'$0.00';toast('✅ Transaction of '+v+' submitted successfully!');}`;

const js_transfer_new = `/* TRANSFER */
function setTrAmt(n){$('tr-amt').value='$'+fmt(n);updateTrPreview('$'+fmt(n));document.querySelectorAll('#pg-transfer .pill').forEach(p=>p.classList.remove('sel'));event.target.classList.add('sel');}
function updateTrPreview(v){const n=parseFloat((v||'').replace(/[^0-9.]/g,''))||0;if($('tr-preview'))$('tr-preview').textContent='$'+fmt(n);const nm=$('tr-name');if($('tr-preview-name'))$('tr-preview-name').textContent=nm&&nm.value?nm.value:'—';}
function submitTr(){const name=$('tr-name')?.value,amt=$('tr-amt')?.value,acct=$('tr-acct-no')?.value,routing=$('tr-routing')?.value;if(!name||!amt||!acct||!routing){toast('⚠️ Please fill in all required fields.');return;}toast('✅ Transfer of '+amt+' to '+name+' submitted for processing!');}`;
dashboard_html = dashboard_html.replace(js_transfer_old, js_transfer_new);

// Task 3
const loan_modal_html = `<!-- LOAN MODAL -->
<div id="loan-modal" style="display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:20px">
  <div style="background:#fff;border-radius:20px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:linear-gradient(135deg,var(--navy),#004080);padding:24px 28px;border-radius:20px 20px 0 0;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:18px;font-weight:700;color:#fff" id="modal-loan-title">Loan Application</div>
        <div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:3px" id="modal-loan-sub">Fill in your details below</div>
      </div>
      <button onclick="closeLoanModal()" style="background:rgba(255,255,255,.15);border:none;color:#fff;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center">×</button>
    </div>
    <div style="padding:28px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label>First Name</label><input type="text" placeholder="John"></div>
        <div class="field"><label>Last Name</label><input type="text" placeholder="Smith"></div>
      </div>
      <div class="field"><label>Email Address</label><input type="email" placeholder="john@example.com"></div>
      <div class="field"><label>Phone Number</label><input type="tel" placeholder="+1 (555) 000-0000"></div>
      <div class="field"><label>Loan Amount Requested ($)</label><input type="number" placeholder="e.g. 25000" id="modal-loan-amount"></div>
      <div class="field"><label>Loan Purpose</label><select><option>Home Improvement</option><option>Debt Consolidation</option><option>Medical Expenses</option><option>Business</option><option>Education</option><option>Vehicle Purchase</option><option>Emergency</option><option>Other</option></select></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label>Employment Status</label><select><option>Employed Full-Time</option><option>Employed Part-Time</option><option>Self-Employed</option><option>Retired</option><option>Unemployed</option></select></div>
        <div class="field"><label>Annual Income ($)</label><input type="number" placeholder="e.g. 75000"></div>
      </div>
      <div class="field"><label>Credit Score Range</label><select><option>Excellent (750+)</option><option>Good (700–749)</option><option>Fair (650–699)</option><option>Poor (600–649)</option><option>Very Poor (below 600)</option></select></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label>Date of Birth</label><input type="date"></div>
        <div class="field"><label>Last 4 digits of SSN</label><input type="text" maxlength="4" placeholder="••••"></div>
      </div>
      <div class="field"><label>Home Address</label><input type="text" placeholder="123 Main St, City, State ZIP"></div>
      <div style="padding:12px 14px;background:var(--navy-bg);border-radius:var(--rs);font-size:12px;color:var(--mid);margin-bottom:16px">🔒 Your information is encrypted and secure. Submitting this form performs a <strong>soft credit check only</strong> — it will not affect your credit score.</div>
      <button class="btn btn-gd btn-fw" onclick="submitLoanApp()">Submit Application →</button>
    </div>
  </div>
</div>
</body>`;
dashboard_html = dashboard_html.replace('</body>', loan_modal_html);

const loan_modal_js = `function openLoanModal(title, rate){
  $('modal-loan-title').textContent = title + ' Application';
  $('modal-loan-sub').textContent = 'Starting from ' + rate + ' APR · Takes about 5 minutes';
  $('loan-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeLoanModal(){
  $('loan-modal').style.display = 'none';
  document.body.style.overflow = '';
}
function submitLoanApp(){
  const amt = $('modal-loan-amount')?.value;
  if(!amt){ toast('⚠️ Please enter a loan amount.'); return; }
  $('loan-modal').style.display = 'none';
  document.body.style.overflow = '';
  toast('✅ Application submitted! Our team will contact you within 1–2 business days.');
}
// Close modal on backdrop click
$('loan-modal').addEventListener('click', function(e){ if(e.target===this) closeLoanModal(); });

/* LOAN CALC */`;
dashboard_html = dashboard_html.replace('/* LOAN CALC */', loan_modal_js);

// Update the loan buttons
dashboard_html = dashboard_html.replace("onclick=\"toast('✅ Home Equity application started! Our team will contact you shortly.')\"", "onclick=\"openLoanModal('Home Equity Loan', '6.74%')\"");
dashboard_html = dashboard_html.replace("onclick=\"toast('✅ Personal Loan application started!')\"", "onclick=\"openLoanModal('Personal Loan', '9.99%')\"");
dashboard_html = dashboard_html.replace("onclick=\"toast('✅ Auto Refinance application started!')\"", "onclick=\"openLoanModal('Auto Refinance', '5.49%')\"");
dashboard_html = dashboard_html.replace("onclick=\"toast('✅ Student Loan Refi application started!')\"", "onclick=\"openLoanModal('Student Loan Refinance', '4.99%')\"");
dashboard_html = dashboard_html.replace("onclick=\"toast('✅ Business Loan application started!')\"", "onclick=\"openLoanModal('Business Loan', '7.25%')\"");
dashboard_html = dashboard_html.replace("onclick=\"toast('✅ Emergency Loan application started!')\"", "onclick=\"openLoanModal('Emergency Loan', '11.99%')\"");

fs.writeFileSync('public/dashboard.html', dashboard_html);

// Task 4
const data = JSON.parse(fs.readFileSync('data/accounts.json', 'utf8'));

data.pendingTransactions = [
  { "id": 101, "type": "deposit", "user": "Alex Johnson", "account": "HYS •••• 8842", "amount": 5000.00, "date": "2026-08-20", "status": "pending", "notes": "Wire from employer" },
  { "id": 102, "type": "withdrawal", "user": "Alex Johnson", "account": "HYS •••• 8842", "amount": 2000.00, "date": "2026-08-19", "status": "pending", "notes": "Rent payment" },
  { "id": 103, "type": "deposit", "user": "Alex Johnson", "account": "MMA •••• 3319", "amount": 1500.00, "date": "2026-08-18", "status": "pending", "notes": "Investment transfer" }
];

fs.writeFileSync('data/accounts.json', JSON.stringify(data, null, 2));
