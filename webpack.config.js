const CopyPlugin = require('copy-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const {version} = require('./package.json');

const DIST_ROOT = __dirname + '/dist';

module.exports = (env) => {
  const browser = env['BROWSER'];
  if (!browser) {
    throw new Error('Please specify the target browser via the BROWSER environment variable');
  }

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
