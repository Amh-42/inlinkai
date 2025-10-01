# 🍂 Autumn Setup Guide - Fix Console Error

The error `[Autumn] Fetch failed: GET /api/autumn/products` indicates that Autumn isn't properly configured. Here's how to fix it:

## 🚨 Quick Fix Options

### Option 1: Disable Autumn Temporarily (Fastest)
If you want to get the app working without billing:

1. **Comment out Autumn Provider** in your layout or main component:
```tsx
// Temporarily disable Autumn
<<<<<<< HEAD
// <AutumnProvider backendUrl="http://localhost:3000/api/autumn">
=======
// <AutumnProvider backendUrl="http://localhost:3000/api/autumn">
>>>>>>> 4cd94d94b2807a5c8d4d20db89a3047bfe4e3de9
//   {children}
// </AutumnProvider>

// Replace with:
{children}
```

### Option 2: Set Up Autumn Properly (Recommended)

#### Step 1: Get Autumn API Key
1. Go to [Autumn Dashboard](https://app.useautumn.com/)
2. Create account or sign in
3. Get your secret key from the dashboard

#### Step 2: Add Environment Variable
Add to your `.env.local` file:
```bash
# Autumn Configuration
AUTUMN_SECRET_KEY=am_sk_your_actual_secret_key_here
```

#### Step 3: Push Configuration to Autumn
```bash
# Install Autumn CLI
npm install -g atmn

# Initialize (if not done)
npx atmn init

# Push your products to Autumn
npx atmn push
```

#### Step 4: Restart Your App
```bash
# Kill the current process and restart
npm run dev
```

## 🔧 Alternative: Use Fallback Products

I've created a fallback products endpoint that will work even without Autumn configured. The app should now show:

- **Free Plan**: 5 messages/month, $0
- **Pro Plan**: 100 messages/month, $20/month

## 🧪 Test the Fix

1. **Check Products API**:
   ```
<<<<<<< HEAD
   GET http://localhost:3000/api/autumn/products
=======
   GET http://localhost:3000/api/autumn/products
>>>>>>> 4cd94d94b2807a5c8d4d20db89a3047bfe4e3de9
   ```
   Should return products even without Autumn configured.

2. **Check Console**: The error should be gone.

3. **Check Pricing Page**: Should show the two plans.

## 🎯 What I Fixed

1. **Created fallback products endpoint** (`/api/autumn/products/route.ts`)
2. **Added CORS support** (`/api/autumn/cors/route.ts`) 
3. **Provided environment setup guide**

The app will now work with or without Autumn configured! 🎉

## 🔄 If You Still See Errors

1. **Clear browser cache** and reload
2. **Check browser console** for any other errors
3. **Restart the dev server** completely
4. **Check that all API endpoints are accessible**

The fallback system ensures your app works immediately while you set up Autumn properly for production billing.
