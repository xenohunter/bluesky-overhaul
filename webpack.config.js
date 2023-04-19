const fs = require('fs');
const glob = require('glob');
const CopyPlugin = require('copy-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const {version} = require('./package.json');

const SOURCE_ROOT = __dirname + '/src';
const DIST_ROOT = __dirname + '/dist';

const checkForTodo = () => {
  const pattern = `${SOURCE_ROOT}/**/*.js`;
  const files = glob.sync(pattern);

  for (const file of files) {
    const contents = fs.readFileSync(file, 'utf8');
    const index = contents.indexOf('TODO!');
    if (index !== -1) {
      const line = contents.slice(0, index).split('\n').length;
      throw new Error(`File ${file} contains a TODO! string at line ${line}`);
    }
  }

  console.log('No TODO! strings found');
};

module.exports = (env) => {
  const browser = env['BROWSER'];
  if (!browser) {
    throw new Error('Please specify the target browser via the BROWSER environment variable');
  }

  checkForTodo();

  const targetDir = `${DIST_ROOT}/${browser}`;
  const zipFilename = `bluesky-overhaul-${version}-${browser}.zip`;
  const manifestVersion = (browser === 'chrome') ? 3 : 2;

  return {
    entry: './src/content.js',
    mode: 'development',
    devtool: 'source-map',
    output: {
      path: targetDir,
      filename: 'bundle.js'
    },

    plugins: [
      new RemovePlugin({
        before: {
          include: [
            targetDir,
            `${DIST_ROOT}/${zipFilename}`
          ]
        }
      }),

      new CopyPlugin({
        patterns: [
          {
            from: 'manifest.json',
            to: 'manifest.json',
            transform(content) {
              content = content.toString().replace(/"__MANIFEST_VERSION__"/g, manifestVersion.toString());
              content = content.toString().replace(/"__PACKAGE_VERSION__"/g, `"${version}"`);
              return content;
            }
          },
          {
            from: 'icons/*',
            to: 'icons/[name][ext]'
          }
        ]
      }),

      new ZipPlugin({
        path: DIST_ROOT,
        filename: zipFilename
      })
    ]
  };
};
