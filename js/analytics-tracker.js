/**
 * BUERNIX Analytics Tracker
 * Tracks page views and sends to Supabase analytics_events table
 */

(async function () {
    // Wait for Supabase to be ready
    let attempts = 0;
    while (!window.supabaseClient && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.supabaseClient) {
        console.warn('Analytics: Supabase not available');
        return;
    }

    // Track page view
    try {
        const eventData = {
            event_type: 'page_view',
            page_url: window.location.pathname,
            page_title: document.title,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            created_at: new Date().toISOString()
        };

        await window.supabaseClient
            .from('analytics_events')
            .insert([eventData]);

        console.log('✅ Analytics: Page view tracked');
    } catch (error) {
        console.error('Analytics error:', error);
    }
})();
