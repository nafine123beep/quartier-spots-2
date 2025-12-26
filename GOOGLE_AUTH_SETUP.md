# Google Authentication Setup Guide

Your application already has Google OAuth implemented in the code. You just need to configure it in Supabase and Google Cloud Console.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in the required fields:
     - App name: "Quartier Spots" (or your app name)
     - User support email: your email
     - Developer contact email: your email
   - Add scopes (optional for basic auth):
     - `email`
     - `profile`
   - Add test users if in testing mode
   - Save and continue

6. Back to creating OAuth client ID:
   - Application type: **Web application**
   - Name: "Quartier Spots Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `https://yourdomain.com` (your production domain)
   - Authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
     - For local development, you might also add: `http://localhost:54321/auth/v1/callback`

7. Click **Create**
8. Copy the **Client ID** and **Client Secret** - you'll need these for Supabase

## Step 2: Configure Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and click to expand
5. Enable the Google provider by toggling it on
6. Enter your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
7. The callback URL will be shown - make sure this matches what you added in Google Cloud Console:
   - It should be: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
8. Click **Save**

## Step 3: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/login`

3. Click the **"Weiter mit Google"** button

4. You should be redirected to Google's sign-in page

5. After signing in with Google:
   - First-time users will be redirected to `/onboarding`
   - Existing users will be redirected to `/flohmarkt/organizations`

## Step 4: Production Setup

When deploying to production:

1. Update the **Authorized JavaScript origins** in Google Cloud Console:
   - Add your production domain (e.g., `https://quartier-spots.com`)

2. Update the **Authorized redirect URIs** in Google Cloud Console:
   - Keep the Supabase callback URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

3. If your OAuth consent screen is in "Testing" mode:
   - Publish your app to make it available to all users
   - Or add specific test users in the OAuth consent screen settings

## Troubleshooting

### Error: "redirect_uri_mismatch"
- The redirect URI in your request doesn't match any authorized redirect URIs in Google Cloud Console
- Double-check that the Supabase callback URL is added correctly

### Error: "access_denied"
- The app may be in testing mode with restricted users
- Add your test email to the OAuth consent screen's test users list
- Or publish the app to production

### Users not getting redirected to onboarding
- Check that the auth callback handler is working at `/auth/callback`
- Verify that the RLS policies allow profile and tenant creation
- Make sure you ran the `supabase-rls-fix-v2.sql` script

## Current Code Implementation

The Google authentication is already implemented in your codebase:

### Login Page (`/app/auth/login/page.tsx`)
```typescript
const handleGoogleLogin = async () => {
  setError(null);
  setLoading(true);

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    setError(error.message);
    setLoading(false);
  }
};
```

### Auth Callback Handler (`/app/auth/callback/page.tsx`)
- Automatically handles the OAuth callback
- Checks if user needs onboarding
- Redirects to appropriate page based on user status

### Onboarding Flow
- New Google users will go through the 3-step onboarding:
  1. Set username
  2. Set password (optional for Google users, but good for backup)
  3. Create or join organization

## Notes

- Google provides the user's email automatically
- The user's Google profile name can be used as the initial display name
- Users signing in with Google can still set a password for alternative login methods
- The system supports multiple login methods (Magic Link, Password, Google) for the same user
