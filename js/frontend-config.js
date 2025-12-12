// BUERNIX Frontend Supabase Configuration (ES Module)
// Importing directly to avoid script tag loading issues
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://lpqwlbmmyblxpynmubsh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcXdsYm1teWJseHB5bm11YnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA5NjQsImV4cCI6MjA4MDk3Njk2NH0.4G05BGRrpHueQBhv8wt_AzDsfJ8PTK9TRa2yLNrsv0s';

// Global Client
let client = null;

try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ BUERNIX Public: Supabase Connected (ESM)');
} catch (e) {
    console.error('❌ Supabase Init Error:', e);
}

// Expose to window for other scripts
window.supabaseClient = client;
window.supabase = { createClient }; // Fallback for legacy checks
