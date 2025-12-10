// Supabase Authentication
// This replaces the old localStorage-based auth

let supabase;

// Wait for Supabase to initialize
async function waitForSupabase() {
    let attempts = 0;
    while (!window.getSupabase || !window.getSupabase()) {
        if (attempts++ > 50) {
            throw new Error('Supabase failed to initialize');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    supabase = window.getSupabase();
    return supabase;
}

// Check if already logged in
async function checkExistingSession() {
    await waitForSupabase();

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Already logged in, redirect to dashboard
        window.location.href = './dashboard.html';
    }
}

checkExistingSession();

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = e.target.querySelector('button[type="submit"]');

    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';

    try {
        await waitForSupabase();

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Success! Redirect to dashboard
        window.location.href = './dashboard.html';

    } catch (error) {
        // Show error
        errorMessage.textContent = error.message || 'Invalid email or password';
        errorMessage.classList.remove('hidden');

        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';

        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }
});
