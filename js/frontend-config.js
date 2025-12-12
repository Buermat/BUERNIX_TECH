// BUERNIX Frontend Supabase Configuration
const SUPABASE_URL = 'https://lpqwlbmmyblxpynmubsh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcXdsYm1teWJseHB5bm11YnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA5NjQsImV4cCI6MjA4MDk3Njk2NH0.4G05BGRrpHueQBhv8wt_AzDsfJ8PTK9TRa2yLNrsv0s';

// Global Client
window.supabaseClient = null;

async function initSupabase() {
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ BUERNIX Public: Supabase Connected');
    } else {
        console.error('❌ Supabase SDK not loaded');
    }
}

// Wait for CDN load
window.addEventListener('load', () => {
    // Check periodically if supabase is loaded (async script)
    const checkSupabase = setInterval(() => {
        if (window.supabase) {
            clearInterval(checkSupabase);
            initSupabase();
        }
    }, 100);
});
