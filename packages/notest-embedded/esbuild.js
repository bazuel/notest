const esbuild = require('esbuild');

const watch = process.argv.includes('-w');

function getBuildOptions(more = {}) {
  const options = {
    color: true,
    logLevel: 'error',
    entryPoints: ['src/index.ts'],
    tsconfig: './tsconfig.json',
    bundle: true,
    sourcemap: true
  };
  return { ...options, ...more };
}

async function build(options) {
  const ctx = await esbuild.context(getBuildOptions(options));
  if (watch) {
    await ctx.watch().then(() => console.log('watching...'));
  } else {
    await ctx.build().then(() => console.log('build done'));
  }
}

build({
  outfile: 'dist/index.js',
  platform: 'node'
});
