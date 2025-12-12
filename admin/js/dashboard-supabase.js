// Supabase Dashboard Functions
let supabase;

// Initialize Supabase
async function initDashboard() {
    // Wait for supabase global
    let attempts = 0;
    while (!window.supabase) {
        if (attempts++ > 50) return; // Give up
        await new Promise(r => setTimeout(r, 100));
    }
    supabase = window.supabase;

    await checkAuth();
    loadDashboardStats();
}

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './index.html';
    }
}

async function loadDashboardStats() {
    try {
        console.log('Loading dashboard stats...');

        // 1. Projects Count (Existing)
        const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        updateText('dash-total-projects', projectCount || 0);

        // 2. Clients Count (CRM)
        const { count: clientCount } = await supabase
            .from('crm_clients')
            .select('*', { count: 'exact', head: true });

        updateText('dash-total-clients', clientCount || 0);

        // 3. Project Enquiries (New System)
        const { data: enquiries, count: enquiryCount } = await supabase
            .from('project_enquiries')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(5);

        // Update Enquiry Stats
        updateText('dash-total-enquiries', enquiryCount || 0);

        // New Badge
        const newCount = enquiries?.filter(e => e.status === 'New').length || 0;
        if (newCount > 0) {
            const badge = document.getElementById('dash-new-enquiries-badge');
            if (badge) {
                badge.classList.remove('hidden');
                badge.textContent = `${newCount} NEW`;
            }
        }

        // Render Recent Enquiries Table
        renderRecentEnquiries(enquiries || []);

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderRecentEnquiries(enquiries) {
    const tbody = document.getElementById('dash-recent-enquiries');
    if (!tbody) return;

    if (enquiries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-zinc-500">No enquiries found.</td></tr>`;
        return;
    }

    tbody.innerHTML = enquiries.map(e => `
        <tr class="hover:bg-white/5 transition border-b border-white/5 last:border-0 cursor-pointer" onclick="window.location.href='enquiries.html'">
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs uppercase">
                        ${e.business_name.substring(0, 2)}
                    </div>
                    <div>
                        <p class="font-medium text-white">${e.business_name}</p>
                        <p class="text-xs text-zinc-500">${e.full_name}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="text-zinc-300 text-xs">${(e.services_needed || ['General'])[0]}</span>
            </td>
            <td class="px-4 py-3">
                <span class="${getStatusColor(e.status)} px-2 py-0.5 rounded-full text-xs font-medium border border-white/5">
                    ${e.status}
                </span>
            </td>
            <td class="px-4 py-3 text-right text-xs text-zinc-500">
                ${new Date(e.created_at).toLocaleDateString()}
            </td>
        </tr>
    `).join('');
}

function updateText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

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

// Start
document.addEventListener('DOMContentLoaded', initDashboard);
