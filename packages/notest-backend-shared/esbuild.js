const esbuild = require('esbuild');
const fs = require('fs');

function getBuildOptions(more = {}) {
  const watch = process.argv.includes('-w');

  const options = {
    color: true,
    logLevel: 'error',
    entryPoints: ['src/index.ts'],
    tsconfig: './tsconfig.json',
    external: ['postgres','aws-sdk','pixelmatch','playwright','pngjs','dayjs','ts-morph','dotenv'],
    bundle: true,
    sourcemap: true
  };
  if (watch) {
    options.watch = {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error);
        else console.log('watch build succeeded:', result);
      }
    };
  }
  return { ...options, ...more };
}

async function build(options) {
  await esbuild.build(getBuildOptions(options)).catch(() => process.exit(1));
}

const prod = process.argv.includes('--prod');
if (prod) {
  console.log('Building for production');
  fs.renameSync('src/environments/environment.ts', 'src/environments/environment.temp.ts');
  fs.copyFileSync('src/environments/environment.prod.ts', 'src/environments/environment.ts');
}

function rollbackEnvironments() {
  if (prod) {
    fs.unlinkSync('src/environments/environment.ts');
    fs.renameSync('src/environments/environment.temp.ts', 'src/environments/environment.ts');
  }
}

build({
  outfile: 'dist/index.js',
  platform: 'node'
}).then(() => rollbackEnvironments());
