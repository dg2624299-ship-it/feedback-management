/* Data layer: users, forms and feedback are kept in the browser (localStorage) */
const DB_KEY = 'fms_data_v2';
const Store = {
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) {}
    if (!d) { d = this.seed(); this.save(d); }
    return d;
  },
  save(d) { localStorage.setItem(DB_KEY, JSON.stringify(d)); },
  reset() { localStorage.removeItem(DB_KEY); },

  addUser(u) { const d = this.load(); d.users.push(u); this.save(d); },
  login(email, password, role) {
    const u = this.load().users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password && x.role === role);
    if (u) sessionStorage.setItem('fms_session', u.id);
    return u;
  },
  addFeedback(raw) { const d = this.load(); const r = Workflow.process(raw); d.feedback.unshift(r); this.save(d); return r; },
  updateFeedback(id, fn) { const d = this.load(); const f = d.feedback.find(x => x.id === id); if (f) fn(f); this.save(d); },

  seed() {
    const ago = n => new Date(Date.now() - n * 86400000).toISOString();
    const users = [
      { id: 'u1', name: 'Admin', email: 'admin@fms.com', password: 'admin123', role: 'admin', plan: '-' },
      { id: 'u2', name: 'Aarav Mehta', email: 'aarav@example.com', password: 'user123', role: 'user', plan: 'Premium' },
      { id: 'u3', name: 'Diya Shah', email: 'diya@example.com', password: 'user123', role: 'user', plan: 'Free' },
      { id: 'u4', name: 'Rohan Iyer', email: 'rohan@example.com', password: 'user123', role: 'user', plan: 'Enterprise' }
    ];
    const forms = [
      { id: 'FM1', title: 'Product Experience', topic: 'Product', type: 'NPS', question: Scales.NPS.label, target: 'All', active: true, created: ago(20) },
      { id: 'FM2', title: 'Support Quality', topic: 'Customer Support', type: 'CSAT', question: 'How satisfied were you with our support team?', target: 'All', active: true, created: ago(15) },
      { id: 'FM3', title: 'Checkout Effort', topic: 'Checkout', type: 'CES', question: Scales.CES.label, target: 'Premium', active: true, created: ago(10) }
    ];
    const mk = (f, u, channel, score, comment, d) => Workflow.process({
      formId: f.id, formTitle: f.title, type: f.type, userId: u.id, userName: u.name, userEmail: u.email, plan: u.plan,
      channel, score, comment, date: ago(d) });
    const feedback = [
      mk(forms[0], users[1], 'Email', 10, 'Love the product, it is fast and helpful.', 12),
      mk(forms[1], users[2], 'WhatsApp', 1, 'The app keeps crash on login, urgent please fix.', 3),
      mk(forms[0], users[3], 'In-App Survey', 5, 'Would like a dark mode feature, missing right now.', 5),
      mk(forms[2], users[1], 'QR Code', 2, 'Very slow checkout, disappointed.', 2)
    ];
    return { users, forms, feedback };
  }
};
