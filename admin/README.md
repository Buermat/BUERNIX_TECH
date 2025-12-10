# BUERNIX TECH Admin Dashboard

## 🎉 Admin Panel Successfully Created!

Your admin dashboard is now ready to use. Access it at: `admin/index.html`

### 📋 Features

✅ **Authentication System**
- Login page with session management
- Default credentials: `admin@buernix.com` / `admin123`

✅ **Dashboard Overview**
- Statistics cards
- Quick actions
- Recent activity feed

✅ **Project Management**
- Add/Edit/Delete projects
- Upload project images (Base64)
- Set project links and categories
- Full CRUD operations

✅ **Data Storage**
- All data stored in browser localStorage
- No backend required
- Persistent across sessions

---

## 🚀 Getting Started

### 1. Access Admin Panel
Open `admin/index.html` in your browser

### 2. Login
- **Email:** admin@buernix.com
- **Password:** admin123

### 3. Start Managing
- Add projects to your portfolio
- Manage team members (coming soon)
- Update site settings (coming soon)

---

## 📁 File Structure

```
BUERNIX_TECH/
├── admin/
│   ├── index.html          # Login page
│   ├── dashboard.html      # Main dashboard
│   ├── projects.html       # Project management
│   └── js/
│       ├── auth.js         # Authentication logic
│       ├── dashboard.js    # Dashboard functions
│       └── projects.js     # Project CRUD operations
├── index.html              # Public website
└── buernix_logo.png
```

---

## 🎨 Features Implemented

### ✅ Completed
- [x] Login/Authentication
- [x] Dashboard with stats
- [x] Projects CRUD (Create, Read, Update, Delete)
- [x] Image upload (Base64)
- [x] Responsive design
- [x] Dark theme matching main site

### 🚧 Coming Soon (Can be added)
- [ ] Services management
- [ ] Team member management
- [ ] Messages/Inquiries inbox
- [ ] Site settings editor
- [ ] Export/Import data
- [ ] Analytics dashboard

---

## 💾 Data Storage

All data is stored in browser `localStorage`:

```javascript
{
  "adminToken": "...",
  "adminUser": {...},
  "buernix_projects": [...]
}
```

### To backup your data:
1. Open browser console (F12)
2. Run: `console.log(localStorage)`
3. Copy the data

### To restore data:
1. Open browser console
2. Run: `localStorage.setItem('buernix_projects', 'YOUR_DATA')`

---

## 🔒 Security Notes

⚠️ **Important:** This is a client-side admin panel suitable for:
- Personal portfolios
- Small business sites
- Static websites
- Demo/prototype projects

**NOT recommended for:**
- E-commerce sites
- Sites with sensitive data
- Multi-user systems
- Production enterprise apps

### To improve security:
1. Change default password in `js/auth.js`
2. Add password hashing
3. Implement server-side authentication
4. Use a real database (Firebase, Supabase, etc.)

---

## 🎯 How to Use

### Adding a Project

1. Go to **Projects** page
2. Click **"Add Project"**
3. Fill in details:
   - Title
   - Category
   - URL (optional)
   - Description
   - Upload image
4. Click **"Save Project"**

### Editing a Project

1. Find the project card
2. Click **"Edit"**
3. Update details
4. Click **"Save Project"**

### Deleting a Project

1. Find the project card
2. Click **"Delete"**
3. Confirm deletion

---

## 🌐 Deploying to GitHub Pages

Your admin panel will work on GitHub Pages:

1. Push to GitHub
2. Enable GitHub Pages
3. Access at: `https://yourusername.github.io/BUERNIX_TECH/admin/`

**Note:** Anyone with the URL can access the login page. Consider:
- Using a different subdomain
- Adding IP restrictions
- Implementing 2FA

---

## 🛠️ Customization

### Change Login Credentials

Edit `admin/js/auth.js`:

```javascript
const DEFAULT_CREDENTIALS = {
  email: 'your-email@example.com',
  password: 'your-secure-password'
};
```

### Add More Project Categories

Edit `admin/projects.html`:

```html
<select id="projectCategory">
  <option value="Web Design">Web Design</option>
  <option value="Mobile App">Mobile App</option>
  <option value="Your Category">Your Category</option>
</select>
```

---

## 📞 Support

Need help? The admin panel is fully functional and ready to use!

**Next steps:**
1. Login to admin panel
2. Add your projects
3. Customize as needed
4. Push to GitHub

---

## 🎨 Design

- **Theme:** Dark mode matching main site
- **Fonts:** Inter + Manrope
- **Icons:** Iconify
- **Framework:** Tailwind CSS
- **Storage:** localStorage

---

**Enjoy your new admin panel! 🚀**
