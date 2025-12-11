// Supabase Dashboard Functions
let supabase;

// Initialize Supabase
async function initDashboard() {
    let attempts = 0;
    while (!window.getSupabase || !window.getSupabase()) {
        if (attempts++ > 50) {
            alert('Failed to initialize. Please refresh the page.');
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    supabase = window.getSupabase();

    // Check authentication
    await checkAuth();

    // Load dashboard data
    await loadDashboardStats();
}

// Check authentication
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = './index.html';
        return false;
    }

    // Display user info
    const user = session.user;
    console.log('Logged in as:', user.email);

    return true;
}

// Logout function
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = './index.html';
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Get project count
        const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        // Update stats on page
        const projectStat = document.querySelector('.stat-projects');
        if (projectStat) {
            projectStat.textContent = projectCount || 0;
        }

        console.log('Dashboard stats loaded');
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Initialize on page load
initDashboard();
