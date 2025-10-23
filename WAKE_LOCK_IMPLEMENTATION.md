# Wake Lock Implementation - Listen Mode

## Overview
Implemented the **Screen Wake Lock API** to prevent the screen from locking during Listen Mode, which was causing audio playback to stop.

## Problem
When using Listen Mode on mobile devices, the screen would lock after the device's timeout period (usually 30-60 seconds), causing the Web Speech Synthesis API to stop playing audio. The app would continue running (advancing to next phrases) but no sound would play.

## Solution
Added the **Screen Wake Lock API** to keep the screen on while Listen Mode is active.

---

## Implementation Details

### Wake Lock Lifecycle

```javascript
// 1. Request wake lock when playback starts
async function startListening() {
  isPlaying.value = true
  await requestWakeLock()  // ← Keeps screen on
  await playCurrentPhrase()
}

// 2. Release wake lock when paused
function pauseListening() {
  isPlaying.value = false
  releaseWakeLock()  // ← Allows screen to lock
}

// 3. Re-acquire when resuming
async function resumeListening() {
  isPlaying.value = true
  await requestWakeLock()  // ← Keeps screen on again
  playCurrentPhrase()
}

// 4. Release on cleanup
onUnmounted(() => {
  stopPlayback()
  releaseWakeLock()  // ← Clean up
})
```

### Wake Lock API Functions

**Request Wake Lock**:
```javascript
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      console.log('✅ Wake Lock acquired - screen will stay on')

      wakeLock.addEventListener('release', () => {
        console.log('⚠️ Wake Lock released')
      })
    } else {
      console.warn('⚠️ Wake Lock API not supported on this device')
    }
  } catch (err) {
    console.error('❌ Failed to acquire Wake Lock:', err)
  }
}
```

**Release Wake Lock**:
```javascript
function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release()
      .then(() => {
        wakeLock = null
        console.log('🔓 Wake Lock released manually')
      })
      .catch((err) => {
        console.error('❌ Failed to release Wake Lock:', err)
      })
  }
}
```

---

## Visual Indicator

Added a green notice badge when Listen Mode is active:

```vue
<div v-if="isPlaying" class="wake-lock-notice">
  <span class="icon">🔒</span>
  <span class="text">Screen lock disabled - listening mode active</span>
</div>
```

**Styling**:
- Green gradient background (#E8F5E9 → #C8E6C9)
- Lock icon emoji
- Appears only when audio is playing
- Positioned at bottom of screen

---

## Browser Compatibility

### Supported Browsers ✅
- **Chrome/Edge**: Desktop & Android (full support)
- **Safari iOS**: 16.4+ (full support)
- **Firefox Android**: 126+ (experimental)

### Unsupported Browsers ⚠️
- **Safari macOS**: Not supported (desktop doesn't need it)
- **Firefox Desktop**: Not supported
- **Older mobile browsers**: Gracefully degrades

### Fallback Behavior
If Wake Lock API is not supported:
- App continues to work normally
- Console warning logged
- User must manually keep screen on
- No errors or crashes

---

## Usage Instructions

### For Users

**Option 1: Use Wake Lock (Automatic)**
1. Start Listen Mode
2. Press play
3. Screen will stay on automatically
4. Green notice shows "Screen lock disabled"

**Option 2: Manual Fallback**
If your browser doesn't support Wake Lock:
1. Go to device settings
2. Increase screen timeout to max (10-30 minutes)
3. Or manually tap screen periodically

### For Developers

**Testing Wake Lock**:
```javascript
// Check if supported
console.log('Wake Lock supported:', 'wakeLock' in navigator)

// Check current wake lock state
if (wakeLock !== null) {
  console.log('Wake Lock active')
} else {
  console.log('Wake Lock inactive')
}
```

**Console Messages**:
- `✅ Wake Lock acquired` - Successfully locked screen
- `⚠️ Wake Lock released` - Lock released (auto or manual)
- `🔓 Wake Lock released manually` - Explicitly released
- `⚠️ Wake Lock API not supported` - Fallback needed

---

## Technical Considerations

### Why Screen Wake Lock?

**Alternative approaches considered**:
1. ❌ **Background Audio API** - Not available in web apps
2. ❌ **Keep-alive ping** - Doesn't prevent screen lock
3. ❌ **Video element hack** - Unreliable and hacky
4. ✅ **Wake Lock API** - Purpose-built, clean solution

### Battery Impact
- Wake Lock uses minimal battery (just keeps screen on)
- Released immediately when paused/stopped
- User can override by manually locking device
- No background processing

### Security & Privacy
- Requires HTTPS (production already uses HTTPS)
- User can see screen is on
- No permissions popup needed
- Automatically released on tab switch

---

## Related Files

**Modified**:
- `src/views/ListenView.vue` - Wake Lock implementation

**Related**:
- `MOBILE_TESTING_FIXES.md` - Other mobile fixes
- `RESUME_STATUS.md` - Session documentation

---

## Testing Checklist

### Desktop Testing ✅
- [x] Chrome: Wake Lock acquires successfully
- [x] Edge: Wake Lock acquires successfully
- [x] Safari: Gracefully degrades (not supported)
- [x] Firefox: Gracefully degrades (not supported)

### Mobile Testing 📱
Test on actual device:
1. Start Listen Mode
2. Let screen timeout occur (30-60 seconds)
3. Verify screen stays on
4. Verify audio continues playing
5. Pause and verify wake lock releases
6. Resume and verify wake lock re-acquires

### Edge Cases
- [ ] Tab switch (should release wake lock)
- [ ] Browser minimize (should release wake lock)
- [ ] Phone call incoming (should release wake lock)
- [ ] Low battery warning (wake lock may be denied)

---

## Future Enhancements

### Potential Improvements
1. **Battery indicator**: Show battery level warning if < 20%
2. **Manual toggle**: Let users disable wake lock if desired
3. **Smart timeout**: Release lock after X minutes of inactivity
4. **Statistics**: Track how long wake lock was active

### Known Limitations
- Desktop Safari doesn't support Wake Lock (not needed)
- Some older Android browsers may not support it
- Wake lock automatically releases on low battery
- Can't prevent device shutdown/restart

---

## Resources

**Documentation**:
- [MDN Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
- [W3C Wake Lock Spec](https://w3c.github.io/screen-wake-lock/)
- [Can I Use - Wake Lock](https://caniuse.com/wake-lock)

**Browser Support**:
- Chrome 84+ (Android & Desktop)
- Edge 84+ (Android & Desktop)
- Safari iOS 16.4+
- Firefox Android 126+ (experimental)

---

**Implementation Date**: October 23, 2025
**Status**: ✅ Deployed to production
**Commit**: `fd0a19a`
