import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, exec, execFile, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PID_DIR = path.join(__dirname, '.pids');
export const LOG_BUFFERS = {};
export const MAX_LOG_LINES = 1000;

// Tambahkan data simulasi sebagai teks di pushLog setelah import selesai.
// Contoh: pushLog('Hermes Agent', 'Model switching event...');
// Juga, update LOG_BUFFERS untuk simulasi log saat ini.

function pushLog(serviceName, text) {
  if (!LOG_BUFFERS[serviceName]) LOG_BUFFERS[serviceName] = [];
  LOG_BUFFERS[serviceName].push(text);
  if (LOG_BUFFERS[serviceName].length > MAX_LOG_LINES) {
    LOG_BUFFERS[serviceName].splice(0, LOG_BUFFERS[serviceName].length - MAX_LOG_LINES);
  }
  // Simulasikan kejadian pada model switching kronik
  if (serviceName === 'Hermes Agent') {
    // Tambahkan log simulasi sekali saja untuk mencegah rekursi tak terbatas
    if (!window.logSimulated) {
      window.logSimulated = true;
      pushLog('Hermes Agent', '[2026-06-30T00:00:00Z] Cron: menjalankan model switching logic');
      pushLog('Hermes Agent', '[2026-06-30T00:00:01Z] Model switching model: gemini-flash');
      pushLog('Hermes Agent', '[2026-06-30T00:00:02Z] Konfigurasi ditulis ke .hermes/config.yaml');
      pushLog('Hermes Agent', '[2026-06-30T00:00:03Z] Model diingat dan ready');
    }
  }
}

export const SERVICE_CONFIG = {
  // ═══ Sidomulyo ═══
  'Sidomulyo Motor': {
    port: 3000,
    workspace: 'Sidomulyo',
    type: 'Web Service',
    cwd: '/Users/naufalrizky/projek ai/sidomulyo-motor',
    command: 'node',
    args: ['server.js'],
  },
  'Sidomulyo Attendance': {
    port: 8081,
    workspace: 'Sidomulyo',
    type: 'Expo Metro',
    cwd: '/Users/naufalrizky/projek ai/sidomulyo-attendance-mobile',
    command: 'npm',
    args: ['start']
  },

  // ═══ Tenggaong Sport ═══
  'Tenggaong Sport Backend': {
    port: 3001,
    workspace: 'Tenggaong',
    type: 'REST API',
    cwd: '/Users/naufalrizky/projek ai/tenggaong-sport/backend',
    command: 'node',
    args: ['src/index.js']
  },
  'Tenggaong Sport Frontend': {
    port: 5173,
    workspace: 'Tenggaong',
    type: 'Vite React',
    cwd: '/Users/naufalrizky/projek ai/tenggaong-sport/frontend',
    command: 'npm',
    args: ['run', 'dev']
  },

  // ═══ WashWallet Laundry ═══
  'WashWallet Backend': {
    port: 8000,
    workspace: 'WashWallet',
    type: 'Laravel + React',
    cwd: '/Users/naufalrizky/projek ai/laundry/wash_wallet_be',
    command: 'sh',
    args: ['-c', 'php artisan serve --port=8000 & npm run dev'],
    github: true
  },
  'WashWallet Cashier': {
    port: 8084,
    workspace: 'WashWallet',
    type: 'Flutter Web',
    cwd: '/Users/naufalrizky/projek ai/laundry/wash_wallet/apps/cashier/build/web',
    command: 'python3',
    args: ['-m', 'http.server', '8084'],
    github: true
  },
  'WashWallet Production': {
    port: 8085,
    workspace: 'WashWallet',
    type: 'Flutter Web',
    cwd: '/Users/naufalrizky/projek ai/laundry/wash_wallet/apps/production/build/web',
    command: 'python3',
    args: ['-m', 'http.server', '8085'],
    github: true
  },
  'WashWallet Customer': {
    port: 8086,
    workspace: 'WashWallet',
    type: 'Flutter Web',
    cwd: '/Users/naufalrizky/projek ai/laundry/wash_wallet/apps/customer/build/web',
    command: 'python3',
    args: ['-m', 'http.server', '8086'],
    github: true
  },

  // ═══ Infrastructure & Tools ═══
  '9Router Gateway': {
    port: 20128,
    workspace: 'Infrastructure',
    type: 'AI Gateway',
    protected: true,
    matchPort: true
  },
  'Monitoring Dashboard': {
    port: 9000,
    workspace: 'Infrastructure',
    type: 'Dashboard',
    matchPort: true
  },
  'Hermes Agent': {
    port: null,
    workspace: 'CLI',
    type: 'AI Agent',
    special: 'node'
  },
  'OpenCode': {
    port: null,
    workspace: 'CLI',
    type: 'AI Coding CLI',
    special: 'opencode',
    command: 'opencode',
    args: []
  }
};

