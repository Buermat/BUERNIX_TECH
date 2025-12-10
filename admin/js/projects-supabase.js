// Supabase Projects Management
let supabase;
let projects = [];
let editingId = null;

// Initialize
async function initProjects() {
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

    // Load projects
    await loadProjects();
}

// Load projects from Supabase
async function loadProjects() {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        projects = data || [];
        renderProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
        alert('Error loading projects: ' + error.message);
    }
}

// Render projects to grid
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyState');

    if (projects.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = projects.map(project => `
    <div class="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition">
      <div class="aspect-video bg-zinc-800 overflow-hidden">
        ${project.image_url ? `<img src="${project.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">` : `
          <div class="w-full h-full flex items-center justify-center">
            <iconify-icon icon="solar:gallery-bold-duotone" width="40" class="text-zinc-600"></iconify-icon>
          </div>
        `}
      </div>
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <div>
            <span class="inline-block px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-400 mb-2">${project.category}</span>
            <h3 class="text-lg font-semibold">${project.title}</h3>
          </div>
        </div>
        ${project.description ? `<p class="text-sm text-zinc-400 mb-4 line-clamp-2">${project.description}</p>` : ''}
        ${project.link ? `<a href="${project.link}" target="_blank" class="text-sm text-blue-400 hover:text-blue-300 mb-4 block">View Project →</a>` : ''}
        
        <div class="flex gap-2 pt-4 border-t border-white/5">
          <button onclick="editProject('${project.id}')" class="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition flex items-center justify-center gap-2">
            <iconify-icon icon="solar:pen-bold-duotone" width="16"></iconify-icon>
            Edit
          </button>
          <button onclick="deleteProject('${project.id}')" class="py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition flex items-center justify-center gap-2">
            <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="16"></iconify-icon>
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Open add modal
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Project';
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
    document.getElementById('projectModal').classList.remove('hidden');
}

// Edit project
function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Project';
    document.getElementById('projectId').value = id;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectCategory').value = project.category;
    document.getElementById('projectLink').value = project.link || '';
    document.getElementById('projectDescription').value = project.description || '';

    if (project.image_url) {
        document.getElementById('previewImg').src = project.image_url;
        document.getElementById('imagePreview').classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
    }

    document.getElementById('projectModal').classList.remove('hidden');
}

// Delete project
async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('projectModal').classList.add('hidden');
    document.getElementById('projectForm').reset();
    editingId = null;
}

// Form submission
document.getElementById('projectForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('projectTitle').value;
    const category = document.getElementById('projectCategory').value;
    const link = document.getElementById('projectLink').value;
    const description = document.getElementById('projectDescription').value;
    const imageUrl = document.getElementById('previewImg').src || '';

    try {
        const projectData = {
            title,
            category,
            link,
            description,
            image_url: imageUrl
        };

        if (editingId) {
            // Update existing
            const { error } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', editingId);

            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('projects')
                .insert([projectData]);

            if (error) throw error;
        }

        await loadProjects();
        closeModal();
    } catch (error) {
        console.error('Error saving project:', error);
        alert('Error saving project: ' + error.message);
    }
});

// Image preview
function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('imagePreview').classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function removeImage(event) {
    event.stopPropagation();
    document.getElementById('imageInput').value = '';
    document.getElementById('previewImg').src = '';
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
}

// Initialize on page load
initProjects();
