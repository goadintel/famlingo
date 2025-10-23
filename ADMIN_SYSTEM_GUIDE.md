# FamLingo Admin Management System

**Created:** 2025-10-22
**Version:** 1.0
**Purpose:** Complete admin control panel for managing subscriptions, usage, and analytics

---

## 🎯 Overview

The Admin Management System gives you **full control** over:
- User subscriptions (Free, Premium, Family tiers)
- Usage tracking (pronunciations, translations, TTS)
- Analytics and revenue metrics
- Cost monitoring
- Data export/import

---

## 🔐 Access the Admin Dashboard

### URL:
```
https://famlingo-api.com/admin
```

### Default Password:
```
famlingo-admin-2025
```

**⚠️ IMPORTANT:** Change this password in production! Edit `/src/stores/admin.js` line 103

---

## 💰 Subscription Tiers

### Free Tier
- **Price:** $0/month
- **Limit:** 100 pronunciations/month
- **Users:** 1 user only
- **Features:** Basic phrases, limited access
- **Cost to you:** ~$0.40/user/month (API costs)

### Premium Tier
- **Price:** $2.99/month (¥19.9)
- **Limit:** Unlimited pronunciations
- **Users:** 1 user
- **Features:** All phrases, ad-free, priority support
- **Cost to you:** ~$1.30/month @ 300 uses
- **Profit:** ~$1.69/month (57% margin)

### Family Plan
- **Price:** $7.49/month (¥49.9)
- **Limit:** Unlimited pronunciations
- **Users:** Up to 10 family members
- **Features:** Everything in Premium + shared dashboard
- **Cost to you:** ~$4/month @ 1000 uses
- **Profit:** ~$3.49/month (47% margin)

---

## 📊 Admin Dashboard Features

### 1. **Subscriptions Tab**
- View all active/cancelled subscriptions
- Add test subscriptions
- Upgrade/downgrade users
- Cancel/reactivate subscriptions
- Filter by tier

### 2. **Usage Analytics Tab**
- Total pronunciations this month
- Total translations
- Total costs (API fees)
- Top users by usage
- Detailed usage breakdown per family
- Cost tracking

### 3. **Families Tab**
- Search families by ID
- Filter by tier
- View usage vs limits
- See remaining pronunciations
- Calculate profit margins per family
- Quick upgrade buttons

### 4. **Settings Tab**
- Export all admin data (JSON backup)
- Import data from backup
- Clear all data (with confirmation)
- View tier configurations
- System statistics
- Change admin password

---

## 🎨 Usage Tracking

### Automatic Tracking

Usage is automatically tracked when users:
1. **Use AI pronunciation analysis** - Tracked in `usePronunciationAPI.js`
2. **Translate text** - Track manually with `trackTranslation()`
3. **Use text-to-speech** - Track manually with `trackTTS()`

### Cost Estimates

Per-request costs (approximate):
- **Pronunciation:** $0.004 (Whisper + DeepSeek)
- **Translation:** $0.001 (DeepSeek)
- **TTS:** $0.0005 (Web Speech API is free)

### Monthly Tracking

Usage is tracked per family per month in format `YYYY-MM`:
```javascript
{
  "family-id-123": {
    "2025-10": {
      pronunciations: 50,
      translations: 20,
      tts: 100,
      costs: 0.22,
      lastUsed: "2025-10-22T10:30:00Z"
    }
  }
}
```

---

## 🚀 How It Works

### 1. User Flow

**Free User:**
1. Creates family → Automatically gets Free tier
2. Practices pronunciation
3. After 80 pronunciations → Sees warning banner
4. At 100 pronunciations → Blocked with upgrade prompt
5. Clicks "Upgrade" → Sees pricing modal
6. Selects Premium → (Payment integration TBD)

**Premium User:**
1. Unlimited pronunciations
2. No banners or warnings
3. Full access to all features

### 2. Admin Flow

