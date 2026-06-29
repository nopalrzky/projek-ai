# 🚀 Project AI - Multi-Service Development Environment

Dashboard monitoring profesional untuk mengelola semua service development lokal berbasis PM2.

## 📊 Dashboard Monitoring

**URL Akses:** [http://localhost:9000](http://localhost:9000)

Dashboard ini menyediakan monitoring real-time untuk semua service yang berjalan di environment development Anda.

### Fitur Dashboard

- ✅ Real-time CPU & Memory monitoring
- ✅ Response time latency tracking
- ✅ Uptime duration & restart counter
- ✅ Live PM2 logs viewer
- ✅ Search & filter by workspace
- ✅ Auto-refresh every 3 seconds
- ✅ Start/Stop/Restart controls per service

---

## 🎯 Service yang Dikelola

### **Sidomulyo Workspace**
1. **Sidomulyo Motor** (Web Service)
   - Port: `3000`
   - Path: `/Users/naufalrizky/projek ai/sidomulyo-motor`
   - Start command: `node server.js`

2. **Sidomulyo Attendance Mobile** (Expo Metro)
   - Port: `8081`
   - Path: `/Users/naufalrizky/projek ai/sidomulyo-attendance-mobile`
   - Start command: `npm start`

### **Tenggaong Sport Workspace**
3. **Tenggaong Sport Backend** (REST API)
   - Port: `3001`
   - Path: `/Users/naufalrizky/projek ai/tenggaong-sport/backend`
   - Start command: `node src/index.js`

4. **Tenggaong Sport Frontend** (Vite React)
   - Port: `5173`
   - Path: `/Users/naufalrizky/projek ai/tenggaong-sport/frontend`
   - Start command: `npm run dev`

### **Infrastructure**
5. **9Router Dashboard** (AI Gateway - Protected)
   - Port: `20128`
   - **⚠️ Cannot be controlled via dashboard** (protected untuk menjaga koneksi AI)

6. **Status Dashboard** (Monitoring Server)
   - Port: `9000`
   - Path: `/Users/naufalrizky/projek ai/server-monitor/dashboard.js`
   - Start command: `node dashboard.js`

---

## 🔧 Cara Menjalankan Dashboard

### **Metode 1: Quick Start (Recommended)**
```bash
# Restore semua service yang tersimpan
pm2 resurrect
```

Dashboard langsung aktif di [http://localhost:9000](http://localhost:9000)

### **Metode 2: Manual Start Dashboard Saja**
```bash
pm2 start status-dashboard
```

### **Metode 3: Start Semua Service dari Awal**
```bash
# Start dashboard monitoring
pm2 start "node '/Users/naufalrizky/projek ai/server-monitor/dashboard.js'" --name "status-dashboard"

# Start Sidomulyo Motor
pm2 start "node server.js" --name "sidomulyo-motor" --cwd "/Users/naufalrizky/projek ai/sidomulyo-motor"

# Start Sidomulyo Attendance
pm2 start "npm start" --name "sidomulyo-attendance" --cwd "/Users/naufalrizky/projek ai/sidomulyo-attendance-mobile"

# Start Tenggaong Backend
pm2 start "node src/index.js" --name "tenggaong-backend" --cwd "/Users/naufalrizky/projek ai/tenggaong-sport/backend"

# Start Tenggaong Frontend
pm2 start "npm run dev" --name "tenggaong-frontend" --cwd "/Users/naufalrizky/projek ai/tenggaong-sport/frontend"

# Save configuration
pm2 save
```

---

## 🛑 Cara Menghentikan Service

### **Stop Dashboard**
```bash
pm2 stop status-dashboard
```

### **Stop Specific Service**
```bash
pm2 stop sidomulyo-motor
pm2 stop sidomulyo-attendance
pm2 stop tenggaong-backend
pm2 stop tenggaong-frontend
```

### **Stop Semua Service**
```bash
pm2 stop all
```

### **Delete Service (Hapus dari PM2)**
```bash
pm2 delete status-dashboard
# atau
pm2 delete all
```

---

## ♻️ Restart Service

### **Restart Dashboard**
```bash
pm2 restart status-dashboard
```

### **Restart Specific Service**
```bash
pm2 restart sidomulyo-motor
```

### **Restart Semua Service**
```bash
pm2 restart all
```

---

## 📋 Monitoring & Logs

### **Lihat Status Semua Service**
```bash
pm2 list
```

### **Lihat Logs Real-time**
```bash
# Semua service
pm2 logs

# Specific service
pm2 logs status-dashboard
pm2 logs sidomulyo-motor

# Last 100 lines
pm2 logs status-dashboard --lines 100
```

### **Clear Logs**
```bash
pm2 flush
```

### **Monitoring Dashboard CLI**
```bash
pm2 monit
```

---

## 🔄 Auto-Start Configuration

Dashboard dan semua service sudah dikonfigurasi untuk **auto-start** saat Mac boot menggunakan macOS LaunchAgent.

### **Status Auto-Start**
✅ **Sudah Aktif** - Service akan otomatis berjalan saat Mac restart

### **Disable Auto-Start**
```bash
pm2 unstartup launchd
```

### **Enable Auto-Start Kembali**
```bash
pm2 startup launchd
# Lalu jalankan command sudo yang muncul
pm2 save
```

---

## 🌐 Quick Access URLs

- **Dashboard Monitoring:** [http://localhost:9000](http://localhost:9000)
- **Sidomulyo Motor:** [http://localhost:3000](http://localhost:3000)
- **Sidomulyo Attendance:** [http://localhost:8081](http://localhost:8081)
- **Tenggaong Backend:** [http://localhost:3001](http://localhost:3001)
- **Tenggaong Frontend:** [http://localhost:5173](http://localhost:5173)
- **9Router Gateway:** [http://localhost:20128](http://localhost:20128)

---

## 🛠️ Troubleshooting

### **Dashboard tidak muncul / mati**
```bash
# Cek status PM2
pm2 list

# Jika kosong, restore
pm2 resurrect

# Jika masih bermasalah, start manual
pm2 start status-dashboard
```

### **Port sudah digunakan**
```bash
# Cek proses yang menggunakan port
lsof -i :9000

# Kill proses
kill -9 <PID>

# Atau gunakan PM2 restart
pm2 restart status-dashboard
```

### **Service tidak auto-start saat boot**
```bash
# Re-setup startup script
pm2 unstartup launchd
pm2 startup launchd
# Jalankan command sudo yang muncul
pm2 save
```

### **PM2 daemon mati**
```bash
# PM2 akan otomatis restart daemon
pm2 list

# Atau manual restart
pm2 kill
pm2 resurrect
```

---

## 📝 Notes

- **9Router** adalah AI Gateway yang mengelola komunikasi dengan model AI. Service ini **tidak boleh dimatikan via dashboard** untuk menjaga stabilitas koneksi AI session.
- Semua service menggunakan **PM2** sebagai process manager untuk auto-restart on crash dan centralized logging.
- Dashboard menggunakan **PM2 JSON API** (`pm2 jlist`) untuk mendapatkan metrics real-time (CPU, RAM, uptime, restart count).
- Auto-refresh dashboard setiap **3 detik** untuk monitoring real-time.

---

## 📦 Dependencies

- **Node.js** (v22.23.1 via NVM)
- **PM2** (Process Manager)
- **macOS LaunchAgent** (Auto-start on boot)

---

## 👨‍💻 Development

Dashboard monitoring ini dibangun dengan:
- **Backend:** Node.js native `http` module
- **Frontend:** Vanilla JavaScript + Tailwind CSS + Lucide Icons
- **Fonts:** Plus Jakarta Sans + JetBrains Mono
- **PM2 Integration:** `pm2 jlist` + `pm2 logs` CLI commands

---

**Last Updated:** 2026-06-28  
**Author:** Naufal Rizky  
**Environment:** macOS 26.2