// Ensure PID directory exists
(() => {
  try { fs.mkdirSync(PID_DIR, { recursive: true }); } catch {}
})();

export const checkPort = async (port, special = null) => {
  const start = Date.now();
  return new Promise((resolve) => {
    if (!port) {
      const pattern = special === 'opencode' ? 'opencode' : 'node';
      exec(`pgrep -f "${pattern}" 2>/dev/null`, (err, stdout) => {
        const running = !err && stdout.trim().length > 0;
        let hermesPid = null;
        try {
          const buf = fs.readFileSync(path.join(PID_DIR, 'Hermes_Agent'), 'utf8');
          hermesPid = parseInt(buf, 10);
          if (hermesPid && execSync(`kill -0 ${hermesPid} 2>/dev/null`, { stdio: 'ignore' }) === 0) {
            running = true;
          }
        } catch {}
        resolve({ online: running, latency: 0 });
      });
      return;
    }
    const req = http.get(`http://localhost:${port}/`, { timeout: 1000 }, () => {
      resolve({ online: true, latency: Date.now() - start });
    });
    req.on('error', () => {
      resolve({ online: false, latency: Date.now() - start });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ online: false, latency: Date.now() - start });
    });
  });
};

export function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { encoding: 'utf8', timeout: 5000 }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}

export async function getPID(serviceName) {
  const pidFile = path.join(PID_DIR, serviceName.replace(/\s+/g, '_'));
  try {
    const pid = await fs.promises.readFile(pidFile, 'utf8');
    return parseInt(pid.trim());
  } catch {
    return null;
  }
}

export async function findPID(serviceName) {
  const service = SERVICE_CONFIG[serviceName];
  try {
    if (service?.matchPort && service.port) {
      const pid = execSync(`lsof -ti:${service.port} -sTCP:LISTEN | head -1`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      return pid ? parseInt(pid, 10) : null;
    }
    if (!service?.special) return null;
    const pattern = service.special === 'opencode' ? '[o]pencode' : '[H]ermes|[h]ermes';
    const pid = execSync(`ps -axo pid=,command= | egrep '${pattern}' | awk 'NR==1{print $1}'`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return pid ? parseInt(pid, 10) : null;
  } catch {
    return null;
  }
}

export async function savePID(serviceName, pid) {
  const pidFile = path.join(PID_DIR, serviceName.replace(/\s+/g, '_'));
  await fs.promises.writeFile(pidFile, pid.toString());
}

export async function removePID(serviceName) {
  const pidFile = path.join(PID_DIR, serviceName.replace(/\s+/g, '_'));
  try { await fs.promises.unlink(pidFile); } catch {}
}

export async function isProcessRunning(pid) {
  return new Promise((resolve) => {
    exec(`kill -0 ${pid} 2>/dev/null`, (err) => {
      resolve(!err);
    });
  });
}

export async function killPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, () => resolve());
  });
}

export async function startService(serviceName) {
  const service = SERVICE_CONFIG[serviceName];
  if (!service) throw new Error('Service not found');
  if (!service.command) throw new Error('No start command configured');

  // Prepare log file
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `${serviceName.replace(/\s+/g, '_')}.log`);
  const logFd = fs.openSync(logFile, 'a');

  if (service.special === 'opencode') {
    return new Promise(async (resolve, reject) => {
      const cmd = `${service.command}`;
      const env = { PATH: process.env.PATH };
      const opts = { cwd: service.cwd || process.cwd(), env, stdio: ['ignore', logFd, logFd], detached: true };
      const child = spawn(service.command, service.args, opts);
      
      child.on('error', (err) => {
        reject(new Error(`Failed to start ${serviceName}: ${err.message}`));
      });
      
      child.unref();
      await savePID(serviceName, child.pid);
      resolve(child.pid);
    });
  }

  return new Promise(async (resolve, reject) => {
    const child = spawn(service.command, service.args, {
      cwd: service.cwd || process.cwd(),
      stdio: ['ignore', logFd, logFd],
      detached: true
    });
    
    child.on('error', (err) => {
      reject(new Error(`Failed to start ${serviceName}: ${err.message}`));
    });
    
    child.unref();
    await savePID(serviceName, child.pid);
    resolve(child.pid);
  });
}

export async function stopService(serviceName) {
  const service = SERVICE_CONFIG[serviceName];
  // Aggressive stop: try PID first, then fallback to port
  const pid = await getPID(serviceName);
  if (pid) {
    exec(`kill -9 ${pid} 2>/dev/null`);
    await removePID(serviceName);
  }
  // Double-check via port if defined
  if (service?.port) {
    await killPort(service.port);
  }
}

export async function restartService(serviceName) {
  await stopService(serviceName);
  await new Promise(r => setTimeout(r, 1000));
  await startService(serviceName);
}