**Daily:**
1. Visit `/admin`
2. Login with password
3. Check Usage Analytics tab
4. Monitor top users
5. Check profit margins

**Weekly:**
1. Review subscription breakdown
2. Export data backup
3. Identify upgrade opportunities

**Monthly:**
1. Calculate total revenue
2. Calculate total costs
3. Analyze profit margins
4. Plan pricing adjustments

---

## 🔧 Implementation Details

### File Structure

```
src/
├── stores/
│   └── admin.js                    # Admin state management
├── views/
│   └── AdminView.vue               # Main admin dashboard
├── components/
│   ├── admin/
│   │   ├── SubscriptionsTab.vue    # Subscription management
│   │   ├── UsageTab.vue            # Usage analytics
│   │   ├── FamiliesTab.vue         # Family management
│   │   └── SettingsTab.vue         # Settings & export
│   └── SubscriptionBanner.vue      # User-facing upgrade prompts
├── composables/
│   ├── useUsageTracking.js         # Usage tracking logic
│   └── usePronunciationAPI.js      # API with tracking (modified)
└── router/
    └── index.js                    # Admin route added
```

### Data Storage

**Location:** Browser localStorage
**Keys:**
- `famlingo_admin_subscriptions` - Subscription data
- `famlingo_admin_usage` - Usage tracking data
- `famlingo_admin_auth` - Admin session (sessionStorage)

**Why localStorage?**
- MVP/Demo: No database needed
- Persists across page reloads
- Easy export/import for backups
- Can migrate to database later

**Migration Path:**
- Phase 1: localStorage (current)
- Phase 2: Add MongoDB/Postgres
- Phase 3: Sync localStorage → Database
- Phase 4: Database-only

---

## 📈 Analytics You Can Track

### Revenue Metrics
- Monthly Recurring Revenue (MRR)
- Yearly projection
- Revenue per tier
- Total active subscriptions

### Cost Metrics
- Total API costs this month
- Cost per family
- Cost per pronunciation
- Profit margins per tier

### Usage Metrics
- Total pronunciations (all users)
- Total translations
- Average usage per tier
- Top power users

### Conversion Metrics
- Free → Premium conversion rate
- Upgrade prompt effectiveness
- Cancellation rate
- Retention rate

---

## 🎛️ How to Use (Step by Step)

### Initial Setup

1. **Access Admin Dashboard**
   ```
   http://localhost:5173/famlingo/admin
   ```

2. **Login**
   - Password: `famlingo-admin-2025`

3. **Add Test Subscription**
   - Go to Subscriptions tab
   - Enter a Family ID (or leave blank for auto-generate)
   - Select tier (free/premium/family)
   - Click "Add"

4. **Simulate Usage**
   - Use the app as a normal user
   - Record pronunciations
   - Check admin dashboard to see usage tracked

### Daily Operations

1. **Check Usage Analytics**
   - See how many pronunciations today
   - Monitor costs
   - Identify high-usage users

2. **Manage Subscriptions**
   - Upgrade free users manually (for testing)
   - Cancel subscriptions if needed
   - Reactivate cancelled subs

3. **Export Data (Backup)**
   - Settings tab → Export Data
   - Saves JSON file with all data
   - Do this weekly!

### Testing Upgrade Flow

1. **Create Test Family**
   - Sign up as normal user
   - Note the Family ID (in browser console or Settings)

2. **Use 80+ Pronunciations**
   - Or manually add to admin: Subscriptions tab → Add subscription with free tier
   - Then in Usage tab, the system tracks automatically

3. **See Upgrade Prompt**
   - Yellow warning at 80 uses
   - Red banner at 100 uses
   - Modal with pricing tiers

4. **Test Upgrade**
   - Click "Upgrade to Premium"
   - See modal with pricing
   - Click tier button
   - Alert shows demo upgrade (no payment yet)
   - Check admin dashboard → Subscription upgraded!

---

## 🔐 Security Considerations

