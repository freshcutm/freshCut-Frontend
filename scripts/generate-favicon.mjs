import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import favicons from 'favicons';

const svgPath = resolve('public', 'freshcut.svg');
const outputDir = resolve('public');

const config = {
  appName: 'FreshCut',
  appShortName: 'FreshCut',
  appDescription: 'FreshCut branding',
  developerName: 'FreshCut',
  background: '#0f172a',
  theme_color: '#4f46e5',
  path: '/',
  icons: {
    android: false,
    appleIcon: false,
    appleStartup: false,
    coast: false,
    favicons: true,
    windows: false,
    yandex: false
  }
};

async function run() {
  try {
    const source = readFileSync(svgPath);
    const result = await favicons(source, config);
    for (const image of result.images) {
      writeFileSync(resolve(outputDir, image.name), image.contents);
    }
    console.log('Generados:', result.images.map(i => i.name).join(', '));
  } catch (err) {
    console.error('Error generando favicons:', err?.message || err);
    process.exit(1);
  }
}

run();