/**
 * BUERNIX Single Blog Post Page
 */

document.addEventListener('DOMContentLoaded', () => {
    loadPost();
});

async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    const content = document.getElementById('postContent');
    const loading = document.getElementById('postLoading');

    if (!slug) {
        content.innerHTML = `
            <div class="text-center py-20">
                <p class="text-red-400">No post specified</p>
                <a href="blog.html" class="text-zinc-400 hover:text-white underline mt-4 inline-block">← Back to Blog</a>
            </div>
        `;
        loading.classList.add('hidden');
        return;
    }

    try {
        await waitForSupabase();

        const { data: post, error } = await window.supabaseClient
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) throw error;

        if (!post) {
            throw new Error('Post not found');
        }

        loading.classList.add('hidden');

        // Update page title
        document.title = `${post.title} | BUERNIX TECH`;

        // Render post
        content.innerHTML = `
            <article class="max-w-4xl mx-auto">
                <!-- Header -->
                <header class="mb-12">
                    <a href="blog.html" class="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition">
                        <iconify-icon icon="solar:arrow-left-bold" width="16"></iconify-icon>
                        Back to Blog
                    </a>
                    
                    ${post.featured_image ? `
                        <div class="aspect-video rounded-2xl overflow-hidden mb-8 bg-zinc-800">
                            <img src="${post.featured_image}" alt="${post.title}" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                    
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-white mb-4">
                        ${post.title}
                    </h1>
                    
                    <div class="flex items-center gap-4 text-sm text-zinc-400">
                        <time datetime="${post.published_at}">
                            ${new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
                        </time>
                    </div>
                </header>

                <!-- Content -->
                <div class="prose prose-invert prose-lg max-w-none">
                    ${post.content || '<p class="text-zinc-400">No content available.</p>'}
                </div>

                <!-- Footer -->
                <footer class="mt-16 pt-8 border-t border-white/10">
                    <a href="blog.html" class="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition">
                        <iconify-icon icon="solar:arrow-left-bold" width="16"></iconify-icon>
                        Back to all articles
                    </a>
                </footer>
            </article>
        `;

    } catch (error) {
        console.error('Error loading post:', error);
        loading.classList.add('hidden');
        content.innerHTML = `
            <div class="text-center py-20">
                <p class="text-red-400 mb-4">Post not found</p>
                <a href="blog.html" class="text-zinc-400 hover:text-white underline">← Back to Blog</a>
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
