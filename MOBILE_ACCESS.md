# Mobile Access Guide

## ✅ Servers Running

### Backend API Server
- **Port**: 3001
- **Status**: ✅ Running and healthy
- **Listening on**: All interfaces (0.0.0.0)
- **Local Access**: http://localhost:3001
- **Mobile Access**: http://172.18.231.170:3001

**Health Check**: http://172.18.231.170:3001/health

### Web App Dev Server
- **Port**: 3002
- **Status**: ✅ Running
- **Listening on**: All interfaces (0.0.0.0)
- **Local Access**: http://localhost:3002/famlingo/
- **Mobile Access**: http://172.18.231.170:3002/famlingo/

---

## 📱 Access from Mobile Device

### Requirements
- Your mobile device must be on the **same Wi-Fi network** as your computer
- Your computer's IP address: `172.18.231.170`

### Steps to Access

1. **Open your mobile browser** (Safari, Chrome, etc.)

2. **Visit the web app**:
   ```
   http://172.18.231.170:3002/famlingo/
   ```

3. **That's it!** The app will automatically connect to the backend API at:
   ```
   http://172.18.231.170:3001
   ```

---

## 🧪 Testing

### Test Backend API (from mobile browser)
Visit: http://172.18.231.170:3001/health

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-15T...",
  "version": "1.0.0"
}
```

### Test Web App (from mobile browser)
Visit: http://172.18.231.170:3002/famlingo/

You should see the FamLingo setup page or dashboard.

---

## 🔧 Troubleshooting

### If you can't connect from mobile:

1. **Check Wi-Fi**: Ensure your phone and computer are on the same network

2. **Check Firewall**: Your system firewall might be blocking connections
   ```bash
   # On Ubuntu/WSL, check if ports are open
   sudo ufw status
   ```

3. **Verify IP Address**: Your IP might have changed if you reconnected to Wi-Fi
   ```bash
   hostname -I | awk '{print $1}'
   ```

4. **Check if servers are running**:
   ```bash
   # Backend (should show port 3001)
   lsof -i :3001

   # Web app (should show port 3002)
   lsof -i :3002
   ```

### Common Issues

**Issue**: "Connection refused" or timeout on mobile
- **Solution**: Check if your computer's firewall is blocking incoming connections on ports 3001 and 3002

**Issue**: Web app loads but can't connect to API
- **Solution**: Verify the `.env` file has the correct IP: `VITE_API_URL=http://172.18.231.170:3001`

**Issue**: IP address changed
- **Solution**:
  1. Get new IP: `hostname -I`
  2. Update `.env` file with new IP
  3. Restart web app: `npm run dev -- --host 0.0.0.0`

---

## 🚀 Quick Commands

### Start Backend (if not running)
```bash
cd /home/cmantra/famlingo-api
npm start
```

### Start Web App (if not running)
```bash
cd /home/cmantra/famlingo
npm run dev -- --host 0.0.0.0
```

### Stop Servers
```bash
# Find and kill backend
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill

# Find and kill web app
lsof -i :3002 | grep LISTEN | awk '{print $2}' | xargs kill
```

---

## 📊 Current Configuration

### Backend Environment Variables
- `PORT=3001`
- `DEEPSEEK_API_KEY=` ✅ Configured
- `OPENAI_API_KEY=` ✅ Configured
- CORS enabled for all origins (`*`)
- Listening on `0.0.0.0:3001`

### Web App Environment Variables
- `VITE_API_URL=http://172.18.231.170:3001`
- Dev server on `0.0.0.0:3002`
- Base path: `/famlingo/`

---

## ✨ Features Available on Mobile

All features work identically on mobile:

✅ **Setup Flow** - Create family and users
✅ **Dashboard** - View stats and leaderboard
✅ **Practice** - Voice practice (if browser supports microphone)
✅ **Browse** - Browse phrase library
✅ **My Phrases** - Manage custom phrases
✅ **Chat** - AI Bot, Family Chat, Translator
✅ **Settings** - Configure API keys, manage cache, GitHub sync

---

## 🔒 Security Note

**Development Mode Only**: The current setup is for development/testing only. The servers are accessible to anyone on your local network.

For production deployment:
- Use HTTPS
- Restrict CORS origins
- Add authentication
- Use environment-specific API keys
- Deploy to a proper hosting service (Vercel, Netlify, Alibaba Cloud)

---

## 📱 Alternative: WeChat Mini Program

If you prefer a native experience on mobile, you can also use the WeChat Mini Program version, which has 100% feature parity with the web app and connects to the same backend API.

**Location**: `/home/cmantra/famlingo-wechat/`

**How to test**:
1. Open WeChat Developer Tools
2. Load the project from `/home/cmantra/famlingo-wechat/`
3. Update `app.js` API URL to: `http://172.18.231.170:3001`
4. Test in simulator or scan QR code to test on real device

---

**Last Updated**: 2025-10-15
**Your Local IP**: 172.18.231.170
**Backend**: http://172.18.231.170:3001
**Web App**: http://172.18.231.170:3002/famlingo/
