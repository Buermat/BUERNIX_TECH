// Team Management with Supabase (Updated with RBAC)
let supabase;
let team = [];
let editingId = null;

// Initialize
async function initTeam() {
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

    await loadTeam();
}

// Load team
async function loadTeam() {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;
        team = data || [];
        renderTeam();
    } catch (error) {
        console.error('Error loading team:', error);
    }
}

// Render team
function renderTeam() {
    const grid = document.getElementById('teamGrid');
    const emptyState = document.getElementById('emptyState');

    if (team.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = team.map(member => {
        // Parse permissions safely
        const perms = member.permissions || { cms: 'none', crm: 'none', ops: 'none', system: 'none' };

        return `
            <div class="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition group relative">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4">
                         <div class="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                            ${member.photo_url ? `<img src="${member.photo_url}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center"><iconify-icon icon="solar:user-circle-bold-duotone" width="32" class="text-zinc-600"></iconify-icon></div>`}
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-white">${member.name}</h3>
                            <p class="text-sm text-blue-400 font-medium">${member.role}</p>
                        </div>
                    </div>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                         <button onclick="editMember('${member.id}')" class="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg">
                            <iconify-icon icon="solar:pen-bold-duotone" width="16"></iconify-icon>
                        </button>
                        <button onclick="deleteMember('${member.id}')" class="p-2 text-red-400 hover:text-red-300 bg-zinc-800 rounded-lg">
                            <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="16"></iconify-icon>
                        </button>
                    </div>
                </div>
                
                <div class="mt-4 space-y-2">
                    <p class="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Access Level</p>
                    <div class="flex flex-wrap gap-2">
                        ${renderPermBadge('CMS', perms.cms)}
                        ${renderPermBadge('CRM', perms.crm)}
                        ${renderPermBadge('Ops', perms.ops)}
                        ${renderPermBadge('Sys', perms.system)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPermBadge(label, level) {
    if (!level || level === 'none') return '';
    let color = 'bg-zinc-800 text-zinc-400';
    if (level === 'read') color = 'bg-blue-500/10 text-blue-400';
    if (level === 'write') color = 'bg-green-500/10 text-green-400';
    if (level === 'admin') color = 'bg-purple-500/10 text-purple-400';

    return `<span class="px-2 py-1 rounded-md text-[10px] uppercase font-bold ${color}">${label}: ${level}</span>`;
}

// Open modal
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add Team Member';
    document.getElementById('teamForm').reset();
    document.getElementById('memberId').value = '';

    // Reset permissions
    document.getElementById('perm_content').value = 'none';
    document.getElementById('perm_crm').value = 'none';
    document.getElementById('perm_ops').value = 'none';
    document.getElementById('perm_system').value = 'none';

    document.getElementById('photoPreview').classList.add('hidden');
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
    document.getElementById('teamModal').classList.remove('hidden');
}

// Edit member
function editMember(id) {
    const member = team.find(m => m.id === id);
    if (!member) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Member Access';
    document.getElementById('memberId').value = id;
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberRole').value = member.role;
    document.getElementById('memberBio').value = member.bio || '';

    // Load Permissions
    const perms = member.permissions || {};
    document.getElementById('perm_content').value = perms.cms || 'none';
    document.getElementById('perm_crm').value = perms.crm || 'none';
    document.getElementById('perm_ops').value = perms.ops || 'none';
    document.getElementById('perm_system').value = perms.system || 'none';

    if (member.photo_url) {
        document.getElementById('previewImg').src = member.photo_url;
        document.getElementById('photoPreview').classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
    }

    document.getElementById('teamModal').classList.remove('hidden');
}

// Delete
async function deleteMember(id) {
    if (!confirm('Are you sure?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    loadTeam();
}

function closeModal() {
    document.getElementById('teamModal').classList.add('hidden');
}

// Photo preview logic
function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('photoPreview').classList.remove('hidden');
            document.getElementById('uploadPlaceholder').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}
function removePhoto(e) {
    e.stopPropagation();
    document.getElementById('photoInput').value = '';
    document.getElementById('previewImg').src = '';
    document.getElementById('photoPreview').classList.add('hidden');
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
}

// Save
document.getElementById('teamForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('memberName').value,
        role: document.getElementById('memberRole').value,
        bio: document.getElementById('memberBio').value,
        photo_url: document.getElementById('previewImg').src || '',
        permissions: {
            cms: document.getElementById('perm_content').value,
            crm: document.getElementById('perm_crm').value,
            ops: document.getElementById('perm_ops').value,
            system: document.getElementById('perm_system').value
        }
    };

    try {
        if (editingId) {
            await supabase.from('team_members').update(data).eq('id', editingId);
        } else {
            // Logic for new member... could get max order_index but keeping it simple for now
            await supabase.from('team_members').insert([data]);
        }
        await loadTeam();
        closeModal();
    } catch (err) {
        alert("Error saving: " + err.message);
    }
});

// Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeam);
} else {
    initTeam();
}

// Attach to window to ensure HTML onclick works
window.openAddModal = openAddModal;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.closeModal = closeModal;
window.previewPhoto = previewPhoto;
window.removePhoto = removePhoto;
