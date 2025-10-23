# Admin Dashboard - Quick Start Guide

**5-Minute Setup**

---

## 🚀 Step 1: Start the App (30 seconds)

```bash
cd /home/cmantra/famlingo
npm run dev
```

Wait for:
```
VITE v6.x.x  ready in XXXms
➜  Local:   http://localhost:5173/famlingo/
```

---

## 🔐 Step 2: Access Admin (30 seconds)

1. Open browser
2. Go to: `http://localhost:5173/famlingo/admin`
3. Enter password: `famlingo-admin-2025`
4. Click "Login"

You should see the admin dashboard!

---

## 💳 Step 3: Add Test Subscription (1 minute)

1. Click "Subscriptions" tab (already selected)
2. Leave "Family ID" blank (auto-generates)
3. Select "Premium" from dropdown
4. Click "Add" button

You should see:
- New row in table
- Blue "PREMIUM" badge
- Green "active" status
- Today's date

---

## 👤 Step 4: Test as User (2 minutes)

1. Open NEW tab: `http://localhost:5173/famlingo/`
2. Click "Get Started"
3. Create family:
   - Family Name (EN): "Test Family"
   - Family Name (CN): "测试家庭"
   - Click "Create Family"
4. Add user:
   - Name (EN): "John"
   - Name (CN): "约翰"
   - Select avatar
   - Click "Add User"
5. Click "Start Learning"
6. Go to Practice mode
7. Try a pronunciation (text or voice)

---

## 📊 Step 5: See Usage Tracked (1 minute)

1. Return to admin tab
2. Click "Usage Analytics" tab
3. You should see:
   - Total Pronunciations: 1
   - Total Costs: $0.004
   - Your test family in the list

Success! Usage tracking is working!

---

## 🎯 What's Next?

### Test the upgrade flow:

1. In admin, find your user's family ID
2. Change their subscription to "Free"
3. In user tab, do 85+ pronunciations (or simulate in admin)
4. See yellow warning banner
5. Do 100 pronunciations
6. See red block banner
7. Click "Upgrade to Premium"
8. See pricing modal
9. Click upgrade button
10. Check admin - subscription upgraded!

---

## 📱 Key URLs

**Admin Dashboard:**
```
http://localhost:5173/famlingo/admin
```

**User App:**
```
http://localhost:5173/famlingo/
```

**Production (when deployed):**
```
https://famlingo-api.com/admin
https://famlingo-api.com/
```

---

## 🔑 Admin Password

**Default:** `famlingo-admin-2025`

**Change it here:**
`/home/cmantra/famlingo/src/stores/admin.js` line ~103

```javascript
const correctPassword = 'your-new-password-here'
```

---

## 💰 Pricing Quick Reference

| Tier | Price | Limit | Users |
|------|-------|-------|-------|
| Free | $0 | 100/month | 1 |
| Premium | $2.99 | Unlimited | 1 |
| Family | $7.49 | Unlimited | 10 |

---

## 📊 Admin Tabs

1. **Subscriptions** - Manage user plans
2. **Usage Analytics** - Track API calls
3. **Families** - View all users
4. **Settings** - Export/import data

---

## 🆘 Troubleshooting

### Can't login?
- Check password in `src/stores/admin.js`
- Try clearing browser cache
- Check browser console for errors

### Usage not tracking?
- Check browser console for log: `📊 Tracked pronunciation...`
- Verify admin store loaded: `localStorage.getItem('famlingo_admin_usage')`
- Try adding subscription manually first

### Dashboard shows 0 for everything?
- This is normal for first launch!
- Add test subscription (Step 3)
- Do test pronunciation (Step 4)
- Refresh admin dashboard

---

## 📚 Full Documentation

**Detailed guide:** `ADMIN_SYSTEM_GUIDE.md` (900+ lines)
**Testing checklist:** `ADMIN_TESTING_CHECKLIST.md`
**Implementation summary:** `MONETIZATION_IMPLEMENTATION_SUMMARY.md`

---

## ✅ You're Ready!

In 5 minutes you:
- ✅ Started the app
- ✅ Accessed admin dashboard
- ✅ Created test subscription
- ✅ Tested as user
- ✅ Saw usage tracked

**Now explore the other tabs and features!**

---

**Questions?** Check `ADMIN_SYSTEM_GUIDE.md` for detailed help.
