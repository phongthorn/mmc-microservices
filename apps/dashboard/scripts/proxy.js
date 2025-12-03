const { spawn } = require('child_process');

const proxyCmd = process.platform === 'win32' ? 'microfrontends.cmd' : 'microfrontends';

console.log(`Starting Microfrontends Proxy...`);

const proxyProcess = spawn(proxyCmd, ['proxy'], { stdio: 'inherit', shell: true });

proxyProcess.on('close', (code) => {
    process.exit(code);
});
