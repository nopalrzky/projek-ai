# Sidomulyo Attendance Mobile

Android-first employee attendance app.

## Goal

- Check-in/out with live camera capture only.
- Capture GPS at check-in/out.
- Keep live location active during attendance session via foreground location service.
- Send data to Sidomulyo Motor backend/admin app.

## Dev

```bash
npm install
npm start
```

For native Android permissions/background service:

```bash
npm run prebuild
npm run android
```

## Backend expected endpoints

```text
POST /api/mobile/login
POST /api/attendance/checkin
POST /api/attendance/location
POST /api/attendance/checkout
```

Current app is ready to call those endpoints; backend implementation lives in sibling project:

```text
/Users/naufalrizky/projek ai/sidomulyo-motor
```

## Notes

- Gallery upload is not implemented; photo uses camera capture path only.
- Uses foreground service notification while tracking.
- Cannot prevent user force-stop/GPS-off/permission revoke; backend should flag last-ping gaps.
