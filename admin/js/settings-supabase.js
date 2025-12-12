// Settings Management
let supabase;

async function initSettings() {
    let attempts = 0;
    while (!window.getSupabase || !window.getSupabase()) {
        if (attempts++ > 50) {
            alert('Failed to initialize. Please refresh the page.');
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    supabase = window.getSupabase();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './index.html';
        return;
    }

    await loadSettings();
}

async function loadSettings() {
    try {
        // Try to get settings - if table doesn't exist, we'll create it
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .limit(1)
            .single();

        if (data) {
            // Populate form
            document.getElementById('siteTitle').value = data.site_title || '';
            document.getElementById('siteDescription').value = data.site_description || '';
            document.getElementById('contactUaePhone').value = data.contact_uae_phone || '';
            document.getElementById('contactUaeEmail').value = data.contact_uae_email || '';
            document.getElementById('contactGhanaPhone').value = data.contact_ghana_phone || '';
            document.getElementById('contactGhanaEmail').value = data.contact_ghana_email || '';
            document.getElementById('socialLinkedin').value = data.social_linkedin || '';
            document.getElementById('socialTwitter').value = data.social_twitter || '';
        }
    } catch (error) {
        console.log('Settings not found, will create on save');
    }
}

document.getElementById('settingsForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const settings = {
        site_title: document.getElementById('siteTitle').value,
        site_description: document.getElementById('siteDescription').value,
        contact_uae_phone: document.getElementById('contactUaePhone').value,
        contact_uae_email: document.getElementById('contactUaeEmail').value,
        contact_ghana_phone: document.getElementById('contactGhanaPhone').value,
        contact_ghana_email: document.getElementById('contactGhanaEmail').value,
        social_linkedin: document.getElementById('socialLinkedin').value,
        social_twitter: document.getElementById('socialTwitter').value
    };

    try {
        // Upsert settings (update if exists, insert if not)
        const { error } = await supabase
            .from('site_settings')
            .upsert({ id: 1, ...settings });

        if (error) throw error;

        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings: ' + error.message);
    }
});

initSettings();
