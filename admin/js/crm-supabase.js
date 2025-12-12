// BUERNIX OS - CMS Engine
// Handles Clients & Deals Logic

let clients = [];
let deals = [];
let currentClientId = null;
let currentDealId = null;

// Determine page context
const isClientsPage = document.getElementById('clientTableBody') !== null;
const isDealsPage = document.getElementById('col-new') !== null;

async function initCRM() {
    await initDashboard();

    if (isClientsPage) loadClients();
    if (isDealsPage) {
        // We need clients first to populate the select dropdown
        await fetchClientsForDropdown();
        loadDeals();
    }
}

// ==========================================
// CLIENTS LOGIC
// ==========================================

async function loadClients() {
    try {
        const { data, error } = await supabase
            .from('crm_clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        clients = data || [];
        updateClientStats();
        renderClientTable();
    } catch (e) {
        console.error("Error loading clients:", e);
    }
}

function updateClientStats() {
    const total = clients.length;
    const uae = clients.filter(c => c.region === 'uae').length;
    const ghana = clients.filter(c => c.region === 'ghana').length;
    const val = clients.reduce((acc, c) => acc + (c.total_value || 0), 0);

    document.getElementById('statTotalClients').textContent = total;
    document.getElementById('statUAE').textContent = uae;
    document.getElementById('statGhana').textContent = ghana;
    document.getElementById('statValue').textContent = '$' + val.toLocaleString();
}

function renderClientTable() {
    const tbody = document.getElementById('clientTableBody');
    const emptyState = document.getElementById('emptyState');

    if (clients.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tbody.innerHTML = clients.map(client => `
        <tr class="hover:bg-white/5 transition group">
            <td class="px-6 py-4">
                <div class="font-medium text-white">${client.company_name}</div>
                <div class="text-xs text-zinc-500">${client.industry || 'General'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-zinc-300">${client.contact_person || '--'}</div>
                <div class="text-xs text-zinc-500">${client.email || ''}</div>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 border border-white/10 text-zinc-300">
                    ${getRegionFlag(client.region)} ${client.region.toUpperCase()}
                </span>
            </td>
             <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}">
                    ${capitalize(client.status)}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                     <button onclick="editClient('${client.id}')" class="p-2 hover:bg-white/10 rounded-lg text-white">
                        <iconify-icon icon="solar:pen-bold-duotone" width="16"></iconify-icon>
                    </button>
                    <button onclick="deleteClient('${client.id}')" class="p-2 hover:bg-red-500/10 rounded-lg text-red-400">
                        <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="16"></iconify-icon>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Client Modal & Form
function openClientModal() {
    currentClientId = null;
    document.getElementById('clientForm').reset();
    document.getElementById('clientModal').classList.remove('hidden');
}

function closeClientModal() {
    document.getElementById('clientModal').classList.add('hidden');
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    currentClientId = id;
    document.getElementById('companyName').value = client.company_name;
    document.getElementById('industry').value = client.industry || '';
    document.getElementById('region').value = client.region || 'global';
    document.getElementById('contactPerson').value = client.contact_person || '';
    document.getElementById('email').value = client.email || '';
    document.getElementById('status').value = client.status || 'lead';
    document.getElementById('totalValue').value = client.total_value || '';

    document.getElementById('clientModal').classList.remove('hidden');
}

document.getElementById('clientForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        company_name: document.getElementById('companyName').value,
        industry: document.getElementById('industry').value,
        region: document.getElementById('region').value,
        contact_person: document.getElementById('contactPerson').value,
        email: document.getElementById('email').value,
        status: document.getElementById('status').value,
        total_value: document.getElementById('totalValue').value || 0
    };

    try {
        if (currentClientId) {
            await supabase.from('crm_clients').update(data).eq('id', currentClientId);
        } else {
            await supabase.from('crm_clients').insert([data]);
        }
        closeClientModal();
        loadClients();
    } catch (err) {
        alert("Error saving client: " + err.message);
    }
});

async function deleteClient(id) {
    if (!confirm("Delete this client?")) return;
    await supabase.from('crm_clients').delete().eq('id', id);
    loadClients();
}


// ==========================================
// DEALS LOGIC
// ==========================================

async function fetchClientsForDropdown() {
    const { data } = await supabase.from('crm_clients').select('id, company_name');
    const select = document.getElementById('dealClient');
    if (select) {
        select.innerHTML = data.map(c => `<option value="${c.id}">${c.company_name}</option>`).join('');
    }
}

async function loadDeals() {
    try {
        const { data, error } = await supabase
            .from('crm_deals')
            .select(`
                *,
                crm_clients (company_name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        deals = data || [];
        renderPipeline();
    } catch (e) {
        console.error("Error loading deals:", e);
    }
}

function renderPipeline() {
    // Reset cols
    ['new', 'qualification', 'proposal', 'closed_won'].forEach(stage => {
        const col = document.getElementById(`col-${stage}`);
        const count = document.getElementById(`count-${stage}`);
        if (col) col.innerHTML = '';
        if (count) count.textContent = '0';
    });

    deals.forEach(deal => {
        const col = document.getElementById(`col-${deal.stage}`);
        if (!col) return; // Skip unknown stages or closed_lost if not shown

        // Update count
        const countEl = document.getElementById(`count-${deal.stage}`);
        if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;

        const card = document.createElement('div');
        card.className = "bg-zinc-800 p-3 rounded-lg border border-white/5 hover:border-white/20 transition group cursor-pointer shadow-sm";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <h4 class="font-medium text-white text-sm">${deal.title}</h4>
                <button onclick="deleteDeal('${deal.id}', event)" class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                    <iconify-icon icon="solar:trash-bin-trash-bold" width="14"></iconify-icon>
                </button>
            </div>
            <p class="text-xs text-zinc-400 mb-2">${deal.crm_clients?.company_name || 'Unknown Client'}</p>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <span class="text-xs font-bold text-green-400">$${(deal.value || 0).toLocaleString()}</span>
                <span class="text-[10px] text-zinc-500">${new Date(deal.created_at).toLocaleDateString()}</span>
            </div>
        `;
        // Edit on click
        card.addEventListener('click', (e) => {
            // Don't trigger if delete button clicked
            if (!e.target.closest('button')) editDeal(deal);
        });

        col.appendChild(card);
    });
}

function openDealModal() {
    currentDealId = null;
    document.getElementById('dealForm').reset();
    document.getElementById('dealModal').classList.remove('hidden');
}

function closeDealModal() {
    document.getElementById('dealModal').classList.add('hidden');
}

function editDeal(deal) {
    currentDealId = deal.id;
    document.getElementById('dealTitle').value = deal.title;
    document.getElementById('dealClient').value = deal.client_id;
    document.getElementById('dealStage').value = deal.stage;
    document.getElementById('dealValue').value = deal.value;
    document.getElementById('dealModal').classList.remove('hidden');
}

document.getElementById('dealForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('dealTitle').value,
        client_id: document.getElementById('dealClient').value,
        stage: document.getElementById('dealStage').value,
        value: document.getElementById('dealValue').value
    };

    try {
        if (currentDealId) {
            await supabase.from('crm_deals').update(data).eq('id', currentDealId);
        } else {
            await supabase.from('crm_deals').insert([data]);
        }
        closeDealModal();
        loadDeals();
    } catch (err) {
        alert("Error saving deal: " + err.message);
    }
});

async function deleteDeal(id, event) {
    event.stopPropagation();
    if (!confirm("Delete deal?")) return;
    await supabase.from('crm_deals').delete().eq('id', id);
    loadDeals();
}

// Helpers
function getRegionFlag(region) {
    if (region === 'uae') return '🇦🇪';
    if (region === 'ghana') return '🇬🇭';
    return '🌍';
}

function getStatusColor(status) {
    switch (status) {
        case 'active': return 'bg-green-500/10 text-green-400';
        case 'lead': return 'bg-blue-500/10 text-blue-400';
        case 'prospect': return 'bg-yellow-500/10 text-yellow-400';
        case 'churned': return 'bg-red-500/10 text-red-400';
        default: return 'bg-zinc-800 text-zinc-400';
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCRM);
} else {
    initCRM();
}
