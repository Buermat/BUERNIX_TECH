/**
 * BUERNIX Frontend Logic
 * Handles Contact Form, Newsletter, and interactive elements.
 */

document.addEventListener('DOMContentLoaded', () => {
    setupContactForm();
});

function setupContactForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // 1. Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="animate-pulse">Sending...</span>`;

        // 2. Gather Data
        company_name: document.getElementById('name').value, // Required field in DB
            contact_person: document.getElementById('name').value,
                email: document.getElementById('email').value,
                    industry: document.getElementById('service').value,
                        status: 'lead',
                            // source: 'website' (column doesn't exist, will add to notes)
                            notes: `Source: Website Contact\nService: ${document.getElementById('service').value}\n\nMessage:\n${document.getElementById('message').value}`,
                                created_at: new Date().toISOString()

        try {
            if (!window.supabaseClient) throw new Error("Database not connected");

            // 3. Send to Supabase
            const { data, error } = await window.supabaseClient
                .from('crm_clients')
                .insert([formData]);

            if (error) throw error;

            // 4. Success UI
            form.reset();
            showToast('Message sent! Our AI team will contact you shortly.', 'success');

        } catch (error) {
            console.error('Submission error:', error);
            showToast('Error sending message. Please try WhatsApp instead.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

function showToast(message, type = 'success') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed bottom-8 right-8 px-6 py-4 rounded-xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl z-50 transition-all duration-500 transform translate-y-10 opacity-0 ${type === 'success'
        ? 'bg-green-500/10 border-green-500/20 text-green-400'
        : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`;

    toast.innerHTML = `
        <iconify-icon icon="${type === 'success' ? 'solar:check-circle-bold' : 'solar:danger-circle-bold'}" width="24"></iconify-icon>
        <span class="font-medium font-sans">${message}</span>
    `;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    // Remove after 5s
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}
