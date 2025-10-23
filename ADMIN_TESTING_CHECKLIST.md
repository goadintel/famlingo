# Admin System Testing Checklist

**Date:** 2025-10-22
**Version:** 1.0
**Tester:** _________

---

## ✅ Pre-Testing Setup

- [ ] Web app running on `npm run dev`
- [ ] API server running (if needed)
- [ ] Browser console open (F12)
- [ ] Incognito/private window (for clean test)

---

## 🔐 Test 1: Admin Authentication

### Steps:
1. Navigate to `http://localhost:5173/famlingo/admin`
2. Should see login screen
3. Enter password: `famlingo-admin-2025`
4. Click "Login"

### Expected:
- [ ] Login screen shows with password input
- [ ] Correct password allows login
- [ ] Dashboard appears after login
- [ ] Session persists on page refresh

### Notes:
______________________________________________________

---

## 📊 Test 2: Admin Dashboard Overview

### Steps:
1. After logging in, observe dashboard
2. Check all 4 quick stats cards
3. Check subscription breakdown
4. Check all 4 tabs exist

### Expected:
- [ ] See "Total Families" card (should be 0 initially)
- [ ] See "Total Pronunciations" card
- [ ] See "Monthly Revenue" card
- [ ] See "Yearly Projection" card
- [ ] See subscription breakdown (Free/Premium/Family)
- [ ] See 4 tabs: Subscriptions, Usage Analytics, Families, Settings

### Notes:
______________________________________________________

---

## 💳 Test 3: Add Test Subscription

### Steps:
1. Go to "Subscriptions" tab
2. Leave Family ID blank (auto-generate)
3. Select tier: "Premium"
4. Click "Add"
5. Observe table

### Expected:
- [ ] New subscription appears in table
- [ ] Shows Family ID (truncated)
- [ ] Shows "PREMIUM" badge (blue)
- [ ] Shows "active" status (green)
- [ ] Shows start date (today)
- [ ] Shows renewal date (1 month from now)
- [ ] Shows $2.99/mo amount

### Notes:
______________________________________________________

---

## 👤 Test 4: Create Regular User & Track Usage

### Steps:
1. Open new tab, go to `http://localhost:5173/famlingo/`
2. Create a family (note the family ID in console)
3. Add a user
4. Go to Practice mode
5. Do a voice pronunciation (or text practice)
6. Return to admin dashboard
7. Check Usage Analytics tab

### Expected:
- [ ] Admin dashboard shows updated usage
- [ ] See family in Usage tab
- [ ] See pronunciation count = 1
- [ ] See cost = $0.004
- [ ] Family appears in Families tab

### Notes:
Family ID: _______________
______________________________________________________

---

## ⚠️ Test 5: Usage Warning Banner

### Steps:
1. In admin, find your test family ID
2. Go to Subscriptions tab
3. If not already free, cancel and recreate as "Free"
4. Simulate 85 pronunciations:
   - Option A: Use admin to manually update usage in localStorage
   - Option B: Actually do 85 pronunciations (tedious!)
5. Return to user app, go to Practice page

### Expected:
- [ ] Yellow warning banner appears
- [ ] Says "You've used 85 of 100 pronunciations"
- [ ] Shows "Upgrade Now" button
- [ ] Banner is dismissible or persistent

### Notes:
______________________________________________________

---

## 🚫 Test 6: Usage Limit Block

### Steps:
1. Continue from Test 5
2. Simulate 100 total pronunciations
3. Try to do another pronunciation

### Expected:
- [ ] Red banner appears
- [ ] Says "Monthly limit reached"
- [ ] Blocks further pronunciations
- [ ] Shows "Upgrade to Premium" button
- [ ] User cannot proceed without upgrading

### Notes:
______________________________________________________

---

## 💎 Test 7: Upgrade Flow

### Steps:
1. Continue from Test 6
2. Click "Upgrade to Premium" button
3. See pricing modal
4. Click "Upgrade to Premium" in modal

### Expected:
- [ ] Modal appears with 3 tiers
- [ ] Free tier shows "Current Plan" (disabled)
- [ ] Premium tier shows "$2.99/month"
- [ ] Family tier shows "$7.49/month"
- [ ] Clicking premium shows alert (demo mode)
- [ ] Family upgraded in admin dashboard
- [ ] Banner disappears after upgrade

### Notes:
______________________________________________________

---

## 📈 Test 8: Families Tab

### Steps:
1. Go to admin Families tab
2. Observe your test family
3. Try search filter
4. Try tier filter
5. Click "Details" button

### Expected:
- [ ] Family listed with usage stats
- [ ] Shows usage vs limit
- [ ] Shows remaining pronunciations
- [ ] Search by ID works
- [ ] Filter by tier works
- [ ] Details modal shows full info
- [ ] Details shows profit margin

