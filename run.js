import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('======================================================');
console.log('🚀 Starting Student Management System (Full-Stack)');
console.log('======================================================');
console.log('📦 Backend:  http://localhost:5000');
console.log('🌐 Frontend: http://localhost:5173');
console.log('🍃 MongoDB:  mongodb://127.0.0.1:27017/student_manage_sys');
console.log('======================================================\n');

// 1. Spawn Backend
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('[Backend Process Error]:', err);
});

// 2. Spawn Frontend
const viteCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const frontend = spawn(viteCmd, ['vite'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

frontend.on('error', (err) => {
  console.error('[Frontend Process Error]:', err);
});

const cleanup = () => {
  console.log('\nShutting down servers...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
