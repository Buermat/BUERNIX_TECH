// Authentication Logic
// IMPORTANT: Change these credentials to your own!
const DEFAULT_CREDENTIALS = {
  email: 'mathiasagbugbla@gmail.com',  // Change this to your email
  password: 'Buer4499@'   // Change this to your password
};

// Check if already logged in
if (localStorage.getItem('adminToken')) {
  window.location.href = './dashboard.html';
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  const errorMessage = document.getElementById('errorMessage');

  // Simple authentication
  if (email === DEFAULT_CREDENTIALS.email && password === DEFAULT_CREDENTIALS.password) {
    // Generate token
    const token = btoa(email + ':' + Date.now());

    // Store token
    if (remember) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify({ email, name: 'Admin' }));
    } else {
      sessionStorage.setItem('adminToken', token);
      sessionStorage.setItem('adminUser', JSON.stringify({ email, name: 'Admin' }));
    }

    // Redirect to dashboard
    window.location.href = './dashboard.html';
  } else {
    // Show error
    errorMessage.textContent = 'Invalid email or password';
    errorMessage.classList.remove('hidden');

    setTimeout(() => {
      errorMessage.classList.add('hidden');
    }, 3000);
  }
});
