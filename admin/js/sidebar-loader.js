/**
 * BUERNIX OS - Enterprise Sidebar Loader
 * Centralizes navigation logic, hierarchy, and active state management.
 */

const SIDEBAR_CONFIG = [
    {
        title: "Dashboard",
        icon: "solar:widget-bold-duotone",
        path: "dashboard.html",
        type: "link" // Direct link
    },
    {
        title: "CRM (Growth)",
        icon: "solar:users-group-two-rounded-bold-duotone",
        type: "dropdown",
        children: [
            { title: "Clients", path: "crm-clients.html", icon: "solar:user-bold-duotone" },
            { title: "Enquiries", path: "enquiries.html", icon: "solar:suitcase-bold-duotone" },
            { title: "Pipeline", path: "crm-deals.html", icon: "solar:hand-money-bold-duotone" },
            { title: "Quotations", path: "quotes.html", icon: "solar:document-text-bold-duotone" },
            { title: "Bookings", path: "bookings.html", icon: "solar:calendar-bold-duotone" },
            { title: "Inquiries", path: "messages.html", icon: "solar:inbox-line-bold-duotone" }
        ]
    },
    {
        title: "Content Engine",
        icon: "solar:pen-new-square-bold-duotone",
        type: "dropdown",
        children: [
            { title: "Blog & News", path: "blog.html", icon: "solar:document-add-bold-duotone" },
            { title: "Projects", path: "projects.html", icon: "solar:folder-bold-duotone" },
            { title: "Services", path: "services.html", icon: "solar:layers-bold-duotone" },
            { title: "Media Library", path: "media.html", icon: "solar:gallery-bold-duotone" }
        ]
    },
    {
        title: "Analytics",
        icon: "solar:chart-2-bold-duotone",
        type: "dropdown",
        children: [
            { title: "Traffic Intelligence", path: "analytics.html", icon: "solar:graph-up-bold-duotone" },
            // Future: Form Performance, etc.
        ]
    },
    {
        title: "Team & Access",
        icon: "solar:shield-user-bold-duotone",
        type: "dropdown",
        children: [
            { title: "Team Members", path: "team.html", icon: "solar:users-group-rounded-bold-duotone" },
            // Future: Roles, Logs
        ]
    },
    {
        title: "System",
        icon: "solar:settings-bold-duotone",
        type: "dropdown",
        children: [
            { title: "Settings", path: "settings.html", icon: "solar:settings-minimalistic-bold-duotone" },
            // Future: Integrations, Security
        ]
    }
];

function initSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    // 1. Logo Section
    const logoHtml = `
        <div class="p-6 border-b border-white/10">
            <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-sm">B</div>
                <span class="text-lg font-bold tracking-tight">BUERNIX TECH</span>
            </div>
            <p class="text-xs text-zinc-500 mt-1">Enterprise OS</p>
        </div>
    `;

    // 2. Navigation Items
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

    let navHtml = `<nav class="flex-1 p-4 overflow-y-auto space-y-2">`;

    SIDEBAR_CONFIG.forEach((item, index) => {
        if (item.type === 'link') {
            const isActive = currentPath === item.path;
            const activeClass = isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white';

            navHtml += `
                <a href="./${item.path}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeClass}">
                    <iconify-icon icon="${item.icon}" width="20"></iconify-icon>
                    <span class="text-sm font-medium">${item.title}</span>
                </a>
            `;
        } else if (item.type === 'dropdown') {
            const hasActiveChild = item.children.some(child => child.path === currentPath);
            const isOpen = hasActiveChild || localStorage.getItem(`sidebar_open_${index}`) === 'true';

            const headerClass = hasActiveChild ? 'text-white' : 'text-zinc-400 hover:text-white';
            const arrowRotation = isOpen ? 'rotate-180' : '';
            const contentHeight = isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden';

            navHtml += `
                <div class="group">
                    <button onclick="toggleSidebarGroup(${index})" class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition ${headerClass}">
                        <div class="flex items-center gap-3">
                            <iconify-icon icon="${item.icon}" width="20"></iconify-icon>
                            <span class="text-sm font-medium">${item.title}</span>
                        </div>
                        <iconify-icon icon="solar:alt-arrow-down-bold-duotone" width="16" class="transition-transform duration-200 ${arrowRotation}" id="arrow-${index}"></iconify-icon>
                    </button>
                    <div id="group-${index}" class="space-y-1 pl-4 transition-all duration-300 ease-in-out ${contentHeight}">
                        <div class="pt-1 pb-1 border-l border-white/10 ml-2 pl-2 space-y-1">
                            ${item.children.map(child => {
                const isChildActive = currentPath === child.path;
                const childClass = isChildActive ? 'bg-blue-500/10 text-blue-400 border-blue-500/50' : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:border-white/10';

                return `
                                <a href="./${child.path}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition border-l-2 ${childClass}">
                                    <span>${child.title}</span>
                                </a>`;
            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    });

    navHtml += `</nav>`;

    // 3. User Menu
    const userMenuHtml = `
        <div class="p-4 border-t border-white/10">
            <button onclick="logout()" class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-sm">
                <iconify-icon icon="solar:logout-bold-duotone" width="16"></iconify-icon>
                Logout
            </button>
        </div>
    `;

    sidebar.innerHTML = logoHtml + navHtml + userMenuHtml;
}

// Toggle logic
window.toggleSidebarGroup = function (index) {
    const group = document.getElementById(`group-${index}`);
    const arrow = document.getElementById(`arrow-${index}`);

    const isClosed = group.classList.contains('max-h-0');

    if (isClosed) {
        group.classList.remove('max-h-0', 'opacity-0', 'overflow-hidden');
        group.classList.add('max-h-96', 'opacity-100');
        arrow.classList.add('rotate-180');
        localStorage.setItem(`sidebar_open_${index}`, 'true');
    } else {
        group.classList.add('max-h-0', 'opacity-0', 'overflow-hidden');
        group.classList.remove('max-h-96', 'opacity-100');
        arrow.classList.remove('rotate-180');
        localStorage.setItem(`sidebar_open_${index}`, 'false');
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', initSidebar);
