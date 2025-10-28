const { execSync } = require('child_process');
const { renameSync, mkdirSync } = require('fs');
const { join } = require('path');

// build sidecar using @yao-pkg/pkg
execSync('npx -y @yao-pkg/pkg packages/bridge/dist/cli.js --out-path dist --targets host', { stdio: 'inherit' });
// determine target triple from rustc
const rustc = execSync('rustc -vV', { encoding: 'utf8' });
const triple = /host:\s+(\S+)/.exec(rustc)[1];
mkdirSync('src-tauri/binaries', { recursive: true });
const ext = process.platform === 'win32' ? '.exe' : '';
const from = join('dist', `cli${ext}`);
const to = join('src-tauri', 'binaries', `continue-bridge-${triple}${ext}`);
renameSync(from, to);
console.log('✅ Sidecar ready:', to);