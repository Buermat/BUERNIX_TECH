// BUERNIX OS - Ops Engine
// Handles Quotes generation

let quotes = [];
let quoteItems = [];

const isQuotesPage = document.getElementById('quotesTableBody') !== null;

async function initOps() {
    await initDashboard();

    if (isQuotesPage) {
        loadQuotes();
        loadClientsForQuote();
        addItemRow(); // Default one item
    }
}

// ==========================================
// QUOTES LOGIC
// ==========================================

async function loadQuotes() {
    try {
        const { data, error } = await supabase
            .from('quotes')
            .select(`
                *,
                crm_clients (company_name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        quotes = data || [];
        renderQuotesTable();
    } catch (e) {
        console.error("Error loading quotes:", e);
    }
}

function renderQuotesTable() {
    const tbody = document.getElementById('quotesTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!quotes.length) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tbody.innerHTML = quotes.map(quote => `
        <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4 font-mono text-zinc-400">#${String(quote.quote_number).padStart(4, '0')}</td>
            <td class="px-6 py-4 text-white font-medium">${quote.crm_clients?.company_name || 'Unknown'}</td>
            <td class="px-6 py-4 text-zinc-300">${quote.title || 'Untitled Quote'}</td>
            <td class="px-6 py-4 text-white font-bold">${quote.currency} ${(quote.total_amount || 0).toLocaleString()}</td>
            <td class="px-6 py-4">
                <span class="text-xs px-2 py-0.5 rounded-full capitalize ${getStatusStyle(quote.status)}">
                    ${quote.status}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="downloadPDF('${quote.id}')" class="text-zinc-400 hover:text-white transition">
                    <iconify-icon icon="solar:file-download-bold-duotone" width="20"></iconify-icon>
                </button>
            </td>
        </tr>
    `).join('');
}

function getStatusStyle(status) {
    if (status === 'draft') return 'bg-zinc-800 text-zinc-400';
    if (status === 'sent') return 'bg-blue-500/10 text-blue-400';
    if (status === 'approved') return 'bg-green-500/10 text-green-400';
    return 'bg-red-500/10 text-red-400'; // rejected
}

async function loadClientsForQuote() {
    const { data } = await supabase.from('crm_clients').select('id, company_name');
    const select = document.getElementById('quoteClient');
    if (select) {
        select.innerHTML = data.map(c => `<option value="${c.id}">${c.company_name}</option>`).join('');
    }
}

// Item Rows Logic
window.addItemRow = function () { // Expose to window
    const container = document.getElementById('itemsContainer');
    const div = document.createElement('div');
    div.className = "grid grid-cols-12 gap-2 items-center quote-item-row";
    div.innerHTML = `
        <div class="col-span-6">
            <input type="text" placeholder="Description" class="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/30 item-desc">
        </div>
        <div class="col-span-2">
            <input type="number" placeholder="Qty" value="1" min="1" class="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/30 item-qty" onchange="calculateTotal()">
        </div>
        <div class="col-span-3">
            <input type="number" placeholder="Price" class="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/30 item-price" onchange="calculateTotal()">
        </div>
        <div class="col-span-1 text-right">
            <button type="button" onclick="this.parentElement.parentElement.remove(); calculateTotal()" class="text-red-400 hover:text-red-300">
                <iconify-icon icon="solar:trash-bin-minimalistic-bold" width="16"></iconify-icon>
            </button>
        </div>
    `;
    container.appendChild(div);
};

window.calculateTotal = function () {
    let total = 0;
    document.querySelectorAll('.quote-item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        total += qty * price;
    });
    document.getElementById('displayTotal').textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    return total;
};

// Form & PDF Logic
const quoteModal = document.getElementById('quoteModal');
if (quoteModal) {
    window.openQuoteModal = () => quoteModal.classList.remove('hidden');
    window.closeQuoteModal = () => quoteModal.classList.add('hidden');
}

document.getElementById('quoteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const items = [];
    document.querySelectorAll('.quote-item-row').forEach(row => {
        items.push({
            description: row.querySelector('.item-desc').value,
            qty: parseFloat(row.querySelector('.item-qty').value),
            price: parseFloat(row.querySelector('.item-price').value)
        });
    });

    const data = {
        client_id: document.getElementById('quoteClient').value,
        title: document.getElementById('quoteTitle').value,
        currency: document.getElementById('quoteCurrency').value,
        items: items,
        total_amount: window.calculateTotal(),
        status: 'draft'
    };

    try {
        await supabase.from('quotes').insert([data]);
        closeQuoteModal();
        loadQuotes();
        // Reset form
        document.getElementById('itemsContainer').innerHTML = '';
        addItemRow();
    } catch (err) {
        alert("Error saving quote: " + err.message);
    }
});

// PDF Generation (Client-side)
window.downloadPDF = async function (id) {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;

    // Populate Template
    document.getElementById('pdfQuoteNum').textContent = String(quote.quote_number).padStart(4, '0');
    document.getElementById('pdfClientName').textContent = quote.crm_clients?.company_name;
    document.getElementById('pdfProjectTitle').textContent = quote.title;
    document.getElementById('pdfTotal').textContent = `${quote.currency} ${quote.total_amount.toLocaleString()}`;

    const itemsBody = document.getElementById('pdfItemsBody');
    itemsBody.innerHTML = (quote.items || []).map(item => `
        <tr class="border-b border-gray-100">
            <td class="py-2 px-4 text-left">${item.description}</td>
            <td class="py-2 px-4 text-right">${item.qty}</td>
            <td class="py-2 px-4 text-right">${item.price.toLocaleString()}</td>
            <td class="py-2 px-4 text-right font-medium">${(item.qty * item.price).toLocaleString()}</td>
        </tr>
    `).join('');

    // Generate
    const element = document.getElementById('pdfTemplate');
    element.classList.remove('hidden');

    const opt = {
        margin: 0.5,
        filename: `Quote_${quote.quote_number}_${quote.crm_clients?.company_name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } finally {
        element.classList.add('hidden');
    }
};

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOps);
} else {
    initOps();
}
