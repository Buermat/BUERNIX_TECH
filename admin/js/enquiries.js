/**
 * BUERNIX Admin Enquiries Logic
 * Fetches and manages project enquiries from Supabase
 */

let allEnquiries = [];
let currentEnquiryId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Supabase
    while (!window.supabase) await new Promise(r => setTimeout(r, 100)); // basic polling

    loadEnquiries();

    // Status connection check
    document.getElementById('connection-status').className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';

    // Filters
    document.getElementById('searchInput').addEventListener('input', renderEnquiries);
    document.getElementById('statusFilter').addEventListener('change', renderEnquiries);
});

async function loadEnquiries() {
    const { data, error } = await window.supabase
        .from('project_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading enquiries:', error);
        return;
    }

    allEnquiries = data;
    updateStats();
    renderEnquiries();
}

function updateStats() {
    document.getElementById('statTotal').textContent = allEnquiries.length;
    document.getElementById('statNew').textContent = allEnquiries.filter(e => e.status === 'New').length;
    document.getElementById('statQualified').textContent = allEnquiries.filter(e => e.status === 'Qualified').length;
    document.getElementById('statProposal').textContent = allEnquiries.filter(e => e.status === 'Proposal Sent').length;
}

function renderEnquiries() {
    const tableBody = document.getElementById('enquiriesTableBody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    const filtered = allEnquiries.filter(e => {
        const matchesSearch = (e.full_name?.toLowerCase().includes(search) ||
            e.business_name?.toLowerCase().includes(search) ||
            e.email?.toLowerCase().includes(search));
        const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    tableBody.innerHTML = filtered.map(e => `
        <tr class="hover:bg-white/5 transition border-b border-white/5 cursor-pointer" onclick="openModal('${e.id}')">
            <td class="px-6 py-4">
                <p class="text-white">${new Date(e.created_at).toLocaleDateString()}</p>
                <p class="text-xs text-zinc-500">${new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </td>
            <td class="px-6 py-4">
                <p class="font-medium text-white">${e.business_name || 'N/A'}</p>
                <p class="text-xs text-zinc-400">${e.full_name}</p>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                    ${(e.services_needed || []).slice(0, 2).map(s =>
        `<span class="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">${s}</span>`
    ).join('')}
                    ${(e.services_needed || []).length > 2 ? `<span class="text-xs text-zinc-500 self-center">+${e.services_needed.length - 2}</span>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 text-zinc-300">
                ${e.budget_range || '-'}
            </td>
            <td class="px-6 py-4">
                <span class="${getStatusColor(e.status)} px-2.5 py-1 rounded-full text-xs font-medium border border-white/5">
                    ${e.status}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button class="text-zinc-400 hover:text-white transition">
                    <iconify-icon icon="solar:eye-linear" width="20"></iconify-icon>
                </button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="6" class="px-6 py-8 text-center text-zinc-500">No enquiries found</td></tr>`;
}

// Modal Functions
function openModal(id) {
    const e = allEnquiries.find(x => x.id === id);
    if (!e) return;

    currentEnquiryId = id;

    // Populate Fields
    document.getElementById('modalBusinessName').textContent = e.business_name;
    document.getElementById('modalContactInfo').textContent = `${e.full_name} • ${e.email} • ${e.phone}`;

    document.getElementById('modalDescription').textContent = e.business_description || 'No description provided.';
    document.getElementById('modalNotes').textContent = e.additional_notes || 'No notes.';

    document.getElementById('modalServices').innerHTML = (e.services_needed || []).map(s =>
        `<span class="px-3 py-1 rounded-full bg-white/5 text-zinc-300 text-sm border border-white/10">${s}</span>`
    ).join('');

    document.getElementById('modalBudget').textContent = e.budget_range;
    document.getElementById('modalTimeline').textContent = e.timeline;
    document.getElementById('modalLocation').textContent = e.location || 'Unknown';
    document.getElementById('modalBrand').textContent = e.has_brand_identity ? 'Yes, has branding' : 'No, needs branding';
    document.getElementById('modalPreference').textContent = e.contact_preference;

    // Status Dropdown
    document.getElementById('modalStatusSelect').value = e.status;

    // Links
    const waNumber = e.phone.replace(/[^0-9]/g, '');
    document.getElementById('waLink').href = `https://wa.me/${waNumber}`;
    document.getElementById('emailLink').href = `mailto:${e.email}`;

    // Show Modal
    const modal = document.getElementById('enquiryModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal() {
    const modal = document.getElementById('enquiryModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentEnquiryId = null;
}

// Data Handling
async function updateStatus(newStatus) {
    if (!currentEnquiryId) return;

    const { error } = await window.supabase
        .from('project_enquiries')
        .update({ status: newStatus })
        .eq('id', currentEnquiryId);

    if (error) {
        alert('Failed to update status');
    } else {
        // Update local state
        const idx = allEnquiries.findIndex(e => e.id === currentEnquiryId);
        if (idx !== -1) allEnquiries[idx].status = newStatus;

        updateStats();
        renderEnquiries();
    }
}

// Helpers
function getStatusColor(status) {
    switch (status) {
        case 'New': return 'bg-blue-500/10 text-blue-400';
        case 'Contacted': return 'bg-yellow-500/10 text-yellow-400';
        case 'Qualified': return 'bg-purple-500/10 text-purple-400';
        case 'Proposal Sent': return 'bg-gold-500/10 text-gold-500';
        case 'Closed': return 'bg-red-500/10 text-red-400';
        case 'Converted': return 'bg-green-500/10 text-green-400';
        default: return 'bg-zinc-700 text-zinc-300';
    }
}

// Expose to window
window.openModal = openModal;
window.closeModal = closeModal;
window.updateStatus = updateStatus;
