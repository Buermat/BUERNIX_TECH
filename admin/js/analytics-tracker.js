// BUERNIX OS - Frontend Tracker
// Copy this script to your main website pages to track traffic

(function () {
    // CONFIG
    const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
    const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_KEY_HERE';

    // We assume the supabase client is loaded on the main page or we fetch it similarly
    // ideally, you'd include the supabase CDN link before this script

    function trackPageView() {
        if (!window.supabase) return; // Fail silently if no supabase

        const data = {
            event_type: 'page_view',
            page_path: window.location.pathname,
            source: document.referrer || 'direct',
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            // In a real app, use an IP geo-API service here to fill country/city
            country: 'Unknown',
            city: 'Unknown'
        };

        // Fire and forget
        window.supabase.from('analytics_events').insert([data]).then(() => {
            console.log('📡 BUERNIX Analytics: Event Sent');
        });
    }

    // Capture standard page view
    // check if loaded
    if (document.readyState === 'complete') {
        setTimeout(trackPageView, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(trackPageView, 1000));
    }

    // History API support (for SPAs) if needed
})();
