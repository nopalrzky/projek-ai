# Cara Menyalakan Server

## Server Monitor (Dashboard)

```bash
cd "/Users/naufalrizky/projek ai/server-monitor"
node dashboard.js
```

Buka: http://localhost:9000

---

## Service Utama

### WashWallet Backend (Laravel)

```bash
cd "/Users/naufalrizky/projek ai/laundry/wash_wallet_be"
php artisan serve --port=8000
```

Atau sekaligus sama Vite:

```bash
cd "/Users/naufalrizky/projek ai/laundry/wash_wallet_be"
sh -c 'php artisan serve --port=8000 & npm run dev'
```

API: http://localhost:8000

---

### WashWallet Cashier (Flutter)

```bash
cd "/Users/naufalrizky/projek ai/laundry/wash_wallet/apps/cashier"
flutter run -d chrome --web-port=8084
```

Atau manual:

```bash
cd "/Users/naufalrizky/projek ai/laundry/wash_wallet/apps/cashier/build/web"
python3 -m http.server 8084
```

Buka: http://localhost:8084

---

### WashWallet Production (Flutter)

```bash
cd "/Users/naufalrizky/projek ai/laundry/wash_wallet/apps/production/build/web"
python3 -m http.server 8085
```

Buka: http://localhost:8085

---

### WashWallet Customer (Flutter)

```bash
cd "/Users/naufalrizky/projek ai/laundry/wash_wallet/apps/customer/build/web"
python3 -m http.server 8086
```

Buka: http://localhost:8086

---

### Sidomulyo Motor

```bash
cd "/Users/naufalrizky/projek ai/sidomulyo-motor"
npm run dev
```

Buka: http://localhost:3000

---

### Sidomulyo Attendance

```bash
cd "/Users/naufalrizky/projek ai/sidomulyo-attendance"
npm run dev
```

Buka: http://localhost:8081

---

### Tenggaong Backend

```bash
cd "/Users/naufalrizky/projek ai/tenggaong-backend"
node server.js
```

Atau dengan PM2:

```bash
cd "/Users/naufalrizky/projek ai/tenggaong-backend"
pm2 start server.js --name tenggaong-backend
```

Port: 3001

---

### Tenggaong Frontend

```bash
cd "/Users/naufalrizky/projek ai/tenggaong-frontend"
npm run dev
```

Buka: http://localhost:5173

---

## Quick Commands

### Cek Port Aktif

```bash
lsof -i -P | grep LISTEN
```

### Matikan Semua Service PM2

```bash
pm2 delete all
```

### Matikan Service di Port Tertentu

```bash
lsof -ti:8084 | xargs kill -9
```

---

## Catatan

- **9Router** (port 20128) adalah AI gateway - JANGAN di-stop/start/restart dari dashboard. Itu process khusus yang jalan sendiri.
- Server monitor hanya untuk service yang bisa dikontrol (bukan protected).