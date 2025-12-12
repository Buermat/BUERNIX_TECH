// Services Management with Supabase
let supabase;
let services = [];
let editingId = null;

// Initialize
async function initServices() {
    let attempts = 0;
    while (!window.getSupabase || !window.getSupabase()) {
        if (attempts++ > 50) {
            alert('Failed to initialize. Please refresh the page.');
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    supabase = window.getSupabase();

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './index.html';
        return;
    }

    // Load services
    await loadServices();
}

// Load services from Supabase
async function loadServices() {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;

        services = data || [];
        renderServices();
    } catch (error) {
        console.error('Error loading services:', error);
        alert('Error loading services: ' + error.message);
    }
}

// Render services to grid
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    const emptyState = document.getElementById('emptyState');

    if (services.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = services.map(service => `
    <div class="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition">
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
          ${service.icon ? `<iconify-icon icon="${service.icon}" width="24" class="text-white"></iconify-icon>` : `<iconify-icon icon="solar:settings-bold-duotone" width="24" class="text-zinc-600"></iconify-icon>`}
        </div>
        <div class="flex items-center gap-2">
          ${service.visible ? '<span class="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">Visible</span>' : '<span class="px-2 py-1 bg-zinc-800 border border-white/10 rounded-lg text-xs text-zinc-500">Hidden</span>'}
        </div>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">${service.title}</h3>
      <p class="text-sm text-zinc-400 mb-4 line-clamp-3">${service.description || ''}</p>
      
      <div class="flex gap-2 pt-4 border-t border-white/5">
        <button onclick="editService('${service.id}')" class="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition flex items-center justify-center gap-2">
          <iconify-icon icon="solar:pen-bold-duotone" width="16"></iconify-icon>
          Edit
        </button>
        <button onclick="toggleVisibility('${service.id}')" class="py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition flex items-center justify-center gap-2">
          <iconify-icon icon="solar:eye-bold-duotone" width="16"></iconify-icon>
        </button>
        <button onclick="deleteService('${service.id}')" class="py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition flex items-center justify-center gap-2">
          <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="16"></iconify-icon>
        </button>
      </div>
    </div>
  `).join('');
}

// Open add modal
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Service';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceVisible').checked = true;
    document.getElementById('serviceModal').classList.remove('hidden');
}

// Edit service
function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Service';
    document.getElementById('serviceId').value = id;
    document.getElementById('serviceTitle').value = service.title;
    document.getElementById('serviceDescription').value = service.description || '';
    document.getElementById('serviceIcon').value = service.icon || '';
    document.getElementById('serviceVisible').checked = service.visible;

    document.getElementById('serviceModal').classList.remove('hidden');
}

// Toggle visibility
async function toggleVisibility(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;

    try {
        const { error } = await supabase
            .from('services')
            .update({ visible: !service.visible })
            .eq('id', id);

        if (error) throw error;

        await loadServices();
    } catch (error) {
        console.error('Error toggling visibility:', error);
        alert('Error toggling visibility: ' + error.message);
    }
}

// Delete service
async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadServices();
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error deleting service: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('serviceModal').classList.add('hidden');
    document.getElementById('serviceForm').reset();
    editingId = null;
}

// Form submission
document.getElementById('serviceForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('serviceTitle').value;
    const description = document.getElementById('serviceDescription').value;
    const icon = document.getElementById('serviceIcon').value;
    const visible = document.getElementById('serviceVisible').checked;

    try {
        const serviceData = {
            title,
            description,
            icon,
            visible
        };

        if (editingId) {
            // Update existing
            const { error } = await supabase
                .from('services')
                .update(serviceData)
                .eq('id', editingId);

            if (error) throw error;
        } else {
            // Insert new - get max order_index
            const { data: maxOrder } = await supabase
                .from('services')
                .select('order_index')
                .order('order_index', { ascending: false })
                .limit(1);

            const nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].order_index + 1 : 0;

            const { error } = await supabase
                .from('services')
                .insert([{ ...serviceData, order_index: nextOrder }]);

            if (error) throw error;
        }

        await loadServices();
        closeModal();
    } catch (error) {
        console.error('Error saving service:', error);
        alert('Error saving service: ' + error.message);
    }
});

// Initialize on page load
initServices();

// Attach to window to ensure HTML onclick works
window.openAddModal = openAddModal;
window.editService = editService;
window.toggleVisibility = toggleVisibility;
window.deleteService = deleteService;
window.closeModal = closeModal;
