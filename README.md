# BUERNIX TECH - Enterprise SaaS Platform

Premium web development and AI automation agency platform with full-stack admin panel and Supabase backend.

## 🚀 Features

### Admin Panel
- **CRM System**: Client management, deals pipeline, activities tracking
- **Content Management**: Blog posts, projects, services, team members
- **Analytics Dashboard**: Real-time traffic intelligence, visitor tracking
- **Team Management**: Role-based access control (RBAC), permissions matrix
- **Operations**: Quotes, bookings, messages, settings

### Public Website
- **Dynamic Blog**: Listing page + individual post pages with slug routing
- **Contact Forms**: Lead generation connected to CRM
- **Analytics Tracking**: Page view tracking across all pages
- **Responsive Design**: Mobile-first, glassmorphism UI

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+ Modules)
- **Styling**: Tailwind CSS, Custom CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Charts**: Chart.js
- **Icons**: Iconify
- **Animations**: Custom CSS animations

## 📦 Setup

### 1. Clone Repository
```bash
git clone https://github.com/Buermat/BUERNIX_TECH.git
cd BUERNIX_TECH
```

### 2. Configure Supabase
Update your Supabase credentials in:
- `admin/js/supabase-config.js`
- `js/frontend-config.js`

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Import Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run `admin/buernix_os_schema.sql`

### 4. Run Locally
Simply open `index.html` (public site) or `admin/index.html` (admin panel) in your browser.

No build step required - uses vanilla JavaScript with ES modules!

## 📁 Project Structure

```
BUERNIX_TECH/
├── index.html              # Public homepage
├── blog.html               # Blog listing page
├── post.html               # Single blog post page
├── js/                     # Public site JavaScript
│   ├── frontend-config.js  # Supabase configuration
│   ├── frontend-main.js    # Contact form logic
│   ├── blog.js             # Blog listing logic
│   ├── post.js             # Single post logic
│   └── analytics-tracker.js # Page view tracking
├── admin/                  # Admin panel
│   ├── index.html          # Login page
│   ├── dashboard.html      # Main dashboard
│   ├── crm-clients.html    # CRM clients
│   ├── blog.html           # Blog management
│   ├── analytics.html      # Analytics dashboard
│   ├── team.html           # Team management
│   ├── js/                 # Admin JavaScript
│   │   ├── supabase-config.js
│   │   ├── sidebar-loader.js
│   │   └── ...
│   └── buernix_os_schema.sql # Database schema
└── assets/                 # Images and assets
```

## 🔐 Security

- **RLS Policies**: Row-level security enabled on all tables
- **Authentication**: Supabase Auth with email/password
- **Public Keys**: Only `anon` keys in frontend code
- **RBAC**: Role-based access control for team members

## 🧪 Testing

### Admin Panel
1. Import database schema
2. Create admin user in Supabase Auth
3. Login at `admin/index.html`
4. Test CRM, Blog, Analytics modules

### Public Site
1. Submit contact form → Check CRM Clients
2. Create blog post (status='published', add slug)
3. Visit `blog.html` → Click article → View `post.html?slug=...`
4. Check analytics in Admin → Analytics

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

This is a private enterprise project. For collaboration inquiries, contact: mathias@buernix.com

## 🌐 Live Demo

- **Public Site**: [Coming Soon]
- **Admin Panel**: [Private]

---

**Built with ❤️ by BUERNIX TECH**
