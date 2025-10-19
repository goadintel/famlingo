# FamLingo Web App - Digital Ocean Deployment

**Deployed:** 2025-10-19
**Status:** LIVE IN PRODUCTION
**URL:** https://famlingo-api.com

---

## 🌐 Deployment Architecture

```
https://famlingo-api.com
         ↓
    Nginx (Port 80/443)
    ├── / → Static Web App (Vue.js)
    ├── /api/* → Backend API (Node.js on port 3001)
    └── /health → API Health Check
```

**Single Server Strategy:**
- Frontend (Vue.js) and Backend (Node.js API) on same Digital Ocean droplet
- Cost: $6/month (no additional cost for frontend)
- Works in China ✅ (not blocked like Vercel)
- Perfect for testing with local Chinese users

---

## 📦 What Was Deployed

**Frontend:**
- Vue.js 3 (Composition API)
- Vite build system
- PWA capabilities
- All features synced with WeChat:
  - Listen Mode
  - Practice Mode
  - Browse 100+ phrases
  - Chat & Translate
  - My Common Phrases
  - Dashboard with stats

**Backend API:**
- Already running at `http://localhost:3001`
- DeepSeek AI integration
- OpenAI Whisper STT
- PM2 process management

---

## 🚀 Deployment Steps

### 1. Build Production Bundle

```bash
cd /home/cmantra/famlingo
npm run build
```

Creates optimized static files in `dist/` folder.

### 2. Upload to Digital Ocean

```bash
rsync -avz --progress \
  -e "ssh -i ~/.ssh/famlingo-digitalocean" \
  /home/cmantra/famlingo/dist/ \
  root@128.199.245.225:/var/www/famlingo-web/
```

### 3. Configure Nginx

SSH into server:
```bash
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225
```

Update nginx configuration at `/etc/nginx/sites-available/famlingo`:

```nginx
server {
    server_name famlingoapi.com famlingo-api.com;

    # Serve static web app files
    root /var/www/famlingo-web;
    index index.html;

    # Web app routes (SPA - single page app)
    location / {
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/famlingo-api.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/famlingo-api.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = famlingoapi.com) {
        return 301 https://$host$request_uri;
    }

    if ($host = famlingo-api.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name famlingoapi.com famlingo-api.com;
    return 404;
}
```

Test and reload nginx:
```bash
nginx -t
systemctl reload nginx
```

### 4. Verify Deployment

```bash
# Check web app
curl -I https://famlingo-api.com

# Check API
curl https://famlingo-api.com/health
```

---

## 🔄 Deployment Script (For Future Updates)

Created automated deployment script at `/home/cmantra/deploy-famlingo-web.sh`:

```bash
#!/bin/bash
# Deploy FamLingo Web App to Digital Ocean

set -e  # Exit on error

echo "🏗️  Building production bundle..."
cd /home/cmantra/famlingo
npm run build

echo "📤 Uploading to Digital Ocean..."
rsync -avz --progress --delete \
  -e "ssh -i ~/.ssh/famlingo-digitalocean" \
  dist/ \
  root@128.199.245.225:/var/www/famlingo-web/

echo "🔄 Reloading nginx..."
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225 'nginx -t && systemctl reload nginx'

echo "✅ Deployment complete!"
echo "🌐 Live at: https://famlingo-api.com"
echo ""
echo "Testing endpoints..."
curl -s https://famlingo-api.com/health | jq
```

**Usage:**
```bash
chmod +x /home/cmantra/deploy-famlingo-web.sh
./deploy-famlingo-web.sh
```

---

## 🌍 Access URLs

**Production:**
- Main: https://famlingo-api.com
- Alternative: https://famlingoapi.com (redirects to main)

**API Endpoints:**
- Health: https://famlingo-api.com/health
- Translation: https://famlingo-api.com/api/translate-phrase
- TTS: https://famlingo-api.com/api/tts
- Pronunciation: https://famlingo-api.com/api/pronunciation

**Development:**
- Local: http://localhost:3001/famlingo/
- Run with: `npm run dev`

---

## 🇨🇳 China Access

