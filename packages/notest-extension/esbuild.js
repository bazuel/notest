const esbuild = require('esbuild');
const { exec } = require('child_process');
const sass = require('sass');
const postcss = require('postcss');
const fs = require('fs');
const chokidar = require('chokidar');

function getBuildOptions(more = {}) {
  const watch = process.argv.includes('-w');

  const options = {
    color: true,
    logLevel: 'error',
    outdir: 'dist',
    entryPoints: [
      'src/popup.ts',
      'src/page/monitor.ts',
      'src/chrome/monitor-embedder.ts',
      'src/chrome/background.ts',
      'src/chrome/channel-handler.ts'
    ],
    bundle: true,
    sourcemap: true
  };
  if (watch) {
    options.watch = {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error);
        else {
          console.log('watch build succeeded:', result);
        }

        exec('npm run copy-manifest');
      }
    };
  }
  return { ...options, ...more };
}

async function build(options) {
  await esbuild.build(getBuildOptions(options)).catch(() => process.exit(1));
}

const options = {
  target: ['esnext']
};

const prod = process.argv.includes('--prod');
if (prod) {
  console.log('Building for production');
  options.minify = true;
  fs.renameSync('src/environments/environment.ts', 'src/environments/environment.temp.ts');
  fs.copyFileSync('src/environments/environment.prod.ts', 'src/environments/environment.ts');
}

build(options).then(() => {
  if (prod) {
    fs.unlinkSync('src/environments/environment.ts');
    fs.renameSync('src/environments/environment.temp.ts', 'src/environments/environment.ts');
  }
});

function buildSCSS() {
  let result = sass.renderSync({
    file: 'src/assets/styles.scss',
    sourceMap: false,
    outputStyle: 'compressed'
  });
  console.log('SCSS compiled');

  let css = result.css.toString();

  fs.mkdirSync('dist/assets', { recursive: true });

  postcss([
    require('postcss-import'),
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-nested'),
    require('cssnano')
  ])
    .process(css, { from: 'src/assets/styles.scss', to: 'dist/assets/styles.css' })
    .then((result) => {
      fs.writeFileSync('dist/assets/styles.css', result.css, (err) => {
        if (err) throw err;
        console.log('CSS optimized');
      });
    });
}

// One-liner for current directory
chokidar.watch(['./src/**/*.scss', './src/**/*.html']).on('all', (event, path) => {
  console.log(event, path);
  buildSCSS();
  exec('npm run copy-files');
  exec('npm run copy-manifest');
});
buildSCSS();
