# Password Login Debugging Guide

## IMPORTANT: Password Setup Requires Email Confirmation

**If you're getting "Invalid login credentials" after setting a password:**

Supabase requires email confirmation when setting a password. Here's the proper workflow:

1. **Set Password in Profile Settings:**
   - Go to Settings → Profile Settings
   - Enter new password (min 6 chars) twice
   - Click "Passwort speichern"
   - **CHECK YOUR EMAIL** for confirmation link

2. **Confirm Password Change:**
   - Open the confirmation email from Supabase
   - Click the confirmation link
   - You'll be redirected to the app

3. **Now Password Login Works:**
   - Go to login page
   - Click "Passwort" tab
   - Enter email and password
   - Login should work!

## Alternative: Use Password Reset

If you're having issues with password setup:

1. Go to login page
2. Click "Passwort" tab
3. Click "Passwort vergessen?"
4. Enter your email
5. Check email and click reset link
6. Set new password on the reset page
7. Password is active immediately!

## Common Issues and Solutions

### 1. **Email/Password Provider Not Enabled in Supabase**

This is the most common issue. Check:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Make sure **Email** provider is enabled
4. Verify these settings:
   - ✅ Enable Email provider
   - ✅ Confirm email (optional, but recommended)
   - ✅ Secure email change (optional)

### 2. **User Has No Password Set**

If a user was created via Magic Link or OAuth, they don't have a password yet.

**Solution:**
1. Log in with Magic Link or Google OAuth
2. Go to **Settings** → **Profile Settings**
3. Scroll to "Passwort setzen/ändern" section
4. Set a password (minimum 6 characters)
5. Log out and try password login again

### 3. **Testing the Password Login Flow**

**Step-by-step test:**

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - You should see logs:
     ```
     Attempting password login for: user@example.com
     Password login response: { data: {...}, error: null }
     Password login successful, redirecting...
     ```

2. **If you see an error:**
   - `Invalid login credentials` → Wrong password OR user has no password set
   - `Email not confirmed` → User needs to verify email first
   - `Email provider is disabled` → Enable Email provider in Supabase dashboard

3. **Network Tab Check:**
   - Go to Network tab
   - Filter by "auth"
   - Look for POST request to `token?grant_type=password`
   - Check the response status and body

### 4. **Verify Supabase Configuration**

Check your environment variables:

```bash
# .env.local or similar
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. **Common Error Messages**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Invalid login credentials" | Wrong password or no password set | Set password in Profile Settings first |
| "Email not confirmed" | Email verification pending | Check email and click confirmation link |
| "Email provider is disabled" | Supabase config issue | Enable Email provider in dashboard |
| "User not found" | Email doesn't exist | Sign up first or check spelling |

### 6. **Testing Checklist**

- [ ] Supabase Email provider is enabled
- [ ] User account exists (created via Magic Link/OAuth)
- [ ] Password has been set in Profile Settings
- [ ] Password is at least 6 characters long
- [ ] Email is confirmed (if email confirmation is required)
- [ ] Correct email and password are being entered
- [ ] Browser console shows no JavaScript errors
- [ ] Network requests are reaching Supabase

### 7. **Quick Test Steps**

1. **Create Test User:**
   ```
   1. Go to http://localhost:3000/auth/login
   2. Use Magic Link with email: test@example.com
   3. Click the link in your email
   4. You'll be logged in
   ```

2. **Set Password:**
   ```
   1. Go to Settings → Profile Settings
   2. Scroll to "Passwort setzen/ändern"
   3. Enter password: "test123" (or anything 6+ chars)
   4. Confirm password: "test123"
   5. Click "Passwort speichern"
   6. See success message
   ```

3. **Test Password Login:**
   ```
   1. Log out
   2. Go to http://localhost:3000/auth/login
   3. Click "Passwort" toggle
   4. Enter email: test@example.com
   5. Enter password: test123
   6. Click "Anmelden"
   7. Should redirect to /flohmarkt/organizations
   ```

### 8. **Debugging in Browser Console**

Open the browser console and run:

```javascript
// Check if Supabase client is working
const supabase = window.supabase || createClient();
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
});
console.log({ data, error });
```

### 9. **Supabase Dashboard - Check User**

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user
3. Check the "Providers" column - should show "email"
4. If it only shows "google" or nothing, the user was created via OAuth and has no password

### 10. **Force Password Reset (Alternative)**

If all else fails, you can trigger a password reset:

```javascript
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'http://localhost:3000/auth/callback' }
);
```

## What Was Implemented

1. **Login Page** (`/app/auth/login/page.tsx`):
   - Toggle between Magic Link and Password modes
   - Password input field appears when Password mode is selected
   - Better error messages
   - Helpful hint about needing to set password first

2. **Profile Settings** (`/app/flohmarkt/components/settings/ProfileSettings.tsx`):
   - "Passwort setzen/ändern" section
   - Password validation (min 6 chars, passwords must match)
   - Success/error feedback

3. **Auth Callback** (`/app/auth/callback/page.tsx`):
   - Redirects to `/flohmarkt/organizations` after successful login

## Next Steps

If you're still having issues:

1. Check the browser console for specific error messages
2. Verify your Supabase project settings
3. Test with a fresh user account
4. Make sure you've set a password in Profile Settings before trying password login
