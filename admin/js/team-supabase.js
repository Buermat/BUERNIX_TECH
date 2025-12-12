// Team Management with Supabase
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

    // Load team
    await loadTeam();
}

// Load team from Supabase
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
        alert('Error loading team: ' + error.message);
    }
}

// Render team to grid
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

    grid.innerHTML = team.map(member => `
    <div class="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition text-center">
      <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-zinc-800">
        ${member.photo_url ? `<img src="${member.photo_url}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center"><iconify-icon icon="solar:user-circle-bold-duotone" width="48" class="text-zinc-600"></iconify-icon></div>`}
      </div>
      
      <h3 class="text-lg font-semibold mb-1">${member.name}</h3>
      <p class="text-sm text-zinc-400 mb-3">${member.role}</p>
      ${member.bio ? `<p class="text-xs text-zinc-500 mb-4 line-clamp-2">${member.bio}</p>` : ''}
      
      <div class="flex gap-2 pt-4 border-t border-white/5">
        <button onclick="editMember('${member.id}')" class="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition flex items-center justify-center gap-2">
          <iconify-icon icon="solar:pen-bold-duotone" width="16"></iconify-icon>
          Edit
        </button>
        <button onclick="deleteMember('${member.id}')" class="py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition flex items-center justify-center gap-2">
          <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="16"></iconify-icon>
        </button>
      </div>
    </div>
  `).join('');
}

// Open add modal
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add Team Member';
    document.getElementById('teamForm').reset();
    document.getElementById('memberId').value = '';
    document.getElementById('photoPreview').classList.add('hidden');
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
    document.getElementById('teamModal').classList.remove('hidden');
}

// Edit member
function editMember(id) {
    const member = team.find(m => m.id === id);
    if (!member) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Team Member';
    document.getElementById('memberId').value = id;
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberRole').value = member.role;
    document.getElementById('memberBio').value = member.bio || '';

    if (member.photo_url) {
        document.getElementById('previewImg').src = member.photo_url;
        document.getElementById('photoPreview').classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
    }

    document.getElementById('teamModal').classList.remove('hidden');
}

// Delete member
async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadTeam();
    } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('teamModal').classList.add('hidden');
    document.getElementById('teamForm').reset();
    editingId = null;
}

// Photo preview
function previewPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('photoPreview').classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function removePhoto(event) {
    event.stopPropagation();
    document.getElementById('photoInput').value = '';
    document.getElementById('previewImg').src = '';
    document.getElementById('photoPreview').classList.add('hidden');
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
}

// Form submission
document.getElementById('teamForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('memberName').value;
    const role = document.getElementById('memberRole').value;
    const bio = document.getElementById('memberBio').value;
    const photo_url = document.getElementById('previewImg').src || '';

    try {
        const memberData = {
            name,
            role,
            bio,
            photo_url
        };

        if (editingId) {
            // Update existing
            const { error } = await supabase
                .from('team_members')
                .update(memberData)
                .eq('id', editingId);

            if (error) throw error;
        } else {
            // Insert new - get max order_index
            const { data: maxOrder } = await supabase
                .from('team_members')
                .select('order_index')
                .order('order_index', { ascending: false })
                .limit(1);

            const nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].order_index + 1 : 0;

            const { error } = await supabase
                .from('team_members')
                .insert([{ ...memberData, order_index: nextOrder }]);

            if (error) throw error;
        }

        await loadTeam();
        closeModal();
    } catch (error) {
        console.error('Error saving member:', error);
        alert('Error saving member: ' + error.message);
    }
});

// Initialize on page load
initTeam();
