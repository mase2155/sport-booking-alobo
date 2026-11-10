/* eslint-disable no-console -- CLI */
/**
 * Giải phóng cổng trên Windows (Node.js đang LISTEN) trước khi npm run dev.
 * Usage: node scripts/free-port.js 5000
 */
const { execSync } = require('child_process');

const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Cổng không hợp lệ. Ví dụ: node scripts/free-port.js 5000');
  process.exit(1);
}

function runPowerShell(script) {
  return execSync(`powershell -NoProfile -Command "${script.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function freePortOnWindows() {
  let pids = [];
  try {
    const out = runPowerShell(
      `(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess) -join ' '`,
    );
    pids = [...new Set(out.split(/\s+/).map((x) => Number(x)).filter((n) => n > 0 && n !== process.pid))];
  } catch {
    return;
  }

  if (pids.length === 0) {
    return;
  }

  for (const pid of pids) {
    try {
      const name = runPowerShell(
        `(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).ProcessName`,
      ).toLowerCase();
      if (name !== 'node' && name !== 'node.exe') {
        console.warn(
          `Cổng ${port} đang bị PID ${pid} (${name}) — không tự tắt. Tắt thủ công hoặc đổi PORT trong .env.`,
        );
        continue;
      }
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Đã giải phóng cổng ${port} (Node PID ${pid}).`);
    } catch {
      /* process đã thoát */
    }
  }
}

if (process.platform === 'win32') {
  freePortOnWindows();
} else {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' }).trim();
    const pids = out.split('\n').filter(Boolean);
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGTERM');
        console.log(`Đã giải phóng cổng ${port} (PID ${pid}).`);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* port free */
  }
}
