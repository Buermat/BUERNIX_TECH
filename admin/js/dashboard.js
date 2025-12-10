// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (!token) {
        window.location.href = './index.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    window.location.href = './index.html';
}

// Initialize
checkAuth();

// Load dashboard data
function loadDashboardData() {
    // This would load from localStorage
    // For now, using static data
    console.log('Dashboard loaded');
}

loadDashboardData();
