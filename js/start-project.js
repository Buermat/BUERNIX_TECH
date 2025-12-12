/**
 * BUERNIX Start Project Form Logic
 * Handles detailed enquiry submission to Supabase
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enquiryForm');
    const submitBtn = document.getElementById('submitBtn');

    if (form) {
        form.addEventListener('submit', handleEnquirySubmit);
    }
});

async function handleEnquirySubmit(e) {
    e.preventDefault();

    // UI Loading State
    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<iconify-icon icon="line-md:loading-loop" width="24"></iconify-icon> Processing...`;
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

    try {
        await waitForSupabase();

        // 1. Gather Data
        const formData = {
            full_name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,

            business_name: document.getElementById('businessName').value,
            business_description: document.getElementById('businessDescription').value,

            // Radio Buttons
            has_brand_identity: document.querySelector('input[name="brandIdentity"]:checked')?.value === 'true',
            budget_range: getBudgetVal(),
            timeline: document.querySelector('input[name="timeline"]:checked')?.value,
            contact_preference: document.querySelector('input[name="contactPref"]:checked')?.value,

            // Checkboxes (Services)
            services_needed: getCheckedValues('services'),

            additional_notes: document.getElementById('additionalNotes').value,

            // Metadata
            status: 'New',
            source: 'Start Project Form',
            created_at: new Date().toISOString()
        };

        console.log('Submitting Enquiry:', formData);

        // 2. Insert into Supabase
        const { data, error } = await window.supabaseClient
            .from('project_enquiries')
            .insert([formData])
            .select();

        if (error) throw error;

        // 3. Attempt to Sync with CRM (Optional enhancement)
        // If the email doesn't exist in crm_clients, we could auto-create a lead there too.
        // For now, we'll just log the enquiry. The admin can convert it later.

        // Success Feedback
        showToast('Enquiry Received!', 'We have received your project details. We will contact you within 24-48 hours.');
        form.reset();

        // Redirect to success page or home after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);

    } catch (error) {
        console.error('Submission Error:', error);
        showToast('Submission Failed', error.message || 'Please check your connection and try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    }
}

// Helpers
function getBudgetVal() {
    const selected = document.querySelector('input[name="budget"]:checked');
    if (!selected) return null;
    if (selected.value === 'Other') {
        const custom = document.getElementById('customBudget');
        return custom && custom.value.trim() ? custom.value.trim() : 'Other (Unspecified)';
    }
    return selected.value;
}

function getCheckedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Toast Notification
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast) return;

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    if (type === 'error') {
        toastIcon.className = 'w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500';
        toastIcon.innerHTML = '<iconify-icon icon="solar:danger-circle-bold" width="20"></iconify-icon>';
    } else {
        toastIcon.className = 'w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500';
        toastIcon.innerHTML = '<iconify-icon icon="solar:check-circle-bold" width="20"></iconify-icon>';
    }

    toast.classList.remove('translate-x-full');
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 5000);
}

async function waitForSupabase() {
    let attempts = 0;
    while (!window.supabaseClient && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    if (!window.supabaseClient) throw new Error('System unavailable (Supabase not initialized)');
}
