const fs = require('fs');
const glob = require('glob');
const CopyPlugin = require('copy-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const {version} = require('./package.json');

const SOURCE_ROOT = __dirname + '/src';
const PAGES_ROOT = __dirname + '/pages';
const DIST_ROOT = __dirname + '/dist';

const CHROME_MANIFEST_VERSION = 3;
const FIREFOX_MANIFEST_VERSION = 2;

const checkForTodo = (pattern) => {
  const files = glob.sync(pattern, {nodir: true});

  for (const file of files) {
    const contents = fs.readFileSync(file, 'utf8');
    const index = contents.indexOf('TODO!');
    if (index !== -1) {
      const line = contents.slice(0, index).split('\n').length;
      throw new Error(`File ${file} contains a TODO! string at line ${line}`);
    }
  }

  console.log(`No TODO! found for pattern ${pattern}`);
};

module.exports = (env) => {
  const mode = env['MODE'];
  if (!mode) {
    throw new Error('Please specify the build mode via the MODE environment variable');
  } else if (['development', 'production'].indexOf(mode) === -1) {
    throw new Error(`Unknown build mode: ${mode}`);
  }

  const browser = env['BROWSER'];
  if (!browser) {
    throw new Error('Please specify the target browser via the BROWSER environment variable');
  } else if (['chrome', 'firefox'].indexOf(browser) === -1) {
    throw new Error(`Unknown target browser: ${browser}`);
  }

  console.log(`Building for ${browser} in ${mode} mode...`);

  if (mode === 'production') {
    checkForTodo(`${SOURCE_ROOT}/**/*`);
    checkForTodo(`${PAGES_ROOT}/**/*`);
  }

  const targetDir = `${DIST_ROOT}/${browser}`;
  const zipFilename = `bluesky-overhaul-${version}-${browser}.zip`;
  const manifestVersion = (browser === 'chrome') ? CHROME_MANIFEST_VERSION : FIREFOX_MANIFEST_VERSION;

  return {
    mode: mode,
    ...(mode === 'development' ? {
      devtool: 'source-map',
      optimization: {
        minimize: false
      }
    } : {}),

    entry: './src/content.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
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
              if (manifestVersion === FIREFOX_MANIFEST_VERSION) {
                content = content.toString().replace(/"action"/g, '"browser_action"');
              }
              return content;
            }
          },
          {
            from: 'icons/*',
            to: 'icons/[name][ext]'
          },
          {
            from: 'pages/*',
            to: 'pages/[name][ext]',
            transform(content, path) {
              if (path.endsWith('.html')) {
                content = content.toString().replace(/__BLUESKY_OVERHAUL_VERSION__/g, version);
              }
              return content;
            }
          },
          {
            from: 'node_modules/bootstrap/dist/css/bootstrap.css',
            to: 'pages/bootstrap.css'
          },
          {
            from: 'node_modules/awesome-notifications/dist/style.css',
            to: 'awesome-notifications-style.css',
          },
          {
            from: 'styles/*.css',
            to: 'bluesky-overhaul.css',
            transformAll(assets) {
              return assets.reduce((accumulator, asset) => `${accumulator}${asset.data}\n`, "");
            }
          }
        ]
      }),

      ...(mode === 'production' ? [
        new ZipPlugin({
          path: DIST_ROOT,
          filename: zipFilename
        })
      ] : [])
    ]
  };
};
