const { spawn, exec } = require('child_process');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log("========================================");
console.log("   Starting ConnectSphere Application   ");
console.log("========================================");

// Start Server (which serves frontend)
const server = spawn(npmCmd, ['start'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
});

server.on('error', (err) => {
    console.error('Failed to start server:', err);
});

// Open Browser after a short delay
setTimeout(() => {
    console.log("Opening browser...");
    const startCmd = isWin ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    exec(`${startCmd} http://localhost:3001`);
}, 3000);
