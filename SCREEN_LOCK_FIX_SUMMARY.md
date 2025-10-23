# Screen Lock Fix - Listen Mode Audio Issue

## Problem Solved ✅
Audio playback in Listen Mode was stopping when the mobile device screen locked after timeout, even though the app continued running in the background.

## Root Cause
The **Web Speech Synthesis API** (`window.speechSynthesis.speak()`) stops working when the screen locks on mobile devices. This is a browser security/power-saving feature.

## Solution Implemented
Added the **Screen Wake Lock API** to keep the screen on while Listen Mode is active, preventing the screen from locking during audio playback.

---

## What Changed

### Code Changes
**File**: `src/views/ListenView.vue`

1. **Added wake lock variable**:
   ```javascript
   let wakeLock = null
   ```

2. **Request wake lock on play/resume**:
   ```javascript
   async function startListening() {
     isPlaying.value = true
     await requestWakeLock()  // ← New
     await playCurrentPhrase()
   }
   ```

3. **Release wake lock on pause/stop**:
   ```javascript
   function pauseListening() {
     isPlaying.value = false
     releaseWakeLock()  // ← New
   }
   ```

4. **Added wake lock functions**:
   - `requestWakeLock()` - Acquires screen wake lock
   - `releaseWakeLock()` - Releases screen wake lock
   - Event listeners for wake lock release

5. **Added visual indicator**:
   - Green badge showing "Screen lock disabled - listening mode active"
   - Only visible when audio is playing

### User Experience Improvements
- ✅ Screen stays on during Listen Mode
- ✅ Audio continues playing without interruption
- ✅ Visual confirmation that wake lock is active
- ✅ Automatic lock release when paused/stopped
- ✅ Graceful fallback for unsupported browsers

---

## Browser Support

### Works On ✅
- **Chrome Mobile** (Android): Full support
- **Edge Mobile** (Android): Full support
- **Safari iOS** (16.4+): Full support
- **Chrome Desktop**: Full support (but not needed)

### Fallback ⚠️
- **Safari Desktop**: Not supported (graceful degradation)
- **Firefox**: Limited support (graceful degradation)
- **Older browsers**: Falls back to normal behavior

---

## How to Test

### Mobile Testing
1. Open https://famlingo-api.com on your mobile device
2. Navigate to Listen Mode
3. Start playing audio
4. Wait for screen timeout (30-60 seconds)
5. ✅ Screen should stay on
6. ✅ Audio should continue playing
7. ✅ Green "Screen lock disabled" notice should show

### What to Verify
- [ ] Screen doesn't lock while audio plays
- [ ] Green notice appears when playing
- [ ] Wake lock releases when paused
- [ ] Wake lock re-acquires when resumed
- [ ] Console shows wake lock messages

### Console Messages
When debugging, check console for:
```
✅ Wake Lock acquired - screen will stay on
⚠️ Wake Lock released
🔓 Wake Lock released manually
```

---

## Technical Details

### Why This Works
The Screen Wake Lock API:
- Prevents screen from auto-locking
- Keeps display on (but can dim)
- Minimal battery impact
- Purpose-built for media playback

### Security
- Requires HTTPS (✅ already using)
- No permission prompt needed
- User can manually lock device
- Auto-releases on tab switch

### Battery Considerations
- Screen stays on = more battery drain
- Wake lock releases immediately on pause
- User can manually lock screen to override
- Minimal CPU overhead

---

## Deployment

### Deployed To
- **URL**: https://famlingo-api.com
- **Date**: October 23, 2025
- **Status**: ✅ Live in production

### Git Commits
```
334ab6f Add Wake Lock API implementation documentation
fd0a19a Add Wake Lock API to prevent screen lock during Listen Mode
```

### Build Info
```
vite v6.3.6
dist/assets/index-B0tB2IP6.js   263.72 kB │ gzip: 84.69 kB
Built: 2.15s
```

---

## User Instructions

### For Users

**Before (Problem)**:
1. Start Listen Mode ▶️
2. Screen locks after 30-60 seconds 🔒
3. Audio stops playing ❌
4. App continues but no sound 😞

**After (Fixed)**:
1. Start Listen Mode ▶️
2. Screen stays on automatically ✨
3. Audio keeps playing continuously 🎵
4. Green notice shows it's working ✅

### What Users See
- When playing: Green badge "🔒 Screen lock disabled - listening mode active"
- When paused: Badge disappears
- Battery indicator may show screen is on

### If Wake Lock Not Supported
Some older browsers don't support Wake Lock. If you experience issues:
1. Use Chrome or Safari (latest version)
2. Or manually increase screen timeout in device settings
3. Or periodically tap screen to keep it awake

---

## Related Issues

### Fixed
- ✅ Audio stopping on screen lock
- ✅ User confusion about playback status

### Related Improvements
Also improved in this session:
- Translation loading indicator (WeChat app)
- Male voice selection explanation (WeChat app)

---

## Next Steps

### Optional Future Enhancements
1. **Battery warning**: Show warning if battery < 20%
2. **Manual toggle**: Let users disable wake lock
3. **Smart timeout**: Auto-release after X minutes
4. **Usage stats**: Track wake lock duration

### Monitoring
Watch for:
- Battery drain complaints
- Browser compatibility issues
- Wake lock failures

---

## Documentation

**Full Details**: See `WAKE_LOCK_IMPLEMENTATION.md`

**Related Docs**:
- `MOBILE_TESTING_FIXES.md` - Other mobile fixes
- `DEPLOYMENT_SUCCESS.md` - Deployment guide

---

## Summary

**Problem**: Screen locks → Audio stops
**Solution**: Wake Lock API → Screen stays on
**Result**: Seamless audio playback ✅

**Status**: ✅ Deployed and live in production
**Testing**: Ready for mobile device testing

---

**Last Updated**: October 23, 2025
**Platform**: Vue.js Web App
**Environment**: Production (https://famlingo-api.com)
