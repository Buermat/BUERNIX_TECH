// Messages Management
let supabase;
let messages = [];

async function initMessages() {
    let attempts = 0;
    while (!window.getSupabase || !window.getSupabase()) {
        if (attempts++ > 50) {
            alert('Failed to initialize. Please refresh the page.');
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    supabase = window.getSupabase();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './index.html';
        return;
    }

    await loadMessages();
}

async function loadMessages() {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        messages = data || [];
        renderMessages();
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function renderMessages() {
    const list = document.getElementById('messagesList');
    const emptyState = document.getElementById('emptyState');

    if (messages.length === 0) {
        list.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    list.classList.remove('hidden');
    emptyState.classList.add('hidden');

    list.innerHTML = messages.map(msg => `
    <div class="bg-zinc-900 border border-white/10 rounded-2xl p-6 ${!msg.is_read ? 'border-blue-500/20' : ''}">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="font-semibold">${msg.name}</h3>
          <p class="text-sm text-zinc-400">${msg.email}</p>
        </div>
        <div class="flex items-center gap-2">
          ${!msg.is_read ? '<span class="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">New</span>' : ''}
          <button onclick="deleteMessage('${msg.id}')" class="p-2 hover:bg-red-500/10 rounded-lg text-red-400">
            <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="16"></iconify-icon>
          </button>
        </div>
      </div>
      ${msg.subject ? `<p class="text-sm font-medium mb-2">${msg.subject}</p>` : ''}
      <p class="text-sm text-zinc-300">${msg.message}</p>
      <p class="text-xs text-zinc-500 mt-4">${new Date(msg.created_at).toLocaleString()}</p>
    </div>
  `).join('');
}

async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;

    try {
        const { error } = await supabase.from('messages').delete().eq('id', id);
        if (error) throw error;
        await loadMessages();
    } catch (error) {
        alert('Error deleting message: ' + error.message);
    }
}

initMessages();