### Notes:
______________________________________________________

---

## 💾 Test 9: Data Export/Import

### Steps:
1. Go to Settings tab
2. Click "Export Data"
3. Check downloaded file
4. Make a small change (add another subscription)
5. Click "Import Data"
6. Upload the exported file

### Expected:
- [ ] Export downloads JSON file
- [ ] File contains subscriptions and usage data
- [ ] File is valid JSON
- [ ] Import button opens file picker
- [ ] Import successfully restores data
- [ ] Alert confirms success

### Notes:
______________________________________________________

---

## 🧹 Test 10: Clear All Data

### Steps:
1. Go to Settings tab
2. Click "Clear All Data"
3. Type "DELETE" in confirmation
4. Observe dashboard

### Expected:
- [ ] Confirmation prompt appears
- [ ] Requires typing "DELETE"
- [ ] Won't proceed with wrong text
- [ ] After clearing, all tables empty
- [ ] Stats reset to 0
- [ ] Alert confirms clear

### Notes:
______________________________________________________

---

## 🔄 Test 11: Session Persistence

### Steps:
1. Login to admin
2. Refresh page (F5)
3. Close tab and reopen
4. Close browser and reopen

### Expected:
- [ ] Refresh keeps you logged in
- [ ] Data persists after refresh
- [ ] Reopening tab keeps session
- [ ] Closing browser logs you out (sessionStorage)

### Notes:
______________________________________________________

---

## 🎨 Test 12: UI/UX Check

### Steps:
1. Review all admin pages
2. Check responsive design
3. Test on mobile browser
4. Check color coding

### Expected:
- [ ] All text readable
- [ ] No layout breaks
- [ ] Tables scroll horizontally on mobile
- [ ] Color badges consistent (gray=free, blue=premium, purple=family)
- [ ] Green=active, red=cancelled
- [ ] Charts/stats visually clear

### Notes:
______________________________________________________

---

## 🐛 Test 13: Error Handling

### Steps:
1. Try invalid actions:
   - Cancel already cancelled subscription
   - Import invalid JSON file
   - Enter negative usage manually
2. Check console for errors

### Expected:
- [ ] No JavaScript errors in console
- [ ] Graceful error messages
- [ ] No crashes or blank screens
- [ ] Confirmations before destructive actions

### Notes:
______________________________________________________

---

## 📱 Test 14: Real-World Scenario

### Simulate a complete user journey:

1. User signs up (free tier)
2. Uses app normally
3. Hits 80 pronunciations → sees warning
4. Continues to 100 → gets blocked
5. Upgrades to premium
6. Uses app unlimited
7. Admin checks analytics
8. Admin sees revenue/cost metrics

### Expected:
- [ ] Entire flow works smoothly
- [ ] No unexpected errors
- [ ] Upgrade is seamless
- [ ] Admin sees accurate data

### Notes:
______________________________________________________

---

## 🔍 Browser Console Checks

### Look for these log messages:

- [ ] `✅ Admin store initialized`
- [ ] `📊 Tracked pronunciation usage for family: xxx`
- [ ] `💳 Subscription updated: xxx → premium`
- [ ] `📂 Family data loaded from storage`
- [ ] `📊 Admin data loaded from storage`

### No Errors:
- [ ] No red errors in console
- [ ] No 404s for missing files
- [ ] No failed API calls (if applicable)

---

## 🏁 Final Checklist

- [ ] All 14 tests passed
- [ ] No critical bugs found
- [ ] Console shows expected logs
- [ ] No errors or warnings
- [ ] UI looks professional
- [ ] Data persists correctly
- [ ] Ready for production

---

## 📝 Bug Report Template

**Bug #:** ___
**Test:** ___
**Severity:** Critical / High / Medium / Low
**Description:**
______________________________________________________
______________________________________________________

**Steps to Reproduce:**
1.
2.
3.

**Expected:**
______________________________________________________

**Actual:**
______________________________________________________

**Screenshots/Console Errors:**
______________________________________________________

---

## ✅ Sign-Off

**Tester:** _______________________
**Date:** _______________________
**Passed:** YES / NO (with issues)
**Notes:**
______________________________________________________
______________________________________________________
______________________________________________________

---

## 🚀 Next Steps After Testing

If all tests pass:
1. [ ] Deploy to production
2. [ ] Update admin password
3. [ ] Set up regular backups
4. [ ] Monitor usage for first week
5. [ ] Collect feedback from early users

If issues found:
1. [ ] Document all bugs
2. [ ] Prioritize fixes
3. [ ] Fix critical issues first
4. [ ] Re-test after fixes
5. [ ] Sign off again

---

**Happy Testing! 🎉**
