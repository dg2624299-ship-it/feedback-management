/* Admin page: create forms, see who responded, metrics, alerts, reply */
const me = Auth.require('admin');
const $ = id => document.getElementById(id);
let openId = null;
const pct = (n, t) => t ? Math.round(n / t * 100) : 0;

function metrics(fb) {
  const nps = fb.filter(f => f.type === 'NPS'), csat = fb.filter(f => f.type === 'CSAT'), ces = fb.filter(f => f.type === 'CES');
  return {
    nps: nps.length ? pct(nps.filter(f => f.score >= 9).length, nps.length) - pct(nps.filter(f => f.score <= 6).length, nps.length) : 0,
    csat: pct(csat.filter(f => f.score >= 4).length, csat.length),
    ces: ces.length ? (ces.reduce((s, f) => s + f.score, 0) / ces.length).toFixed(1) : 0
  };
}
function bars(el, fb, key) {
  const c = {}; fb.forEach(f => c[f[key]] = (c[f[key]] || 0) + 1);
  const max = Math.max(1, ...Object.values(c));
  el.innerHTML = Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="bar ${k}"><span>${k}</span><i style="width:${v / max * 55}%"></i><b>${v}</b></div>`).join('') || '<p class="empty">No data</p>';
}

function render() {
  const db = Store.load(), fb = db.feedback, m = metrics(fb);
  $('nps').textContent = m.nps; $('csat').textContent = m.csat + '%'; $('ces').textContent = m.ces; $('total').textContent = fb.length;
  bars($('bySentiment'), fb, 'sentiment'); bars($('byCategory'), fb, 'category');

  $('alerts').innerHTML = fb.filter(f => f.alert && f.status !== 'Resolved').map(f =>
    `<div class="alert"><b>${f.urgent ? 'URGENT: ' : ''}${f.category}</b> from ${esc(f.userName)} on "${esc(f.formTitle)}" (${f.type} ${f.score}) &rarr; ${f.team}<br>${esc(f.comment)}</div>`).join('') || '<p class="empty">No open alerts.</p>';

  $('formRows').innerHTML = db.forms.map(f => `<tr><td>${esc(f.title)}<br><small>${esc(f.topic)}</small></td><td>${f.type}</td><td>${f.target}</td>
    <td>${fb.filter(x => x.formId === f.id).length}</td>
    <td><button class="ghost" onclick="toggleForm('${f.id}')">${f.active ? 'Active: turn off' : 'Off: turn on'}</button> <button class="ghost" onclick="delForm('${f.id}')">Delete</button></td></tr>`).join('')
    || '<tr><td colspan="5" class="empty">No forms yet. Create one above.</td></tr>';

  const keep = $('fForm').value;
  $('fForm').innerHTML = '<option value="">All forms</option>' + db.forms.map(f => `<option value="${f.id}">${esc(f.title)}</option>`).join('');
  $('fForm').value = keep;

  const ff = $('fForm').value, fs = $('fSent').value, fst = $('fStatus').value;
  const rows = fb.filter(f => (!ff || f.formId === ff) && (!fs || f.sentiment === fs) && (!fst || f.status === fst));
  $('rows').innerHTML = rows.map(f => `<tr><td>${new Date(f.date).toLocaleDateString()}</td><td>${esc(f.formTitle)}</td>
    <td><b>${esc(f.userName)}</b><br><small>${esc(f.userEmail)} (${f.plan})</small></td><td>${f.channel}</td><td>${f.type} ${f.score}</td><td>${esc(f.comment)}</td>
    <td><span class="tag ${f.sentiment}">${f.sentiment}</span><br><small>${f.category}${f.urgent ? ' <span class="urgent">urgent</span>' : ''}</small></td>
    <td>${f.team}</td><td><span class="tag ${f.status === 'In Progress' ? 'Progress' : f.status}">${f.status}</span></td>
    <td><button onclick="openReply('${f.id}')">Reply</button></td></tr>`).join('')
    || '<tr><td colspan="10" class="empty">No feedback matches the filters.</td></tr>';
}

$('createForm').onsubmit = e => {
  e.preventDefault();
  const title = $('fTitle').value.trim(), topic = $('fTopic').value.trim(), type = $('fType').value;
  if (!title || !topic) { $('createMsg').textContent = 'Enter a form title and a topic.'; return; }
  const db = Store.load();
  db.forms.unshift({ id: 'FM' + Date.now(), title, topic, type, question: $('fQuestion').value.trim() || Scales[type].label, target: $('fTarget').value, active: true, created: new Date().toISOString() });
  Store.save(db); e.target.reset(); $('createMsg').textContent = 'Form created. Matching users can see it now.'; render();
};
function toggleForm(id) { const db = Store.load(); const f = db.forms.find(x => x.id === id); f.active = !f.active; Store.save(db); render(); }
function delForm(id) { if (!confirm('Delete this form? Existing responses are kept.')) return; const db = Store.load(); db.forms = db.forms.filter(x => x.id !== id); Store.save(db); render(); }

function openReply(id) {
  const f = Store.load().feedback.find(x => x.id === id); openId = id;
  $('replyInfo').innerHTML = `<b>${esc(f.userName)}</b> (${esc(f.userEmail)}): ${esc(f.comment)}<br>` + f.replies.map(r => `<small>Earlier reply: ${esc(r.text)}</small><br>`).join('');
  $('replyText').value = ''; $('replyStatus').value = f.status; $('dlg').showModal();
}
$('sendReply').onclick = () => {
  const text = $('replyText').value.trim(), status = $('replyStatus').value;
  Store.updateFeedback(openId, f => { if (text) f.replies.push({ text, date: new Date().toISOString() }); f.status = status; });
  $('dlg').close(); render();
};
$('closeDlg').onclick = () => $('dlg').close();
$('resetData').onclick = () => { if (confirm('Reset all data to demo data?')) { Store.reset(); render(); } };
['fForm', 'fSent', 'fStatus'].forEach(id => $(id).addEventListener('change', render));
if (me) { $('who').textContent = me.name; $('logout').onclick = () => Auth.logout(); render(); }
