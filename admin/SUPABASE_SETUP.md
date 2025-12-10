# Supabase Setup Guide for BUERNIX TECH

## 🎯 Quick Start

Follow these steps to connect your admin panel to Supabase.

---

## Step 1: Create Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub or email
4. Verify your email

---

## Step 2: Create New Project

1. Click **"New Project"**
2. Fill in details:
   - **Name:** `BUERNIX-TECH`
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to UAE (e.g., `Southeast Asia (Singapore)`)
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

---

## Step 3: Get API Keys

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (long string)

---

## Step 4: Update Configuration

1. Open `admin/js/supabase-config.js`
2. Replace:
   ```javascript
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
   ```
   With your actual values from Step 3

---

## Step 5: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy ALL content from `admin/supabase-schema.sql`
4. Paste into SQL editor
5. Click **"Run"**
6. You should see: "Success. No rows returned"

---

## Step 6: Create Admin User

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** `mathiasagbugbla@gmail.com`
   - **Password:** `Buer4499@` (or your preferred password)
   - **Auto Confirm User:** ✅ Check this
4. Click **"Create user"**

---

## Step 7: Create Storage Bucket

1. Go to **Storage**
2. Click **"New bucket"**
3. Fill in:
   - **Name:** `project-images`
   - **Public bucket:** ✅ Check this
4. Click **"Create bucket"**
5. Click on the bucket → **Policies** → **New policy**
6. Use template: **"Allow authenticated uploads"**

---

## Step 8: Update HTML Files

### Update `admin/index.html`

Add before `</head>`:
```html
<script src="./js/supabase-config.js"></script>
```

Change the script tag at bottom from:
```html
<script src="./js/auth.js"></script>
```
To:
```html
<script src="./js/auth-supabase.js"></script>
```

### Update `admin/dashboard.html`

Add before `</head>`:
```html
<script src="./js/supabase-config.js"></script>
```

Change the script tag at bottom from:
```html
<script src="./js/dashboard.js"></script>
```
To:
```html
<script src="./js/dashboard-supabase.js"></script>
```

### Update `admin/projects.html`

Add before `</head>`:
```html
<script src="./js/supabase-config.js"></script>
```

Change the script tags at bottom from:
```html
<script src="./js/dashboard.js"></script>
<script src="./js/projects.js"></script>
```
To:
```html
<script src="./js/dashboard-supabase.js"></script>
<script src="./js/projects-supabase.js"></script>
```

---

## Step 9: Test It!

1. Open `admin/index.html` in browser
2. Login with:
   - Email: `mathiasagbugbla@gmail.com`
   - Password: (the one you set in Step 6)
3. You should see the dashboard!
4. Go to Projects and try adding a project
5. Data is now stored in Supabase! ✅

---

## Step 10: Deploy to buernix.com

1. Upload entire `admin` folder to your server
2. Access at: `https://buernix.com/admin/`
3. Login and manage from anywhere!

---

## ✅ Checklist

- [ ] Created Supabase account
- [ ] Created project
- [ ] Got API keys
- [ ] Updated `supabase-config.js`
- [ ] Ran SQL schema
- [ ] Created admin user
- [ ] Created storage bucket
- [ ] Updated HTML files
- [ ] Tested login
- [ ] Tested adding project
- [ ] Deployed to buernix.com

---

## 🆘 Troubleshooting

### "Invalid API key"
- Double-check you copied the **anon/public** key, not service_role
- Make sure there are no extra spaces

### "User not found"
- Make sure you created the user in Authentication
- Check "Auto Confirm User" was enabled

### "Table does not exist"
- Run the SQL schema again
- Check for any errors in SQL editor

### "Cannot upload image"
- Make sure storage bucket is public
- Check upload policy is set

---

## 📞 Need Help?

If you get stuck, share:
1. What step you're on
2. Any error messages
3. Screenshots if helpful

---

**Ready to start? Go to https://supabase.com and create your account!** 🚀
