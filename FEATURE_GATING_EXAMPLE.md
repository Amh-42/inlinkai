# Feature Gating Example

Here's how to integrate Autumn feature gating into your existing API routes:

## Example: AI Message Feature Gating

### Before (No Limits)
```typescript
// app/api/get-noticed/route.ts
export async function POST(request: NextRequest) {
  // ... existing code ...
  
  // Send AI message directly
  const aiResponse = await openai.chat.completions.create({
    // ... AI call
  });
  
  return NextResponse.json({ success: true, data: aiResponse });
}
```

### After (With Autumn Limits)
```typescript
// app/api/get-noticed/route.ts
import { Autumn } from "autumn-js";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Initialize Autumn
  const autumn = new Autumn({ secretKey: process.env.AUTUMN_SECRET_KEY });

  // Check if user can send messages
  const { data } = await autumn.check({
    customer_id: session.user.id,
    feature_id: 'messages',
  });

  if (!data?.allowed) {
    return NextResponse.json({ 
      error: 'Message limit reached',
      message: 'Upgrade to Pro for more messages',
      upgrade_url: '/pricing'
    }, { status: 403 });
  }

  // ... existing AI logic ...
  const aiResponse = await openai.chat.completions.create({
    // ... AI call
  });

  // Track usage after successful AI call
  await autumn.track({
    customer_id: session.user.id,
    feature_id: 'messages',
  });

  return NextResponse.json({ success: true, data: aiResponse });
}
```

## Frontend Integration

### Show Usage in Dashboard
```typescript
// In your dashboard component
const [remainingMessages, setRemainingMessages] = useState(0);

useEffect(() => {
  const fetchUsage = async () => {
    const response = await fetch('/api/customer');
    const result = await response.json();
    if (result.success) {
      const balance = result.customer.features?.messages?.balance || 0;
      setRemainingMessages(balance);
    }
  };
  
  fetchUsage();
}, []);

// Display in UI
<div>Messages remaining: {remainingMessages}</div>
```

### Handle Upgrade Prompts
```typescript
const handleAIRequest = async () => {
  const response = await fetch('/api/get-noticed', {
    method: 'POST',
    // ... request data
  });

  if (response.status === 403) {
    const error = await response.json();
    // Show upgrade prompt
    if (confirm(error.message + ' Upgrade now?')) {
      router.push('/pricing');
    }
    return;
  }

  // Handle success
  const result = await response.json();
  // ... handle result
};
```

## Routes to Update

Apply this pattern to these API routes:

1. **`/api/get-noticed`** - LinkedIn profile optimization
2. **`/api/be-chosen`** - CRM building
3. **`/api/stay-relevant`** - Industry insights
4. **Any other AI-powered features**

## Testing

1. **Free User**: Should be limited to 5 messages
2. **Pro User**: Should get 100 messages
3. **Limit Reached**: Should show upgrade prompt
4. **After Upgrade**: Should immediately get more messages

## Production Checklist

- [ ] Set `AUTUMN_SECRET_KEY` in environment
- [ ] Configure Stripe in Autumn dashboard
- [ ] Test checkout flow end-to-end
- [ ] Set up Stripe webhooks
- [ ] Monitor usage in Autumn dashboard
