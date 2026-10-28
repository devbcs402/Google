Listed directory client
Created vercel.json
Created _redirects
Ran command: `git status`
Ran command: `git remote -v`

Here is the complete step-by-step guide to deploy your **Email Vault Manager** full-stack application **100% free of cost** using the industry-standard stack:

- **Database**: MongoDB Atlas (Free Tier — already configured)
- **Backend API**: [Render.com](https://render.com) (Free Web Service)
- **Frontend UI**: [Vercel.com](https://vercel.com) (Free Hosting for React + Vite)

---

### Step 1: Push Your Latest Code to GitHub

Your repository is already connected to `https://github.com/devbcs402/Google.git`. Let's commit and push your latest code (including the Backup feature and routing configs):

Open a terminal in `d:\YASH KACHA\Google` and run:

```bash
git add .
git commit -m "feat: complete email vault manager with backup and deployment config"
git push origin main
```

*(Note: `.env` is already in `.gitignore`, so your database passwords and secrets remain private and are never pushed to GitHub).*

---

### Step 2: Ensure MongoDB Atlas Allows Cloud Connections

Render's free servers run in the cloud with dynamic IPs, so your Atlas cluster needs to allow external connections:

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com/).
2. In the left sidebar, click **Security** → **Network Access**.
3. Verify that **`0.0.0.0/0`** (*Allow access from anywhere*) is in your IP Access List with status **Active**. If not, click **Add IP Address** → **Allow Access from Anywhere** → **Confirm**.

---

### Step 3: Deploy the Backend on Render (Free)

1. Go to [render.com](https://render.com) and sign up / log in with your **GitHub** account.
2. Click **New +** in the top navigation and select **Web Service**.
3. Select **Build and deploy from a Git repository**, then choose your `Google` repository.
4. Fill in these settings:
   - **Name**: `email-vault-api` (or any name you prefer)
   - **Region**: Choose the closest one to you (e.g., *Singapore* or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: `server` ⚠️ *(Important: type `server` here)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Select **Free** ($0/month)

5. Scroll down to **Environment Variables** and click **Add Environment Variable** for each:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://ykacha0311_db_user:Nwc8cRD157oEOfiE@cluster0.eqfoksj.mongodb.net/emailvault?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `7a3c8e9f1b4d2e5a8c9b0e1f3a5d7c9e2b4f6a8d0c2e4f6a8b0d2e4f6a8b0c2e` |
   | `CLIENT_URL` | `*` *(We will change this to your exact Vercel domain in Step 5)* |

6. Click **Deploy Web Service**.
7. Wait 2–3 minutes. Once it says **Live**, copy your Render API URL at the top (e.g. `https://email-vault-api.onrender.com`).

---

### Step 4: Deploy the Frontend on Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and log in with your **GitHub** account.
2. Click **Add New…** → **Project**.
3. Find your `Google` repository and click **Import**.
4. In the configuration screen:
   - **Project Name**: `email-vault-manager`
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **Edit** and select `client` ⚠️ *(Important: choose `client`)*
5. Open the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://email-vault-api.onrender.com/api` *(Paste your Render URL from Step 3 with `/api` appended at the end)*
6. Click **Deploy**.
7. In about 45 seconds, Vercel will complete the build and give you a live production URL (e.g. `https://email-vault-manager.vercel.app`).

---

### Step 5: Final Security Step (Lock Down CORS)

1. Go back to your [Render.com Dashboard](https://dashboard.render.com).
2. Select your `email-vault-api` service → **Environment**.
3. Edit the `CLIENT_URL` variable:
   - Change `*` to your exact Vercel frontend URL: `https://email-vault-manager.vercel.app`
4. Click **Save Changes**. Render will automatically redeploy with strict CORS protection.

---

### Summary Checklist

- [x] `client/vercel.json` and `client/public/_redirects` created (prevents 404 errors on page refresh)
- [x] Dynamic `VITE_API_URL` environment configuration in Axios client
- [x] Backend CORS configured with `exposedHeaders: ['Content-Disposition']` for PDF backup downloads
- [x] Zero server-side file storage for maximum free-tier performance
- [x] Free MongoDB Atlas database, free Render backend, free Vercel frontend