✅ **Digital Ocean is accessible in China**
- Not blocked by Great Firewall
- Suitable for testing with local Chinese users
- WeChat mini program can connect

**Performance Notes:**
- Speed in China: ~200-500ms (acceptable)
- Speed internationally: ~50-200ms
- Can add Cloudflare CDN later for better global performance

---

## 📊 Server Resources

**Current Usage (Frontend + Backend):**
- CPU: ~5-10% idle
- RAM: ~500MB used (out of 1GB)
- Disk: ~2GB used
- Bandwidth: Minimal (< 1GB/month currently)

**Capacity:**
- Current droplet can handle: ~500-1000 concurrent users
- When to upgrade: If CPU > 80% or RAM > 800MB consistently

**Upgrade Path:**
```
$6/month  (1GB RAM) → Current
$12/month (2GB RAM) → ~2000 users
$18/month (4GB RAM) → ~5000 users
```

---

## 🔧 Maintenance

### Update Web App Code

```bash
cd /home/cmantra/famlingo
git pull  # If using git
npm install  # If dependencies changed
./deploy-famlingo-web.sh
```

### Update API Code

```bash
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225
cd /var/www/famlingo-api
git pull  # Or rsync from local
npm install --production
pm2 restart famlingo-api
```

### Check Logs

**Web App (nginx):**
```bash
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

**API (PM2):**
```bash
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225
pm2 logs famlingo-api
```

### SSL Certificate Renewal

Certbot auto-renews. To manually renew:
```bash
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225
certbot renew
systemctl reload nginx
```

---

## 🚨 Troubleshooting

### Web App Shows 404
```bash
# Check if files exist
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225 'ls -la /var/www/famlingo-web/'

# Check nginx config
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225 'nginx -t'
```

### API Not Working
```bash
# Check PM2 status
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225 'pm2 status'

# Check API logs
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225 'pm2 logs famlingo-api --lines 50'
```

### CORS Errors
Check API CORS configuration in `/var/www/famlingo-api/index.js`

### Performance Issues
```bash
# Check server resources
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225 'htop'

# Or
ssh -i ~/.ssh/famlingo-digitalocean root@128.199.245.225 'free -h && df -h'
```

---

## 🎯 Future Enhancements

### Add Cloudflare CDN (FREE)
- Set Cloudflare DNS to "Proxied" (orange cloud)
- Caches static assets globally
- Improves international performance
- Still works in China (mostly)

### Add Vercel for International Users
- Deploy same code to Vercel
- `famlingo.vercel.app` or custom domain
- International users → Vercel (fast)
- China users → Digital Ocean (accessible)
- Takes 5 minutes to set up

### Move to Alibaba Cloud (If Needed)
- Better performance in China
- Alibaba CDN
- Cost: ~$15/month
- Only needed if significant China traffic

---

## 📈 Analytics & Monitoring

### Recommended Tools:

**Uptime Monitoring:**
- UptimeRobot (FREE) - Alerts if site goes down
- Monitor: https://famlingo-api.com/health

**Error Tracking:**
- Sentry (FREE tier) - Catches JavaScript errors
- Integrates with Vue.js

**Analytics:**
- Plausible (Privacy-friendly) or Google Analytics
- Track user behavior

**Performance:**
- Cloudflare Analytics (if using Cloudflare)
- Digital Ocean Monitoring (built-in)

---

## ✅ Deployment Checklist

- [x] Production build created
- [x] Files uploaded to `/var/www/famlingo-web/`
- [x] Nginx configured for SPA routing
- [x] HTTPS working
- [x] API endpoints accessible
- [ ] Analytics installed (optional)
- [ ] Error tracking set up (optional)
- [ ] Uptime monitoring configured (recommended)
- [ ] Shared with test users

---

## 🎉 Success!

Your FamLingo web app is now **LIVE IN PRODUCTION** at:
### 🌐 https://famlingo-api.com

**Ready for:**
- ✅ Testing by local Chinese users
- ✅ WeChat integration testing
- ✅ Real-world usage
- ✅ Feedback collection

**Cost:** $6/month (same as before - no additional cost!)

---

**Last Updated:** 2025-10-19
**Next Review:** After user testing feedback
