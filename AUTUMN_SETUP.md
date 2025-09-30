# Autumn Pricing Integration Setup

This guide will help you set up Autumn for pricing and billing in your InlinkAI application.

## 🚀 Quick Setup

### 1. Create Autumn Account
1. Go to [Autumn Dashboard](https://app.useautumn.com/)
2. Create your account
3. Get your API keys from the dashboard

### 2. Environment Variables
Add these to your `.env.local` file:

```bash
# Autumn Configuration
AUTUMN_SECRET_KEY=am_sk_your_secret_key_here

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
```

### 3. Configure Products in Autumn

#### Option A: Using CLI (Recommended)
```bash
# Initialize Autumn config
npx atmn init

# Push configuration to Autumn
npx atmn push
```

The `autumn.config.ts` file is already created with:
- **Free Plan**: 5 messages per month, $0
- **Pro Plan**: 100 messages per month, $20/month

#### Option B: Using Dashboard
1. Go to [Autumn Products](https://app.useautumn.com/products)
2. Create "Free" product with 5 messages/month (set as default)
3. Create "Pro" product with 100 messages/month + $20/month price

### 4. Stripe Integration
1. Go to [Autumn Integrations](https://app.useautumn.com/integrations/stripe)
2. Add your Stripe test secret key: `sk_test_...`
3. For production, use your live Stripe key

## 🎯 How It Works

### User Flow
1. **Free Users**: Get 5 AI messages per month automatically
2. **Upgrade**: Click "Upgrade to Pro" → `/pricing` page
3. **Checkout**: Stripe checkout for $20/month
4. **Pro Users**: Get 100 AI messages per month

### API Endpoints Created
- `POST /api/checkout` - Initiate Stripe checkout
- `POST /api/attach` - Complete purchase (when payment details on file)
- `POST /api/check-feature` - Check if user can use a feature
- `POST /api/track-usage` - Track feature usage
- `GET /api/customer` - Get customer subscription data

### Usage in Code
```typescript
import { checkFeatureAccess, trackFeatureUsage } from '@/lib/autumn-utils';

// Before sending AI message
const canSend = await checkFeatureAccess(userId, 'messages');
if (!canSend) {
  // Show upgrade prompt
  return;
}

// After sending message
await trackFeatureUsage(userId, 'messages', 1);
```

## 🔧 Integration Points

### Dashboard
- "Upgrade to Pro" button now routes to `/pricing`
- Shows "Free Trial • 14 days left" (you can customize this)

### Pricing Page
- Beautiful pricing cards with Free vs Pro comparison
- Handles Stripe checkout flow
- Matches your app's design system

### Feature Gating
Use the utility functions in `lib/autumn-utils.ts`:
- `canSendMessage(userId)` - Check if user can send messages
- `trackMessageUsage(userId)` - Track message usage
- `getRemainingMessages(userId)` - Get remaining message count

## 📝 Next Steps

1. **Test in Development**:
   ```bash
   npm run dev
   ```
   - Login and click "Upgrade to Pro"
   - Test the pricing page

2. **Set up Stripe Webhook** (for production):
   - Configure webhook in Stripe dashboard
   - Point to Autumn's webhook URL

3. **Customize Plans**:
   - Edit `autumn.config.ts` to add more features
   - Run `npx atmn push` to update

4. **Add More Features**:
   - Add new features to the config
   - Use `checkFeatureAccess()` before feature usage
   - Use `trackFeatureUsage()` after feature usage

## 🎨 Styling

The pricing page uses your existing CSS variables:
- `--text-primary`, `--text-secondary`
- `--bg-secondary`, `--border-color`
- `--accent-primary`
- `.cta-button` class

This ensures it matches your dashboard and overall design system perfectly.

## 🚨 Important Notes

- **Test Mode**: Use Stripe test keys for development
- **Production**: Switch to live keys and test thoroughly
- **Security**: Never expose secret keys in frontend code
- **Webhooks**: Set up Stripe webhooks for production billing

## 🆘 Troubleshooting

### Common Issues
1. **"Unauthorized" errors**: Check AUTUMN_SECRET_KEY is set
2. **Stripe errors**: Verify Stripe integration in Autumn dashboard
3. **Feature access denied**: Check if products are configured correctly

### Debug Mode
Add this to see Autumn API responses:
```typescript
console.log('Autumn response:', data);
```

The API routes already include detailed logging for debugging.
