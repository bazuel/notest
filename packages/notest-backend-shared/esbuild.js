const esbuild = require('esbuild');

function getBuildOptions(more = {}) {
  const watch = process.argv.includes('-w');

  const options = {
    color: true,
    logLevel: 'error',
    entryPoints: ['src/index.ts'],
    tsconfig: './tsconfig.json',
    external: [
      'postgres',
      'aws-sdk',
      'pixelmatch',
      'playwright',
      'pngjs',
      'dayjs',
      'ts-morph',
      'dotenv'
    ],
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

build({
  outfile: 'dist/index.js',
  platform: 'node'
});
