// BUERNIX Frontend Supabase Configuration
const SUPABASE_URL = 'https://lpqwlbmmyblxpynmubsh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcXdsYm1teWJseHB5bm11YnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA5NjQsImV4cCI6MjA4MDk3Njk2NH0.4G05BGRrpHueQBhv8wt_AzDsfJ8PTK9TRa2yLNrsv0s';

// Global Client
window.supabaseClient = null;

function initSupabase() {
    // If already initialized, stop
    if (window.supabaseClient) return;

    if (window.supabase) {
        try {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ BUERNIX Public: Supabase Connected');
        } catch (e) {
            console.error('❌ Supabase Init Error:', e);
        }
    }
}

// 1. Try Immediately (Script is deferred, likely ready)
initSupabase();

// 2. Try on DOMContentLoaded (Classic fallback)
document.addEventListener('DOMContentLoaded', initSupabase);

// 3. Last Resort Polling (In case SDK loads very late/async)
const checkSupabase = setInterval(() => {
    if (window.supabaseClient) {
        clearInterval(checkSupabase);
    } else {
        initSupabase();
    }
}, 200);

// Stop polling after 10 seconds to save resources
setTimeout(() => clearInterval(checkSupabase), 10000);
