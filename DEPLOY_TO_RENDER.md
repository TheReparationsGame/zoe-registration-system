# Deploy to Render.com (Free) - Step-by-Step

This guide will have you deployed in 5 minutes with a live URL.

## What You Get

✅ Free tier includes everything needed for this demo  
✅ Public HTTPS URL like `https://zoe-registration-demo.onrender.com`  
✅ Auto-deploys when you push code  
✅ Database persists across restarts  

---

## Step 1: Push Code to GitHub

1. **Create a GitHub repo** (if you don't have one)
   - Go to [github.com/new](https://github.com/new)
   - Name it `zoe-registration-system`
   - Choose "Public" or "Private"
   - Click "Create repository"

2. **Push this code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/zoe-registration-system.git
   git push -u origin main
   ```

---

## Step 2: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click "Get Started" (it's free)
3. Sign up with GitHub (or email)
4. Authorize Render to access your GitHub repos

---

## Step 3: Create Web Service on Render

1. **In Render dashboard, click "New +"** → "Web Service"

2. **Connect Repository:**
   - Select `zoe-registration-system` repo
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `zoe-registration-demo` (or any name)
   - **Environment:** `Node`
   - **Region:** Select closest to you (e.g., "US East")
   - **Branch:** `main`
   - **Build Command:** Copy this exactly:
     ```
     npm install && npm --prefix frontend install && npm --prefix frontend run build && npm ci
     ```
   - **Start Command:** 
     ```
     node backend/server.js
     ```

4. **Plan:** Select "Free"

5. **Environment Variables:** Leave blank (not needed for demo)

6. **Click "Create Web Service"**

---

## Step 4: Wait for Deploy

- You'll see build logs in real-time
- Deployment takes 2-3 minutes
- Once complete, you'll see a green checkmark and a URL like:
  ```
  https://zoe-registration-demo.onrender.com
  ```

---

## Step 5: Send CEO the Link

Copy your URL and send it to the CEO:

```
Hi [CEO name],

Here's a working demo of what a modern patient registration system looks like for Zöe:

[YOUR_URL_HERE]

You can:
1. Fill out the New Registration form (multi-child support, validation)
2. See the Staff Dashboard showing submissions
3. Export all data as CSV for your EHR

This demo took weeks to build and deployed in minutes. It's ready to show the board.

Let me know what you think.
```

---

## Step 6: Keep It Running

Render's free tier will put your app to sleep after 15 minutes of inactivity. To keep it warm:

1. **In Render dashboard**, click your service
2. Go to "Settings"
3. Scroll down to "Environment"
4. Add a free monitoring tool or use a cron job

Or just refresh the link before showing it to the CEO (wakes it up).

---

## If Deploy Fails

**Check build logs:**
1. In Render dashboard, click your service
2. Go to "Logs" tab
3. Look for the error message

**Common fixes:**
- Missing `package-lock.json` → Run `npm install` locally, commit package-lock.json
- Node version mismatch → Render defaults to latest (usually fine)
- Port conflict → Remove any hardcoded port, let Render set it

**Still stuck?** The backend includes detailed error logging. Check the "Logs" tab in Render.

---

## Customize Your URL (Optional)

Render gives you `zoe-registration-demo.onrender.com` but you can add a custom domain:

1. In Render dashboard, go to "Settings"
2. Scroll to "Custom Domain"
3. Enter your domain (e.g., `register.zoepediatrics.com`)
4. Follow DNS setup instructions

This costs extra, but the free URL works great for a demo.

---

## What's Next

Once deployed:

1. **Test it** - Fill out a registration, check the dashboard
2. **Download CSV** - See data export format
3. **Show the CEO** - Send them the link
4. **Get feedback** - Use that to refine next steps

---

## Keep It Updated

When you make changes locally:

```bash
git add .
git commit -m "Update [feature]"
git push origin main
```

Render automatically re-deploys when you push to GitHub. Takes 1-2 minutes.

---

## Questions?

- **Render docs:** [render.com/docs](https://render.com/docs)
- **GitHub docs:** [github.com/docs](https://github.com/docs)
- **This app:** All code is open and modifiable

Good luck with the CEO pitch! 🚀
