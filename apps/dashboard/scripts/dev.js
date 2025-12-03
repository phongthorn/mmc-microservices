const { spawnSync, spawn } = require('child_process');

// Get port
const portCmd = process.platform === 'win32' ? 'microfrontends.cmd' : 'microfrontends';
// We use shell: true to ensure it finds the command in the path (npm scripts path)
const portResult = spawnSync(portCmd, ['port'], { encoding: 'utf-8', shell: true });

if (portResult.error) {
    console.error('Failed to get port:', portResult.error);
    process.exit(1);
}

// stdout should contain the port. logs might be in stderr or mixed.
// We look for the last non-empty line which should be the port number.
const output = portResult.stdout.trim();
const lines = output.split('\n').map(l => l.trim()).filter(l => l);
const port = lines[lines.length - 1];

if (!port || isNaN(parseInt(port))) {
    console.error('Could not determine port from output:', portResult.stdout);
    console.error('Stderr:', portResult.stderr);
    process.exit(1);
}

console.log(`Starting Next.js on port ${port}...`);

const nextCmd = process.platform === 'win32' ? 'next.cmd' : 'next';
const devProcess = spawn(nextCmd, ['dev', '--port', port], { stdio: 'inherit', shell: true });

devProcess.on('close', (code) => {
    process.exit(code);
});
