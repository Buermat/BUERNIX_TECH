/**
 * BUERNIX Blog Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
});

async function loadBlogPosts() {
    const grid = document.getElementById('blogGrid');
    const loading = document.getElementById('blogLoading');

    if (!grid) return;

    try {
        // Wait for Supabase
        await waitForSupabase();

        const { data: posts, error } = await window.supabaseClient
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(12);

        if (error) throw error;

        loading.classList.add('hidden');

        if (!posts || posts.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-zinc-400">No blog posts yet. Check back soon!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = posts.map(post => `
            <article class="group bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div class="aspect-video bg-zinc-800 overflow-hidden">
                    ${post.featured_image
                ? `<img src="${post.featured_image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`
                : `<div class="w-full h-full flex items-center justify-center text-zinc-600">
                            <iconify-icon icon="solar:document-bold-duotone" width="48"></iconify-icon>
                           </div>`
            }
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-medium text-white mb-2 group-hover:text-zinc-200 transition-colors line-clamp-2">
                        ${post.title}
                    </h3>
                    <p class="text-sm text-zinc-400 mb-4 line-clamp-3">
                        ${post.excerpt || 'Read more...'}
                    </p>
                    <a href="post.html?slug=${post.slug}" 
                       class="inline-flex items-center gap-2 text-sm text-white hover:gap-3 transition-all">
                        Read Article
                        <iconify-icon icon="solar:arrow-right-bold" width="16"></iconify-icon>
                    </a>
                </div>
            </article>
        `).join('');

    } catch (error) {
        console.error('Error loading blog:', error);
        loading.classList.add('hidden');
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-red-400">Error loading posts. Please refresh.</p>
            </div>
        `;
    }
}

async function waitForSupabase() {
    let attempts = 0;
    while (!window.supabaseClient && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    if (!window.supabaseClient) throw new Error('Supabase not initialized');
}
