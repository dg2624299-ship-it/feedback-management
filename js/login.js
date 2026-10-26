/* Login and registration (users can register, admin account is pre-created) */
const $ = id => document.getElementById(id);
let role = 'user', mode = 'login';

function sync() {
  $('nameRow').hidden = $('planRow').hidden = mode !== 'register';
  $('submitBtn').textContent = mode === 'login' ? 'Log in' : 'Create account';
  $('toggle').hidden = role === 'admin';
  $('toggle').textContent = mode === 'login' ? 'New user? Create an account' : 'Already have an account? Log in';
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.role === role));
}
document.querySelectorAll('.tab').forEach(t => t.onclick = () => { role = t.dataset.role; if (role === 'admin') mode = 'login'; $('msg').textContent = ''; sync(); });
$('toggle').onclick = e => { e.preventDefault(); mode = mode === 'login' ? 'register' : 'login'; $('msg').textContent = ''; sync(); };

function fail(text) { $('msg').className = 'msg err'; $('msg').textContent = text; }

$('authForm').onsubmit = e => {
  e.preventDefault();
  const email = $('email').value.trim(), password = $('password').value;
  if (!email || !password) return fail('Enter your email and password.');
  if (mode === 'register') {
    const name = $('name').value.trim();
    if (!name) return fail('Enter your full name.');
    if (Store.load().users.some(u => u.email.toLowerCase() === email.toLowerCase())) return fail('This email is already registered. Please log in.');
    Store.addUser({ id: 'u' + Date.now(), name, email, password, role: 'user', plan: $('plan').value });
  }
  const u = Store.login(email, password, role);
  if (!u) return fail('Wrong email, password or role. Check the tab (User or Admin).');
  location.href = role === 'admin' ? 'admin.html' : 'user.html';
};
sync();
