// BUERNIX OS - System Engine
// Analytics Dashboard Logic

let events = [];

async function initAnalytics() {
    await initDashboard();
    loadEvents();
}

async function loadEvents() {
    try {
        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000); // Get last 1000 events

        if (error) throw error;
        events = data || [];

        updateStats();
        renderCharts();
        renderTables();
    } catch (e) {
        console.error("Error loading analytics:", e);
        // Fallback for empty/new table
        updateStats();
        renderTables();
    }
}

function updateStats() {
    const totalViews = events.filter(e => e.event_type === 'page_view').length;
    // Mock unique visitors based on simple logic (real app would use session IDs)
    const unique = new Set(events.map(e => e.id)).size;

    document.getElementById('statPageViews').textContent = totalViews.toLocaleString();
    document.getElementById('statVisitors').textContent = Math.floor(totalViews * 0.7).toLocaleString(); // Estimate

    // Top Country
    const countries = {};
    events.forEach(e => {
        const c = e.country || 'Unknown';
        countries[c] = (countries[c] || 0) + 1;
    });
    const topC = Object.keys(countries).sort((a, b) => countries[b] - countries[a])[0] || 'Global';

    document.getElementById('statCountryName').textContent = topC;
    document.getElementById('statCountryFlag').textContent = getFlag(topC);
}

function renderCharts() {
    // Traffic Line Chart
    const ctxTraffic = document.getElementById('trafficChart').getContext('2d');

    // Group by date (last 7 days fake grouping for demo if data sparse)
    // In real app, group properly by day
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dataPoints = [12, 19, 3, 5, 2, 3, 10]; // Placeholder until real data flows

    new Chart(ctxTraffic, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Page Views',
                data: dataPoints,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Source Doughnut Chart
    const ctxSource = document.getElementById('sourceChart').getContext('2d');
    new Chart(ctxSource, {
        type: 'doughnut',
        data: {
            labels: ['Direct', 'Social', 'Search', 'Referral'],
            datasets: [{
                data: [30, 50, 10, 10],
                backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } }
        }
    });
}

function renderTables() {
    // Top Pages
    const pages = {};
    events.forEach(e => {
        pages[e.page_path] = (pages[e.page_path] || 0) + 1;
    });
    const sortedPages = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 5);

    document.getElementById('pagesTableBody').innerHTML = sortedPages.length ? sortedPages.map(([path, count]) => `
        <tr class="hover:bg-white/5">
            <td class="px-4 py-3 font-mono text-xs text-blue-400">${path}</td>
            <td class="px-4 py-3 text-right text-white font-bold">${count}</td>
        </tr>
    `).join('') : '<tr><td colspan="2" class="p-4 text-center text-zinc-500">No data yet</td></tr>';

    // Recent Events
    document.getElementById('eventsTableBody').innerHTML = events.slice(0, 5).map(e => `
        <tr class="hover:bg-white/5">
            <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5">
                    <div class="h-2 w-2 rounded-full ${e.event_type === 'page_view' ? 'bg-blue-500' : 'bg-green-500'}"></div>
                    ${e.event_type}
                </span>
            </td>
            <td class="px-4 py-3 text-zinc-400">${e.city || 'Unknown'}, ${e.country || ''}</td>
            <td class="px-4 py-3 text-right text-zinc-500 text-xs">${new Date(e.created_at).toLocaleTimeString()}</td>
        </tr>
    `).join('');
}

function getFlag(countryName) {
    if (!countryName) return '🌍';
    if (countryName === 'United Arab Emirates' || countryName === 'UAE') return '🇦🇪';
    if (countryName === 'Ghana') return '🇬🇭';
    return '🌍';
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
    initAnalytics();
}
