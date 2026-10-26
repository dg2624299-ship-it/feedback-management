/* User page: see forms meant for me, answer them, track my feedback and replies */
const me = Auth.require('user');
const $ = id => document.getElementById(id);
let current = null;
if (me) { $('who').textContent = me.name + ' (' + me.plan + ' plan)'; $('logout').onclick = () => Auth.logout(); render(); }

function render() {
  const db = Store.load();
  const mine = db.feedback.filter(f => f.userId === me.id);
  const done = new Set(mine.map(f => f.formId));        // one answer per form (prevents survey fatigue)
  const open = db.forms.filter(f => f.active && (f.target === 'All' || f.target === me.plan) && !done.has(f.id)); // segmentation
  $('forms').innerHTML = open.map(f => `<div class="card"><h2>${esc(f.title)}</h2><small>Topic: ${esc(f.topic)}</small><p>${esc(f.question)}</p><button onclick="openForm('${f.id}')">Give feedback</button></div>`).join('')
    || '<p class="empty">No new forms for you right now. Check back later.</p>';
  $('mine').innerHTML = mine.map(f => `<tr><td>${esc(f.formTitle)}</td><td>${f.type} ${f.score}</td><td>${esc(f.comment)}</td>
    <td><span class="tag ${f.status === 'In Progress' ? 'Progress' : f.status}">${f.status}</span></td>
    <td>${f.replies.map(r => esc(r.text)).join('<br>') || '<span class="empty">No reply yet</span>'}</td></tr>`).join('')
    || '<tr><td colspan="5" class="empty">You have not given any feedback yet.</td></tr>';
}

function openForm(id) {
  current = Store.load().forms.find(f => f.id === id);
  const s = Scales[current.type];
  $('dTitle').textContent = current.title; $('dQuestion').textContent = current.question;
  $('scoreLabel').textContent = s.label; $('score').innerHTML = '';
  for (let i = s.min; i <= s.max; i++) $('score').add(new Option(i, i));
  $('comment').value = ''; $('dMsg').textContent = ''; $('dlg').showModal();
}

$('submitFb').onclick = () => {
  const comment = $('comment').value.trim();
  if (!comment) { $('dMsg').textContent = 'Please write a comment.'; return; }
  Store.addFeedback({ formId: current.id, formTitle: current.title, type: current.type, userId: me.id, userName: me.name,
    userEmail: me.email, plan: me.plan, channel: $('channel').value, score: Number($('score').value), comment });
  $('dlg').close(); render();
};
$('cancelFb').onclick = () => $('dlg').close();
