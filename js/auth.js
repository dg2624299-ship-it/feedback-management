/* Session handling (per browser tab) and a shared HTML-escape helper */
const Auth = {
  current() {
    const id = sessionStorage.getItem('fms_session');
    return id ? Store.load().users.find(u => u.id === id) : null;
  },
  // Page guard: sends the visitor to the login page if the role does not match
  require(role) {
    const u = this.current();
    if (!u || u.role !== role) { location.href = 'index.html'; return null; }
    return u;
  },
  logout() { sessionStorage.removeItem('fms_session'); location.href = 'index.html'; }
};
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
