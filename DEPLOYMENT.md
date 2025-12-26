# Deploying to Vercel

This guide will help you deploy your Quartier Spots application to Vercel.

## Prerequisites

1. A GitHub account (to connect your repository)
2. A Vercel account (sign up at https://vercel.com)
3. Your Supabase project URL and anon key

## Step 1: Prepare Your Repository

First, make sure your code is pushed to GitHub:

```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Push to GitHub (if you haven't already)
git push origin main
```

If you don't have a GitHub repository yet:

1. Go to https://github.com/new
2. Create a new repository (e.g., "quartier-spots-2")
3. Follow the instructions to push your local code to GitHub

## Step 2: Connect to Vercel

### Option A: Using Vercel Dashboard (Recommended for first deployment)

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Vercel will automatically detect it's a Next.js project

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**How to add them:**

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL (from Supabase Dashboard → Settings → API)
   - Environment: Production, Preview, Development (select all)
4. Click **Save**
5. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Where to find your Supabase credentials:**
- Go to your Supabase project dashboard
- Navigate to **Settings** → **API**
- Copy the **Project URL** and **anon/public key**

## Step 4: Deploy

1. Click **Deploy** in Vercel
2. Wait for the build to complete (usually 2-3 minutes)
3. You'll get a deployment URL like: `https://quartier-spots-2.vercel.app`

## Step 5: Configure Custom Domain (Optional)

If you have a custom domain:

1. In Vercel project settings, go to **Domains**
2. Add your domain (e.g., `quartier-spots.com`)
3. Follow Vercel's instructions to update your DNS settings
4. Wait for DNS propagation (can take up to 48 hours)

## Step 6: Update Supabase Settings

After deployment, update your Supabase project:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel deployment URL to **Site URL**:
   - `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**` (to allow all paths)

## Step 7: Set Up Google OAuth (After Deployment)

Now that you have a production URL, you can set up Google OAuth:

1. Follow the steps in `GOOGLE_AUTH_SETUP.md`
2. Use your Vercel deployment URL for the authorized origins
3. Example authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`

## Build Configuration

Vercel should auto-detect these settings, but if needed:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` or `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Make sure you added `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy after adding environment variables

**Error: TypeScript errors**
- Fix any TypeScript errors locally first
- Run `npm run build` locally to catch issues before deploying

### Runtime Errors

**Database connection errors**
- Check that environment variables are set correctly
- Verify Supabase project is active
- Check Supabase RLS policies are configured (run `supabase-rls-fix-v2.sql`)

**Authentication not working**
- Make sure Vercel URL is added to Supabase redirect URLs
- Check that site URL is configured in Supabase

### Vercel CLI Deployment

If using the CLI and you get prompted for settings:

```
? Set up and deploy "~/Documents/quartier-spots-2"? [Y/n] y
? Which scope do you want to deploy to? [Your username]
? Link to existing project? [y/N] n
? What's your project's name? quartier-spots-2
? In which directory is your code located? ./
```

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Production**: Pushes to `main` branch → `your-app.vercel.app`
- **Preview**: Pushes to other branches → Temporary preview URLs

## Environment Variables for Different Environments

You can have different environment variables for:

- **Production**: Your live site
- **Preview**: Pull request previews
- **Development**: Local development

This allows you to use different Supabase projects for testing vs. production.

## Next Steps After Deployment

1. Test the entire authentication flow
2. Set up Google OAuth with your production URL
3. Run the onboarding process
4. Create a test organization
5. Add test events and spots
6. Share the URL with beta testers

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Check deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel remove [deployment-url]
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
