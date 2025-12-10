// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase credentials

// Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
const SUPABASE_URL = 'https://lpqwlbmmyblxpynmubsh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcXdsYm1teWJseHB5bm11YnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA5NjQsImV4cCI6MjA4MDk3Njk2NH0.4G05BGRrpHueQBhv8wt_AzDsfJ8PTK9TRa2yLNrsv0s';

// Global Supabase client
let supabaseClient = null;

// Initialize Supabase
(async function initSupabase() {
    try {
        // Load Supabase library from CDN
        if (!window.supabase) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        // Wait a bit for the library to be available
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create Supabase client
        if (window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized successfully');
        } else {
            console.error('❌ Supabase library not loaded');
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
    }
})();

// Export function to get Supabase client
window.getSupabase = function () {
    return supabaseClient;
};
