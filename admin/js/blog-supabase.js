// BUERNIX OS - CMS Engine
// Handles blog posts, list view, and editor logic

let simplemde = null;
let currentPostId = null;

// Determine if we are on the editor or the list view
const isEditor = document.getElementById('markdownEditor') !== null;

async function initCMS() {
    await initDashboard(); // Wait for user auth/base init

    if (isEditor) {
        initEditor();
    } else {
        loadBlogPosts();
    }
}

// ==========================================
// EDITOR LOGIC
// ==========================================
function initEditor() {
    // Initialize SimpleMDE
    simplemde = new SimpleMDE({
        element: document.getElementById("markdownEditor"),
        spellChecker: false,
        placeholder: "Start writing your masterpiece...",
        status: false,
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen"]
    });

    // Check if we are editing an existing post (URL param ?id=xyz)
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        loadPostForEditing(id);
    }
}

async function loadPostForEditing(id) {
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (data) {
            currentPostId = data.id;
            document.getElementById('postTitle').value = data.title;
            document.getElementById('postSlug').value = data.slug;
            document.getElementById('postExcerpt').value = data.excerpt || '';
            document.getElementById('seoTitle').value = data.seo_title || '';
            document.getElementById('seoDesc').value = data.seo_description || '';

            if (data.featured_image) {
                document.getElementById('imagePreview').src = data.featured_image;
                document.getElementById('imagePreview').classList.remove('hidden');
                document.getElementById('uploadPrompt').classList.add('hidden');
            }

            simplemde.value(data.content || '');

            // Update status indicator
            const statusInd = document.getElementById('statusIndicator');
            statusInd.textContent = data.status;
            statusInd.className = `text-xs font-medium uppercase tracking-wider ${data.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`;
            statusInd.classList.remove('hidden');
        }
    } catch (e) {
        console.error("Error loading post:", e);
        alert("Failed to load post.");
    }
}

// Auto-generate slug from title if empty
document.getElementById('postTitle')?.addEventListener('blur', function () {
    const slugInput = document.getElementById('postSlug');
    if (!slugInput.value) {
        slugInput.value = this.value
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
});

// Image Upload Handler (Base64 for now, Supabase Storage later recommended)
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image is too large. Max 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        document.getElementById('imagePreview').src = base64;
        document.getElementById('imagePreview').classList.remove('hidden');
        document.getElementById('uploadPrompt').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

async function savePost(status) {
    const title = document.getElementById('postTitle').value;
    if (!title) { alert("Please enter a title."); return; }

    const content = simplemde.value();
    const slug = document.getElementById('postSlug').value;
    const excerpt = document.getElementById('postExcerpt').value;
    const seo_title = document.getElementById('seoTitle').value;
    const seo_description = document.getElementById('seoDesc').value;
    const featured_image = document.getElementById('imagePreview').src;

    // If image src starts with blob or is empty/hidden logic, handle carefully. 
    // Here we assume base64 is in src if visible. if hidden, maybe null.
    const hasImage = !document.getElementById('imagePreview').classList.contains('hidden');
    const finalImage = hasImage ? featured_image : null;

    const postData = {
        title,
        slug: slug || title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
        content,
        excerpt,
        seo_title,
        seo_description,
        featured_image: finalImage,
        status,
        author_id: (await supabase.auth.getUser()).data.user?.id
    };

    if (status === 'published') {
        postData.published_at = new Date().toISOString();
    }

    try {
        let error;
        if (currentPostId) {
            // Update
            const res = await supabase.from('blog_posts').update(postData).eq('id', currentPostId);
            error = res.error;
        } else {
            // Create
            const res = await supabase.from('blog_posts').insert([postData]).select();
            if (res.data) currentPostId = res.data[0].id;
            error = res.error;
        }

        if (error) throw error;

        alert(`Post ${status === 'published' ? 'published' : 'saved'} successfully!`);
        if (!currentPostId) window.location.href = `./blog-editor.html?id=${currentPostId}`; // Reload to edit mode
        else loadPostForEditing(currentPostId); // Refresh state

    } catch (e) {
        console.error("Error saving post:", e);
        alert("Error saving post: " + e.message);
    }
}


// ==========================================
// LIST VIEW LOGIC
// ==========================================
async function loadBlogPosts() {
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        updateStats(data);
        renderTable(data);
    } catch (e) {
        console.error("Error loading blog posts:", e);
    }
}

function updateStats(posts) {
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;

    document.getElementById('statPublished').textContent = published;
    document.getElementById('statDrafts').textContent = drafts;
}

function renderTable(posts) {
    const tbody = document.getElementById('blogTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!posts || posts.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tbody.innerHTML = posts.map(post => `
        <tr class="hover:bg-white/5 transition group">
            <td class="px-6 py-4">
                <div class="font-medium text-white">${post.title}</div>
                <div class="text-xs text-zinc-500">/${post.slug}</div>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
        }">
                    ${post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 text-zinc-400">
                <div class="flex items-center gap-2">
                    <div class="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">A</div>
                    <span>Admin</span>
                </div>
            </td>
            <td class="px-6 py-4 text-zinc-400">
                --
            </td>
            <td class="px-6 py-4 text-zinc-400">
                ${new Date(post.created_at).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                    <a href="./blog-editor.html?id=${post.id}" class="p-2 hover:bg-white/10 rounded-lg text-white">
                        <iconify-icon icon="solar:pen-bold-duotone" width="16"></iconify-icon>
                    </a>
                    <button onclick="deletePost('${post.id}')" class="p-2 hover:bg-red-500/10 rounded-lg text-red-400">
                        <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="16"></iconify-icon>
                    </button>
                    <a href="#" class="p-2 hover:bg-white/10 rounded-lg text-zinc-400">
                        <iconify-icon icon="solar:link-circle-bold-duotone" width="16"></iconify-icon>
                    </a>
                </div>
            </td>
        </tr>
    `).join('');
}

async function deletePost(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) throw error;
        loadBlogPosts(); // Reload List
    } catch (e) {
        alert("Error deleting post: " + e.message);
    }
}


// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCMS);
} else {
    initCMS();
}
