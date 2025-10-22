# Camera Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(camera): {desc} + update docs`

---

## Metadata
- **Feature:** Camera
- **Status:** ✅ Complete
- **Completion:** 100%
- **Last Modified:** 2025-10-22
- **Milestone:** M1
- **Dependencies:** None
- **Used By:** tracking

---

## Purpose
Provides webcam video capture using getUserMedia API.

**Outputs:** HTMLVideoElement ref with live camera feed

---

## Files

### components/CameraView.tsx (97 lines)
- Requests camera permissions
- Renders mirrored video element
- Error handling (permission denied, no camera)
- Loading states
- Cleanup on unmount

**Props:**
```typescript
interface CameraViewProps {
  width?: number      // Default: 320
  height?: number     // Default: 240
  className?: string
}
```

**Usage:**
```typescript
<CameraView width={640} height={480} />
```

---

## Key Features

1. **getUserMedia Integration:**
```typescript
const mediaStream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: width },
    height: { ideal: height },
    facingMode: 'user',
  },
  audio: false,
})
```

2. **Error Handling:**
- Permission denied → Shows error UI
- No camera → Shows error message
- Cleanup on unmount

3. **Mirroring:**
```tsx
<video style={{ transform: 'scaleX(-1)' }} />
```

---

## Known Issues
None - Feature is complete and tested

---

## Next Steps
1. Add option for rear camera (facingMode: 'environment')
2. Add camera selection dropdown (if multiple cameras)
3. Add resolution selection

---

## AI Guidelines
- Always clean up mediaStream in useEffect return
- Check for mounted state in async operations
- Test on HTTPS or localhost (getUserMedia requirement)

---

**Status:** ✅ Production Ready
