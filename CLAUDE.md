# FamLingo - Claude Session Context

**Last Session:** 2026-02-04
**Status:** All working, deployed to production

## Recent Session Summary (2026-02-04)
Implemented email/password authentication replacing GitHub sync:
- Added `useAuth.js` composable for auth
- Added `LoginView.vue` for login/register
- Added Account section to Settings with Logout button
- Removed GitHub sync UI (was restoring deleted users)
- Disabled auto GitHub sync on dashboard
- Migrated to new server: 134.209.102.164
- Fixed Cloudflare DNS pointing to old server
- All changes committed and frontend pushed to GitHub

**Current State:** App is live at https://famlingo-api.com with working auth

## Project Overview
Family language learning app (Chinese/English) with Vue 3 frontend and Express.js backend.

## Key Facts

### Infrastructure
- **Server**: 134.209.102.164 (DigitalOcean, 2 CPU, 4GB RAM)
- **DNS**: Cloudflare (can cause caching issues)
- **URL**: https://famlingo-api.com
- **SSH**: `ssh -i ~/.ssh/famlingo-digitalocean root@134.209.102.164`

### Code Locations
- **Frontend**: `/home/cmantra/famlingo` (Vue 3)
- **Backend**: `/home/cmantra/famlingo-api` (Express.js + SQLite)

### Deployment
```bash
cd /home/cmantra/famlingo
./deploy.sh
```

### Authentication
- Email/password login (NOT GitHub tokens)
- Backend SQLite is source of truth
- JWT tokens with 30-day expiry
- Access code for beta: `famlingo2024`

## Critical: GitHub Sync is DISABLED
- Was causing data conflicts (restoring deleted users)
- Removed from Settings UI (Feb 2026)
- Auto-sync on dashboard load commented out
- DO NOT re-enable

## Common Issues

### Users see old version after deploy
1. Cloudflare caching - purge cache or wait
2. Browser cache - user must clear site data
3. Check: `curl https://famlingo-api.com/index.html | grep "index-"`

### "Member not found" API errors
- Old member IDs in localStorage
- User needs to logout and login fresh

### Deploy not showing on site
- Verify files on server: `ssh ... "ls /var/www/famlingo-web/assets/"`
- Check Cloudflare isn't serving cached 404
- nginx version on server is 1.24.0

## File Quick Reference
- Deploy script: `/home/cmantra/famlingo/deploy.sh`
- Nginx config: `/etc/nginx/sites-enabled/famlingo` (on server)
- API database: `/var/www/famlingo-api/db/` (on server)
- Auth composable: `/home/cmantra/famlingo/src/composables/useAuth.js`
- Family store: `/home/cmantra/famlingo/src/stores/family.js`
- Settings view: `/home/cmantra/famlingo/src/views/SettingsView.vue`

## Pending / Notes
- Backend repo (`famlingo-api`) not on GitHub (local only, deployed to server)
- User testing auth system - may report issues
- Old docs (DIGITAL_OCEAN_WEB_DEPLOYMENT.md etc.) have outdated IPs - use OPERATIONS.md

## See Also
- `OPERATIONS.md` - Full operations guide
- `deploy.sh` - Deployment script