### Current Implementation (MVP/Demo)
- ✅ Admin password in code
- ✅ Session-based authentication
- ✅ No external auth required
- ✅ Data in browser localStorage

### For Production
- [ ] Move password to environment variable
- [ ] Implement JWT authentication
- [ ] Add backend admin API routes
- [ ] Use database instead of localStorage
- [ ] Add role-based access control (RBAC)
- [ ] Implement audit logs
- [ ] Add 2FA for admin login

**Quick Fix for Production:**
```javascript
// In src/stores/admin.js
const correctPassword = process.env.VITE_ADMIN_PASSWORD || 'default-password'
```

Then set in `.env`:
```
VITE_ADMIN_PASSWORD=your-secure-password-here
```

---

## 💳 Payment Integration (Future)

### Recommended: Stripe

**Why Stripe:**
- Easy integration
- Handles international payments
- Supports subscriptions
- PCI compliant
- Great documentation

**Implementation Steps:**
1. Create Stripe account
2. Install `@stripe/stripe-js`
3. Create Stripe pricing tiers
4. Add checkout session to `/api/payment/create-checkout`
5. Handle webhooks for subscription events
6. Update admin store on successful payment

**Quick Setup:**
```bash
npm install @stripe/stripe-js
```

```javascript
// In SubscriptionBanner.vue
import { loadStripe } from '@stripe/stripe-js'

const selectPlan = async (tier) => {
  const stripe = await loadStripe('pk_test_...')

  const response = await fetch('/api/payment/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: familyId.value,
      tier: tier
    })
  })

  const { sessionId } = await response.json()
  await stripe.redirectToCheckout({ sessionId })
}
```

---

## 📱 Usage Limits Enforcement

### How It Works

1. **Before API Call:**
   ```javascript
   const limitCheck = usageTracking.checkPronunciationLimit()
   if (!limitCheck.allowed) {
     throw new Error(limitCheck.message)
   }
   ```

2. **After Successful API Call:**
   ```javascript
   usageTracking.trackPronunciation(0.004)
   ```

3. **User Sees Banner:**
   - `<SubscriptionBanner />` component
   - Shows at 80% of limit
   - Blocks at 100% of limit

### Bypass for Testing

To test without limits:
```javascript
// In src/stores/admin.js
// Change line in TIER_LIMITS:
pronunciationsPerMonth: Infinity  // Set for free tier temporarily
```

---

## 🧪 Testing Checklist

- [ ] Can access admin dashboard at `/admin`
- [ ] Can login with password
- [ ] Can see all 4 tabs (Subscriptions, Usage, Families, Settings)
- [ ] Can add test subscription
- [ ] Can see usage tracked after pronunciation
- [ ] Can see revenue metrics update
- [ ] Can export data as JSON
- [ ] Can import data from JSON
- [ ] Can see subscription banner at 80% usage
- [ ] Can see limit block at 100% usage
- [ ] Can click upgrade and see pricing modal
- [ ] Can "upgrade" to premium (demo mode)
- [ ] Can see upgraded tier in admin dashboard
- [ ] Can cancel subscription
- [ ] Can reactivate subscription

---

## 🚨 Troubleshooting

### Admin Dashboard Not Showing
**Problem:** `/admin` shows blank page
**Fix:**
```bash
# Check console for errors
# Verify AdminView.vue exists
ls src/views/AdminView.vue

# Check router
cat src/router/index.js | grep admin
```

### Usage Not Tracking
**Problem:** Pronunciations used but not showing in Usage tab
**Fix:**
```javascript
// Check browser console for tracking logs
// Should see: "📊 Tracked pronunciation usage for family: xxx"

// Verify admin store is loaded
adminStore.loadFromStorage()

// Check localStorage
localStorage.getItem('famlingo_admin_usage')
```

### Can't Login to Admin
**Problem:** Password not working
**Fix:**
```javascript
// Check password in src/stores/admin.js line ~103
adminLogin(password) {
  const correctPassword = 'famlingo-admin-2025'  // This one
  ...
}
```

