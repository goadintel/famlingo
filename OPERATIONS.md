# FamLingo Operations Guide

**Last Updated:** 2026-02-04
**Status:** LIVE IN PRODUCTION

---

## Quick Reference

| Item | Value |
|------|-------|
| **Production URL** | https://famlingo-api.com |
| **Server IP** | 134.209.102.164 |
| **SSH Key** | `~/.ssh/famlingo-digitalocean` |
| **Web Root** | `/var/www/famlingo-web/` |
| **API Port** | 3001 |
| **DNS Provider** | Cloudflare |
| **Access Code** | famlingo2024 |

---

## Architecture

```
User Browser
     ↓
Cloudflare (DNS + CDN)
     ↓
DigitalOcean Droplet (134.209.102.164)
     ↓
Nginx (Port 443)
├── / → Vue.js SPA (/var/www/famlingo-web/)
├── /api/* → Node.js Backend (localhost:3001)
└── /uploads/* → Audio files
     ↓
SQLite Database (/var/www/famlingo-api/db/)
```

### Data Flow
- **Authentication**: Email/password → Backend API → SQLite
- **Family Data**: Backend SQLite is source of truth
- **Custom Phrases**: Synced to backend per user
- **GitHub Sync**: DISABLED (was causing data conflicts)

---

## Deployment

### Standard Deployment (Recommended)

```bash
cd /home/cmantra/famlingo
./deploy.sh
```

### Manual Deployment

```bash
# 1. Build
npm run build

# 2. Deploy to server
rsync -avz --delete \
  -e "ssh -i ~/.ssh/famlingo-digitalocean" \
  dist/ \
  root@134.209.102.164:/var/www/famlingo-web/

# 3. Verify
curl https://famlingo-api.com/index.html | grep "index-"
```

### After Deployment - Cache Issues

If users see old version after deployment:

1. **Check what's deployed:**
   ```bash
   ssh -i ~/.ssh/famlingo-digitalocean root@134.209.102.164 \
     "ls -la /var/www/famlingo-web/assets/"
   ```

2. **Check what Cloudflare serves:**
   ```bash
   curl -I https://famlingo-api.com/assets/index-HASH.js
   ```

3. **If Cloudflare returns 404 for new files:**
   - Purge Cloudflare cache in dashboard
   - Or wait ~4 hours for cache to expire

4. **Tell users to clear browser cache:**
   - DevTools → Application → Storage → Clear site data
   - Or Ctrl+Shift+Delete → Clear cached files

---

## Cloudflare DNS

**A Records pointing to 134.209.102.164:**
- `famlingo-api.com`
- `famlingoapi.com`
- `zhilian.famlingo-api.com`

### Updating DNS
1. Login to Cloudflare dashboard
2. Select domain
3. Go to DNS settings
4. Update A record IP addresses

### Cache Settings
- index.html: No cache (nginx headers)
- /assets/*.js, *.css: 1 year cache (content-hashed filenames)

---

## Server Access

### SSH to Server
```bash
ssh -i ~/.ssh/famlingo-digitalocean root@134.209.102.164
```

### Key Locations on Server
| Path | Description |
|------|-------------|
| `/var/www/famlingo-web/` | Frontend static files |
| `/var/www/famlingo-api/` | Backend API code |
| `/var/www/famlingo-api/db/` | SQLite database |
| `/etc/nginx/sites-enabled/famlingo` | Nginx config |
| `/var/log/nginx/` | Nginx logs |

### Service Management
```bash
# Nginx
nginx -t                    # Test config
systemctl reload nginx      # Reload config
systemctl status nginx      # Check status

# API (PM2)
pm2 status                  # Check processes
pm2 logs famlingo-api       # View logs
pm2 restart famlingo-api    # Restart API
```

---

## Backend API

### Authentication System
- Email/password login
- JWT tokens (30-day expiry)
- Stored in SQLite (`accounts` table)

### Database Tables
- `accounts` - User authentication
- `families` - Family groups
- `family_members` - Individual users within families
- `custom_phrases` - User-created phrases

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Get current user + family |
| `/api/auth/family` | POST/GET | Create/get family |
| `/api/auth/members` | POST | Add family member |
| `/api/auth/phrases/:memberId` | GET | Get user's phrases |
| `/api/auth/phrases` | POST | Add phrase |

---

## Troubleshooting

### Users See Old Version
1. Check server has new files
2. Check Cloudflare isn't caching old version
3. User needs to clear browser cache (DevTools → Application → Clear site data)

### 404 on New JS Files
- Cloudflare caching old index.html pointing to old JS
- Purge Cloudflare cache
- Reload nginx: `systemctl reload nginx`

### "Member not found" Errors
- User has old localStorage with wrong member IDs
- Solution: User should logout and login fresh

### GitHub Sync Restoring Old Data
- GitHub sync was REMOVED from Settings UI
- Auto-sync on dashboard load was DISABLED
- If old code is cached, clear browser data

### Can't Login
1. Check API is running: `pm2 status`
2. Check API logs: `pm2 logs famlingo-api`
3. Test API: `curl https://famlingo-api.com/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}'`

### Server Migration Checklist
When moving to new server:
1. Update `deploy.sh` with new IP
2. Deploy code to new server
3. Update Cloudflare DNS A records
4. Wait for DNS propagation (~5 min with Cloudflare)
5. Test: `curl https://famlingo-api.com/index.html`

---

## Important Notes

### GitHub Sync is DISABLED
- Was causing conflicts with backend data
- Backend SQLite is now the ONLY source of truth
- GitHub repo is for code versioning only
- DO NOT re-enable GitHub sync for family data

### Cloudflare Caching
- Cloudflare sits between users and server
- Can cache old files aggressively
- After deployment, may need to purge cache
- Check `cf-cache-status` header to debug

### Two Server History
- **Old server**: 128.199.245.225 (1 CPU, 1GB RAM)
- **New server**: 134.209.102.164 (2 CPU, 4GB RAM)
- Migrated Feb 2026
- Always deploy to 134.209.102.164

---

## Session Restore Context

When resuming a Claude session for FamLingo:

1. **Frontend**: Vue 3 app in `/home/cmantra/famlingo`
2. **Backend**: Express.js API in `/home/cmantra/famlingo-api`
3. **Deploy script**: `./deploy.sh` in famlingo folder
4. **Server**: 134.209.102.164 via Cloudflare
5. **Auth**: Email/password, backend SQLite
6. **GitHub sync**: DISABLED - don't re-enable

### Common Tasks
- Deploy frontend: `./deploy.sh`
- Check server: `ssh -i ~/.ssh/famlingo-digitalocean root@134.209.102.164`
- View API logs: SSH then `pm2 logs famlingo-api`
- Clear user cache issues: Have them clear site data in DevTools

---

## Costs

| Service | Cost |
|---------|------|
| DigitalOcean Droplet (2 CPU, 4GB) | ~$24/month |
| Cloudflare | Free |
| Domain | ~$12/year |

---

## Contacts & Resources

- **DigitalOcean Console**: https://cloud.digitalocean.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **DeepSeek API**: https://platform.deepseek.com

---

**Previous documentation consolidated:**
- DIGITAL_OCEAN_WEB_DEPLOYMENT.md (outdated IPs)
- DEPLOYMENT_SUCCESS.md
- Various session notes
