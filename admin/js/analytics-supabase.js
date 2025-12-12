// BUERNIX OS - System Engine
// Analytics Dashboard Logic

let allEvents = [];
let trafficChartInstance = null;
let countryChartInstance = null;

async function initAnalytics() {
    await initDashboard();
    loadEvents();
}

async function loadEvents() {
    try {
        // Fetch more data to support 30 days
        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5000);

        if (error) throw error;
        allEvents = data || [];

        // Initial Render (Default to 7 days as set in HTML)
        updateDashboardByRange();

    } catch (e) {
        console.error("Error loading analytics:", e);
    }
}

window.updateDashboardByRange = function () {
    const range = document.getElementById('timeRange').value;
    const now = new Date();
    let startDate = new Date(); // copy

    if (range === 'today') {
        startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
        startDate.setDate(now.getDate() - 6); // Last 6 days + today = 7
        startDate.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
    }

    // Filter Events
    const filteredEvents = allEvents.filter(e => {
        const eventDate = new Date(e.created_at);
        return eventDate >= startDate;
    });

    updateStats(filteredEvents);
    renderCharts(filteredEvents, range, startDate);
    renderTables(filteredEvents);
}

function updateStats(events) {
    const totalViews = events.filter(e => e.event_type === 'page_view').length;
    // Simple unique visitor estimation by ID (or session if available)
    // Here we assume row ID is unique event, not session. 
    // In real app, you'd group by session_id or IP hash. 
    // We'll use a rough heuristic:
    const visitors = Math.floor(totalViews * 0.8) || 0;

    document.getElementById('statPageViews').textContent = totalViews.toLocaleString();
    document.getElementById('statVisitors').textContent = visitors.toLocaleString();

    // Top Country
    const countries = {};
    events.forEach(e => {
        const c = e.country || 'Unknown';
        countries[c] = (countries[c] || 0) + 1;
    });
    const sortedCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]);
    const topC = sortedCountries.length ? sortedCountries[0][0] : '--';

    document.getElementById('statCountryName').textContent = topC;
    document.getElementById('statCountryFlag').textContent = getFlag(topC);
}

function renderCharts(events, range, startDate) {
    // 1. Prepare Daily Data
    const days = [];
    const counts = [];
    const labels = [];

    if (range === 'today') {
        // Hourly breakdown for Today
        const hours = {};
        for (let i = 0; i < 24; i++) hours[i] = 0;

        events.forEach(e => {
            const h = new Date(e.created_at).getHours();
            hours[h]++;
        });

        Object.keys(hours).forEach(h => {
            labels.push(`${h}:00`);
            counts.push(hours[h]);
        });
    } else {
        // Daily breakdown
        const dateMap = {};
        // Fill all days in range with 0 first
        const numDays = range === '7d' ? 7 : 30;
        for (let i = 0; i < numDays; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            dateMap[key] = 0;
            if (!labels.includes(key)) labels.push(key);
        }

        events.forEach(e => {
            const d = new Date(e.created_at);
            const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (dateMap[key] !== undefined) dateMap[key]++;
        });

        labels.forEach(l => counts.push(dateMap[l]));
    }

    // 2. Render Traffic Chart (Line)
    const ctxTraffic = document.getElementById('trafficChart').getContext('2d');

    if (trafficChartInstance) trafficChartInstance.destroy();

    trafficChartInstance = new Chart(ctxTraffic, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Visitors',
                data: counts,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#1d4ed8'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#71717a' } },
                x: { grid: { display: false }, ticks: { color: '#71717a' } }
            }
        }
    });

    // 3. Render Country Chart (Doughnut)
    const countryCounts = {};
    events.forEach(e => {
        const c = e.country || 'Unknown';
        countryCounts[c] = (countryCounts[c] || 0) + 1;
    });

    // Sort and take top 5
    const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const countryLabels = topCountries.map(([c]) => c);
    const countryData = topCountries.map(([, count]) => count);

    // Colors
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    const ctxCountry = document.getElementById('countryChart').getContext('2d');
    if (countryChartInstance) countryChartInstance.destroy();

    countryChartInstance = new Chart(ctxCountry, {
        type: 'doughnut',
        data: {
            labels: countryLabels,
            datasets: [{
                data: countryData,
                backgroundColor: colors.slice(0, countryLabels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#9ca3af', usePointStyle: true, padding: 20 } }
            },
            cutout: '70%'
        }
    });
}

function renderTables(events) {
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
    `).join('') : '<tr><td colspan="2" class="p-4 text-center text-zinc-500">No data for this period</td></tr>';

    // Recent Events (Limit to 5 most recent in filtered list)
    document.getElementById('eventsTableBody').innerHTML = events.slice(0, 5).map(e => `
        <tr class="hover:bg-white/5">
            <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5">
                    <div class="h-2 w-2 rounded-full ${e.event_type === 'page_view' ? 'bg-blue-500' : 'bg-green-500'}"></div>
                    ${e.event_type}
                </span>
            </td>
            <td class="px-4 py-3 text-zinc-400">
                <span class="mr-1">${getFlag(e.country)}</span> ${e.country || 'Unknown'}
            </td>
            <td class="px-4 py-3 text-right text-zinc-500 text-xs">${formatTime(e.created_at)}</td>
        </tr>
    `).join('');
}

function getFlag(countryName) {
    if (!countryName) return '🌍';
    const low = countryName.toLowerCase();
    if (low.includes('united arab') || low.includes('uae')) return '🇦🇪';
    if (low.includes('ghana')) return '🇬🇭';
    if (low.includes('usa') || low.includes('united states')) return '🇺🇸';
    if (low.includes('uk') || low.includes('kingdom')) return '🇬🇧';
    if (low.includes('germany')) return '🇩🇪';
    if (low.includes('nigeria')) return '🇳🇬';
    return '🌍';
}

function formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
    initAnalytics();
}