### Data Lost After Refresh
**Problem:** Admin data disappears
**Fix:**
```javascript
// Check if loadFromStorage is called
// In AdminView.vue onMounted:
onMounted(() => {
  adminStore.loadFromStorage()  // Make sure this runs
})
```

---

## 📊 Sample Admin Scenarios

### Scenario 1: New Free User
1. User creates family → Auto-assigned free tier
2. Uses 10 pronunciations → Tracked, no warnings
3. Uses 85 pronunciations → Yellow warning banner appears
4. Uses 100 pronunciations → Red block banner appears
5. Clicks upgrade → Sees pricing modal
6. Selects Premium → Upgraded (demo mode)
7. Now has unlimited access

### Scenario 2: Managing Power Users
1. Admin checks Usage Analytics tab
2. Sees user with 500 pronunciations/month
3. Checks Families tab → User is on Premium ($2.99)
4. Calculates: Cost = 500 * $0.004 = $2.00
5. Revenue = $2.99, Profit = $0.99 (33% margin)
6. Notes: Still profitable but lower margin
7. Considers: Family plan might be better value

### Scenario 3: Data Backup
1. Admin visits Settings tab
2. Clicks "Export Data"
3. Downloads `famlingo-admin-backup-2025-10-22.json`
4. Stores in Google Drive
5. Later: Clicks "Import Data"
6. Uploads backup file
7. All data restored

---

## 🎓 Best Practices

### For Admins
1. **Backup weekly** - Export data to JSON
2. **Monitor costs** - Check Usage Analytics daily
3. **Track conversions** - Note free → premium upgrades
4. **Adjust pricing** - Based on cost/revenue analysis
5. **Respond quickly** - Help users who hit limits

### For Developers
1. **Don't hardcode passwords** - Use environment variables
2. **Add audit logs** - Track admin actions
3. **Validate input** - Prevent injection attacks
4. **Rate limit** - Prevent abuse
5. **Test thoroughly** - All subscription flows

---

## 🚀 Future Enhancements

### Phase 2 (Next 2 weeks)
- [ ] Add Stripe payment integration
- [ ] Implement email notifications
- [ ] Add usage charts (Chart.js)
- [ ] Add export to CSV
- [ ] Add date range filters

### Phase 3 (Next month)
- [ ] Migrate to MongoDB database
- [ ] Add backend admin API
- [ ] Implement JWT authentication
- [ ] Add user impersonation (for support)
- [ ] Add audit logs

### Phase 4 (Next 3 months)
- [ ] Add webhook support
- [ ] Add referral system
- [ ] Add promo codes
- [ ] Add A/B testing for pricing
- [ ] Add analytics dashboard (Grafana)

---

## 📞 Quick Reference

**Admin URL:** `https://famlingo-api.com/admin`
**Default Password:** `famlingo-admin-2025`
**Storage Keys:** `famlingo_admin_*`

**Files to Know:**
- `/src/stores/admin.js` - Main logic
- `/src/views/AdminView.vue` - Dashboard UI
- `/src/composables/useUsageTracking.js` - Tracking logic
- `/src/components/SubscriptionBanner.vue` - User prompts

**Pricing:**
- Free: $0, 100/month
- Premium: $2.99, unlimited
- Family: $7.49, unlimited, 10 users

**Costs per request:**
- Pronunciation: $0.004
- Translation: $0.001
- TTS: $0.0005

---

## ✅ You Now Have Full Control!

With this admin system, you can:
- ✅ See all users and their subscriptions
- ✅ Track usage and costs in real-time
- ✅ Enforce limits on free users
- ✅ Prompt upgrades automatically
- ✅ Calculate profit margins
- ✅ Export data for analysis
- ✅ Manage subscriptions manually
- ✅ Monitor system health

**Next Step:** Test it out! Visit `/admin` and start exploring.

---

**Questions?** Check the troubleshooting section or review the code comments in the files listed above.
