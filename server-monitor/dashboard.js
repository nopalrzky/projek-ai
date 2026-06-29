import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, exec } from 'child_process';
import {
  SERVICE_CONFIG,
  LOG_BUFFERS,
  checkPort,
  getPID,
  findPID,
  isProcessRunning,
  startService,
  stopService,
  restartService
} from './services.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GIT_CACHE = new Map();
const GIT_FETCH_TTL = 5 * 60 * 1000;

function getProcessStats(pid) {
  if (!pid) return { cpu: 0, mem: 0 };
  try {
    const [cpu, mem] = execSync(`ps -p ${pid} -o %cpu=,%mem=`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .trim().split(/\s+/).map(Number);
    return { cpu: Number.isFinite(cpu) ? cpu : 0, mem: Number.isFinite(mem) ? mem : 0 };
  } catch {
    return { cpu: 0, mem: 0 };
  }
}

function getCliModel(name) {
  try {
    if (name === 'Hermes Agent') {
      const cfgPath = '/Users/naufalrizky/.hermes/config.yaml';
      const cfg = fs.readFileSync(cfgPath, 'utf8');
      // Match indented default: and provider: lines
      const modelMatch = cfg.match(/^\s*default:\s*['"]?([^'"\n]+)['"]?/m);
      const providerMatch = cfg.match(/^\s*provider:\s*['"]?([^'"\n]+)['"]?/m);
      const model = modelMatch?.[1] || '—';
      const provider = providerMatch?.[1] || 'custom';
      
      // Query 9Router DB for actual last used model from requestDetails
      let actualModel = '';
      try {
        const dbPath = '/Users/naufalrizky/.9router/db/data.sqlite';
        if (fs.existsSync(dbPath)) {
          const result = execSync(`sqlite3 "${dbPath}" "SELECT provider, model FROM requestDetails ORDER BY timestamp DESC LIMIT 1;"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          if (result) {
            const [providerName, modelName] = result.split('|');
            if (providerName && modelName) {
              actualModel = ` (last: ${providerName}/${modelName})`;
            }
          }
        }
      } catch {}
      
      return `${provider}/${model}${actualModel}`;
    }
    if (name === 'OpenCode') {
      const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '/.config/opencode/opencode/opencode.json'), 'utf8'));
      return cfg.model || '—';
    }
  } catch {}
  return '—';
}

function getGitStatus(cwd) {
  if (!cwd || !fs.existsSync(cwd)) return { state: 'none', label: 'No repo' };
  try {
    const root = execSync('git rev-parse --show-toplevel', { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const cached = GIT_CACHE.get(root);
    if (cached && Date.now() - cached.at < GIT_FETCH_TTL) return cached.value;

    try { execSync('git fetch --quiet --prune', { cwd: root, stdio: 'ignore', timeout: 20000 }); } catch {}
    const porcelain = execSync('git status --porcelain', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    let ahead = 0, behind = 0;
    try {
      [ahead, behind] = execSync('git rev-list --left-right --count HEAD...@{u}', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
        .trim().split(/\s+/).map(Number);
    } catch {}

    const value = porcelain
      ? { state: 'dirty', label: 'Local changes' }
      : behind > 0
        ? { state: 'update', label: `${behind} update available` }
        : ahead > 0
          ? { state: 'ahead', label: `${ahead} local commit` }
          : { state: 'clean', label: 'Up to date' };
    GIT_CACHE.set(root, { at: Date.now(), value });
    return value;
  } catch {
    return { state: 'none', label: 'No repo' };
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // API: Get status of all services
  if (req.url === '/api/status') {
    const rows = await Promise.all(Object.entries(SERVICE_CONFIG).map(async ([name, info]) => {
      let online = false, latency = 0, pid = null, running = false;
      
      // Special services: process check
      if (info.special) {
        const check = await checkPort(null, info.special);
        online = check.online;
        latency = check.latency;
      } else if (info.port) {
        const check = await checkPort(info.port);
        online = check.online;
        latency = check.latency;
      }
      
      let p = await getPID(name);
      running = p ? await isProcessRunning(p) : false;
      if (!running && (info.special || info.matchPort)) {
        p = await findPID(name);
        running = !!p;
      }
      const stats = getProcessStats(running ? p : null);
      
      return [name, {
        port: info.port,
        workspace: info.workspace,
        type: info.type,
        online,
        latency,
        pid: running ? p : null,
        cpu: stats.cpu,
        mem: stats.mem,
        model: getCliModel(name),
        protected: info.protected || false,
        hasLogs: LOG_BUFFERS[name] && LOG_BUFFERS[name].length > 0,
        git: info.github ? getGitStatus(info.cwd) : { state: 'none', label: 'No GitHub' }
      }];
    }));
    const statuses = Object.fromEntries(rows);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(statuses));
  }

  if (req.url === '/api/telemetry') {
    const rows = await Promise.all(Object.entries(SERVICE_CONFIG).map(async ([name, info]) => {
      let p = await getPID(name);
      let running = p ? await isProcessRunning(p) : false;
      if (!running && (info.special || info.matchPort)) {
        p = await findPID(name);
        running = !!p;
      }
      const stats = getProcessStats(running ? p : null);
      return [name, { pid: running ? p : null, cpu: stats.cpu, mem: stats.mem, model: info.workspace === 'CLI' ? getCliModel(name) : null }];
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(Object.fromEntries(rows)));
  }

  // API: Get or clear logs
  if (req.url.startsWith('/api/logs/')) {
    const urlParts = req.url.split('/api/logs/')[1];
    
    // Clear logs
    if (urlParts.endsWith('/clear') && req.method === 'POST') {
      const serviceName = decodeURIComponent(urlParts.replace('/clear', ''));
      LOG_BUFFERS[serviceName] = [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }
    
    // Get logs - read from file for all services
    const serviceName = decodeURIComponent(urlParts);
    try {
      // Special case for Hermes Agent (different log file name)
      const logFileName = serviceName === 'Hermes Agent' 
        ? 'cron-model-switch.log' 
        : serviceName === '9Router Gateway'
        ? '9router.log'
        : `${serviceName.replace(/\s+/g, '_')}.log`;
      const logPath = path.join(__dirname, 'logs', logFileName);
      const logs = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([logs]));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // API: Action (start/stop/restart)
  if (req.url.startsWith('/api/action') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { serviceName, action } = JSON.parse(body);
        const service = SERVICE_CONFIG[serviceName];
        console.error('[ACTION] serviceName:', serviceName, 'action:', action, 'service:', service);
        
        if (!service) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Service not found' }));
        }

        if (service.protected && action !== 'restart') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Service is protected' }));
        }

        if (action === 'start') {
          await startService(serviceName);
        } else if (action === 'stop') {
          await stopService(serviceName);
        } else if (action === 'restart') {
          await restartService(serviceName);
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid action' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ============ SECURITY CHECK APIs ============
  const TEMP_DIR = '/tmp/security-check';
  const ABORT_DIR = '/Users/naufalrizky/projek ai/Projek Gajadi';

  // Ensure abort dir exists
  if (!fs.existsSync(ABORT_DIR)) {
    fs.mkdirSync(ABORT_DIR, { recursive: true });
  }

  // API: Get 9Router config (for client-side use)
  if (req.url === '/api/9router-config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      key: ROUTER_API_KEY,
      url: ROUTER_API_URL
    }));
    return;
  }

  // API: Get 9Router realtime logs (from requestDetails DB)
  if (req.url === '/api/9router-logs' && req.method === 'GET') {
    try {
      const dbPath = '/Users/naufalrizky/.9router/db/data.sqlite';
      if (!fs.existsSync(dbPath)) {
        return res.end(JSON.stringify({ logs: '9Router DB not found' }));
      }
      const result = execSync(`sqlite3 "${dbPath}" "SELECT timestamp, provider, model, status, data FROM requestDetails ORDER BY timestamp DESC LIMIT 20;"`, { 
        encoding: 'utf8', 
        stdio: ['ignore', 'pipe', 'ignore'] 
      }).trim();
      
      const lines = result.split('\n').filter(l => l).map(line => {
        const [timestamp, provider, model, status, data] = line.split('|');
        try {
          const d = JSON.parse(data);
          const combo = d.combo ? `combo:${d.combo}` : '';
          const lat = d.latency ? `${d.latency.total}ms` : '';
          const tok = d.tokens ? `tok:${(d.tokens.prompt_tokens||0)}/${(d.tokens.completion_tokens||0)}` : '';
          // Convert UTC ISO → WIB (UTC+7) HH:MM:SS
          let time = timestamp;
          try {
            const t = new Date(timestamp);
            if (!isNaN(t.getTime())) {
              time = t.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });
            }
          } catch {}
          return `[${time}] ${provider}/${model} ${d.status || status} ${lat} ${tok}${combo}`;
        } catch {
          return `[${timestamp}] ${provider}/${model} ${status}`;
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ logs: lines.join('\n') }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: Translate text via local 9Router
  if (req.url === '/api/translate' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { text } = JSON.parse(body);
        if (!text) throw new Error('text required');
        const resp = await fetch('http://localhost:20128/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'oc-prod/gpt-4o-mini',
            messages: [{ role: 'user', content: `Terjemahkan ke bahasa Indonesia yang natural:\n\n"${text}"\n\nHanya berikan terjemahan, tanpa penjelasan tambahan.` }],
            max_tokens: 200
          })
        });
        const raw = await resp.text();
        // 9Router appends SSE markers after JSON; extract JSON part
        const jsonPart = raw.split(/data:/)[0].trim();
        const data = JSON.parse(jsonPart);
        const translation = data.choices?.[0]?.message?.content?.trim() || text;
        const tokens = data.usage?.total_tokens || 0;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ translation, tokens }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Summarize README via local 9Router
  if (req.url === '/api/readme-summary' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { repoPath } = JSON.parse(body);
        if (!repoPath) throw new Error('repoPath required');

        // Try common README filenames
        const candidates = ['README.md', 'Readme.md', 'readme.md', 'README.rst', 'README'];
        let readmeContent = null;
        for (const f of candidates) {
          const fp = path.join(repoPath, f);
          if (fs.existsSync(fp)) {
            readmeContent = fs.readFileSync(fp, 'utf8');
            break;
          }
        }
        if (!readmeContent) throw new Error('README tidak ditemukan');
        // Trim to max ~2000 chars to save tokens
        const trimmed = readmeContent.slice(0, 2000);

        const resp = await fetch('http://localhost:20128/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'oc-prod/gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Kamu adalah asisten yang membantu merangkum repositori GitHub. Berikan ringkasan 2-3 kalimat: repositori ini tentang apa dan apa fungsinya. Gunakan bahasa Indonesia. Langsung ke inti.' },
              { role: 'user', content: `Berdasarkan README berikut, jelaskan secara singkat repositori ini:\n\n${trimmed}` }
            ],
            max_tokens: 200
          })
        });
        const raw = await resp.text();
        const jsonPart = raw.split(/data:/)[0].trim();
        const data = JSON.parse(jsonPart);
        const summary = data.choices?.[0]?.message?.content?.trim() || 'Tidak ada ringkasan';
        const tokens = data.usage?.total_tokens || 0;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ summary, tokens }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ summary: null, error: e.message }));
      }
    });
    return;
  }

  // API: Security check
  if (req.url === '/api/security-check' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        let repoUrl = parsed.url || parsed.repoUrl;
        let repoName = parsed.repo;
        let owner = '';
        
        // Parse owner/repo from URL if not provided
        if (!repoName && repoUrl) {
          const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
          if (match) { repoName = match[2]; owner = match[1]; }
        }
        
        // Get repo info from GitHub API
        let repoInfo = { description: '', stars: 0, forks: 0, language: '' };
        try {
          const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
            headers: { 'User-Agent': 'Hermes-Security-Scan' }
          });
          if (ghRes.ok) {
            const ghData = await ghRes.json();
            repoInfo = {
              description: ghData.description || 'Tidak ada deskripsi',
              stars: ghData.stargazers_count || 0,
              forks: ghData.forks_count || 0,
              language: ghData.language || 'N/A',
              owner: ghData.owner?.login || owner,
              full_name: ghData.full_name || `${owner}/${repoName}`
            };
          }
        } catch (e) { console.log('GitHub API error:', e.message); }
        if (!repoName) throw new Error('Invalid repo URL');
        
        // Create temp directory with unique name
        const uniqueId = Date.now();
        const repoDir = path.join(TEMP_DIR, `${repoName}-${uniqueId}`);
        
        // Clone repo first
        execSync(`git clone --depth 1 "${repoUrl}" "${repoDir}"`, { stdio: 'pipe' });
        
        // Then create security-reports folders inside
        const rawDir = path.join(repoDir, 'security-reports', 'raw');
        const summaryDir = path.join(repoDir, 'security-reports', 'summary');
        fs.mkdirSync(rawDir, { recursive: true });
        fs.mkdirSync(summaryDir, { recursive: true });

        // Helper: run command with exec
        const runCmd = (cmd, timeout = 60) => new Promise((resolve) => {
          exec(cmd, { timeout: timeout * 1000, encoding: 'utf8' }, (err, stdout, stderr) => {
            resolve(err ? (stderr || err.message) : stdout);
          });
        });
        let gitleaksSummary = { status: 'PASS', leaks_found: 0 };
        try {
          const gitleaksPath = execSync('which gitleaks', { stdio: 'pipe' }).toString().trim();
          const gitleaksOut = await runCmd(`"${gitleaksPath}" detect "${repoDir}" --no-git -r "${rawDir}/gitleaks.json" --format json 2>&1`);
          // Parse gitleaks JSON untuk summary
          let rawData = [];
          try { rawData = JSON.parse(fs.readFileSync(path.join(rawDir, 'gitleaks.json'), 'utf8')); } catch {}
          const leaks = Array.isArray(rawData) ? rawData : (rawData.Findings || []);
          gitleaksSummary = {
            status: leaks.length > 0 ? 'FAIL' : 'PASS',
            leaks_found: leaks.length,
            files: leaks.slice(0, 5).map(l => l.File || l.file || 'unknown')
          };
        } catch (e) {
          gitleaksSummary = { status: 'ERROR', error: e.message };
        }

        // === 2. Trivy ===
        let trivySummary = { status: 'PASS', critical: 0, high: 0, medium: 0, top_findings: [] };
        try {
          const trivyPath = execSync('which trivy', { stdio: 'pipe' }).toString().trim();
          await runCmd(`"${trivyPath}" repo "${repoDir}" --scanners vuln --severity HIGH,CRITICAL --format json --output "${rawDir}/trivy.json" --quiet 2>&1`, 120);
          // Parse Trivy JSON for summary
          let rawData = {};
          try { rawData = JSON.parse(fs.readFileSync(path.join(rawDir, 'trivy.json'), 'utf8')); } catch {}
          const vulns = rawData.Results || [];
          let critical = 0, high = 0, medium = 0, findings = [];
          for (const r of vulns) {
            for (const v of (r.Vulnerabilities || [])) {
              if (v.Severity === 'CRITICAL') critical++;
              else if (v.Severity === 'HIGH') high++;
              else if (v.Severity === 'MEDIUM') medium++;
              findings.push({
                id: v.VulnerabilityID,
                package: v.PkgName,
                installed: v.InstalledVersion,
                fixed: v.FixedVersion,
                severity: v.Severity
              });
            }
          }
          trivySummary = {
            status: critical > 0 ? 'FAIL' : (high > 0 ? 'NEEDS_REVIEW' : 'PASS'),
            critical, high, medium,
            top_findings: findings.slice(0, 10)
          };
        } catch (e) {
          trivySummary = { status: 'ERROR', error: e.message };
        }

        // === 3. OpenSSF Scorecard ===
        let scorecardSummary = { status: 'SKIPPED', score: null, risky_checks: [] };
        // Scorecard requires GH token - skip for now

        // === 4. CodeQL ===
        let codeqlSummary = { status: 'SKIPPED', alerts: 0 };
        // CodeQL requires GH Actions - skip for now

        // === 5. zizmor ===
        let zizmorSummary = { status: 'PASS', findings: 0 };
        try {
          const zizmorPath = execSync('which zizmor', { stdio: 'pipe' }).toString().trim();
          const wfDir = path.join(repoDir, '.github', 'workflows');
          if (fs.existsSync(wfDir)) {
            await runCmd(`"${zizmorPath}" "${wfDir}" -o "${rawDir}/zizmor.json" 2>&1`);
            let rawData = [];
            try { rawData = JSON.parse(fs.readFileSync(path.join(rawDir, 'zizmor.json'), 'utf8')); } catch {}
            zizmorSummary = {
              status: rawData.length > 0 ? 'NEEDS_REVIEW' : 'PASS',
              findings: rawData.length
            };
          }
        } catch (e) {
          zizmorSummary = { status: 'ERROR', error: e.message };
        }

        // === Create final summary ===
        const finalStatus = 
          gitleaksSummary.status === 'FAIL' || trivySummary.status === 'FAIL' ? 'FAIL' :
          gitleaksSummary.status === 'ERROR' || trivySummary.status === 'ERROR' ? 'ERROR' :
          'PASS';

        const securitySummary = {
          repo: repoName,
          status: finalStatus,
          gitleaks: gitleaksSummary,
          trivy: trivySummary,
          scorecard: scorecardSummary,
          codeql: codeqlSummary,
          zizmor: zizmorSummary,
          recommendation: finalStatus === 'FAIL' ? 'Perbaiki vulnerability kritis sebelum deploy!' : 
                        finalStatus === 'NEEDS_REVIEW' ? 'Review findings di security-reports/' :
                        'Tidak ada masalah keamanan kritis.'
        };

        fs.writeFileSync(path.join(summaryDir, 'security-summary.json'), JSON.stringify(securitySummary, null, 2));

        const results = {
          repoPath: repoDir,
          repo: repoName,
          repoInfo: repoInfo,
          status: finalStatus,
          tools: { gitleaks: gitleaksSummary, trivy: trivySummary, scorecard: scorecardSummary, codeql: codeqlSummary, zizmor: zizmorSummary },
          recommendation: securitySummary.recommendation
        };

        // Get explanation from 9Router (hanya summary, bukan raw!)
        const explanation = await explainWith9Router(securitySummary);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ...results, explanation }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Import to folder
  if (req.url === '/api/security-import' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { repoPath } = JSON.parse(body);
        if (!repoPath || !fs.existsSync(repoPath)) {
          throw new Error('Repo not found');
        }
        
        const repoName = path.basename(repoPath);
        const targetPath = path.join('/Users/naufalrizky/projek ai', repoName);
        
        if (fs.existsSync(targetPath)) {
          execSync(`rm -rf "${targetPath}"`);
        }
        execSync(`mv "${repoPath}" "${targetPath}"`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, targetPath }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Abort - move to Projek Gajadi
  if (req.url === '/api/security-abort' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { repoPath } = JSON.parse(body);
        if (!repoPath || !fs.existsSync(repoPath)) {
          throw new Error('Repo not found');
        }
        
        const repoName = path.basename(repoPath);
        const targetPath = path.join(ABORT_DIR, repoName);
        
        if (fs.existsSync(targetPath)) {
          execSync(`rm -rf "${targetPath}"`);
        }
        execSync(`mv "${repoPath}" "${targetPath}"`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, targetPath }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Git history
  if (req.url === '/api/git-history' && req.method === 'GET') {
    try {
      const root = execSync('git rev-parse --show-toplevel', { cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (GIT_HISTORY_CACHE.data && Date.now() - GIT_HISTORY_CACHE.at < GIT_HISTORY_TTL) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(GIT_HISTORY_CACHE.data));
      }
      // Try pull first
      try { execSync('git pull --ff-only', { cwd: root, stdio: 'ignore', timeout: 15000 }); } catch {}
      
      // Detect which project(s) changed in this commit
      function detectProjects(filesChanged) {
        const projects = [];
        const known = {
          'server-monitor': 'Server Monitor',
          'sidomulyo-motor': 'Sidomulyo Motor',
          'sidomulyo-attendance': 'Sidomulyo Attendance',
          'tenggaong': 'Tenggaong Sport',
          'laundry': 'WashWallet'
        };
        for (const f of filesChanged) {
          for (const [prefix, name] of Object.entries(known)) {
            if (f.startsWith(prefix + '/') || f === prefix) {
              if (!projects.includes(name)) projects.push(name);
            }
          }
        }
        return projects.length ? projects : ['Lainnya'];
      }

      // Parse commits with date + project detection
      const log = execSync(
        `git log --max-count=10 --format="<<<%H||%ai||%s>>>" --stat`,
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();

      const totalCommits = execSync(
        `git rev-list --count HEAD`,
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();

      const commits = [];
      const blocks = log.split(/\n<<</).filter(b => b.trim());
      for (const block of blocks) {
        const lines = block.trim().split('\n');
        const headerLine = lines[0].replace(/^<<</, '').replace(/>>>$/, '').trim();
        const parts = headerLine.split('||');
        if (parts.length < 3) continue;
        const hash = parts[0].slice(0, 7);
        const date = parts[1].slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS
        const message = parts.slice(2).join('||');

        // Parse stat lines to get file paths and counts
        const filesChanged = [];
        for (let i = 1; i < lines.length; i++) {
          const l = lines[i];
          // Stat line:  path/to/file | N +/-...
          const statMatch = l.match(/^\s+(.+?)\s+\|\s+(\d+)/);
          if (statMatch) {
            filesChanged.push(statMatch[1].trim());
          }
          // Summary line: N files changed, ...
          const summaryMatch = l.match(/^ (\d+) file[s]? changed(?:, (\d+) insertion[s]?\(\+\))?(?:, (\d+) deletion[s]?\(-\))?/);
          if (summaryMatch) {
            const files = parseInt(summaryMatch[1]) || 0;
            const ins = parseInt(summaryMatch[2]) || 0;
            const del = parseInt(summaryMatch[3]) || 0;
            const projects = detectProjects(filesChanged);
            commits.push({ hash, date, message, files, insertions: ins, deletions: del, projects });
          }
        }
      }
      
      // Stats for the most recent commit (last push)
      const lastPushStats = commits.length > 0 ? commits[0] : { files: 0, insertions: 0, deletions: 0 };
      
      const result = {
        totalCommits: parseInt(totalCommits) || 0,
        lastCommit: commits[0] || null,
        lastPush: lastPushStats,
        recentCommits: commits.slice(0, 10)
      };
      
      GIT_HISTORY_CACHE.data = result;
      GIT_HISTORY_CACHE.at = Date.now();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // Serve static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(__dirname, filePath);
  
  // Security: prevent directory traversal
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext = path.extname(fullPath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  try {
    const content = await fs.promises.readFile(fullPath);
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(content);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 9000;

// Cache for git history — defined before createServer so handler can access it
const GIT_HISTORY_CACHE = { data: null, at: 0 };
const GIT_HISTORY_TTL = 60000; // 1 minute

server.listen(PORT, () => {
  console.log(`Dashboard running on http://localhost:${PORT}`);
});

// 9Router API helper
const ROUTER_API_KEY = 'sk-a25...d1d9';
const ROUTER_API_URL = 'http://localhost:20128/v1/chat/completions';

async function explainWith9Router(results) {
  const summary = JSON.stringify(results, null, 2).slice(0, 8000);
  const prompt = `Jelaskan hasil security scan ini dalam bahasa Indonesia yang mudah dipahami. Sertakan:
1. Ringkasan temuan setiap tool (Gitleaks, Trivy, Scorecard, CodeQL, zizmor)
2. Severity jika ada vulnerability
3. Rekomendasi jika ada issues

Hasil scan:
${summary}`;

  try {
    const resp = await fetch(ROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || 'Tidak ada penjelasan';
  } catch (e) {
    return 'Error: ' + e.message;
  }
}