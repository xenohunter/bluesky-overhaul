const fs = require('fs');
const glob = require('glob');
const CopyPlugin = require('copy-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const {version} = require('./package.json');

const SOURCE_ROOT = __dirname + '/src';
const DIST_ROOT = __dirname + '/dist';

const CONTENT_DIR_NAME = 'content';
const POPUP_DIR_NAME = 'popup';

const CHROME_MANIFEST_VERSION = 3;
const FIREFOX_MANIFEST_VERSION = 2;

const DEV_MODE = 'development';
const PROD_MODE = 'production';
const CHROME_BROWSER = 'chrome';
const FIREFOX_BROWSER = 'firefox';

const checkForTodo = (pattern) => {
  for (const file of glob.sync(pattern, {nodir: true})) {
    const contents = fs.readFileSync(file, 'utf8');
    const index = contents.indexOf('TODO!');
    if (index !== -1) {
      const line = contents.slice(0, index).split('\n').length;
      throw new Error(`File ${file} contains a TODO! string at line ${line}`);
    }
  }
};

module.exports = (env) => {
  const mode = env['MODE'];
  if (!mode) {
    throw new Error('Please specify the build mode via the MODE environment variable');
  } else if (![DEV_MODE, PROD_MODE].includes(mode)) {
    throw new Error(`Unknown build mode: ${mode}`);
  }

  const browser = env['BROWSER'];
  if (!browser) {
    throw new Error('Please specify the target browser via the BROWSER environment variable');
  } else if ([CHROME_BROWSER, FIREFOX_BROWSER].indexOf(browser) === -1) {
    throw new Error(`Unknown target browser: ${browser}`);
  }

  console.log(`Building for ${browser} in ${mode} mode...`);

  if (mode === PROD_MODE) checkForTodo(`${SOURCE_ROOT}/**/*`);

  const targetDir = `${DIST_ROOT}/${browser}`;
  const zipFilename = `bluesky-overhaul-${version}-${browser}.zip`;
  const manifestVersion = (browser === CHROME_BROWSER) ? CHROME_MANIFEST_VERSION : FIREFOX_MANIFEST_VERSION;

  const DEV_MODE_PARAMS = {
    devtool: 'source-map',
    optimization: {
      minimize: false
    }
  };

  const PROD_MODE_PLUGINS = [
    new ZipPlugin({
      path: DIST_ROOT,
      filename: zipFilename
    })
  ];

  return {
    mode: mode,

    ...(mode === DEV_MODE ? DEV_MODE_PARAMS : {}),

    entry: {
      content: `${SOURCE_ROOT}/${CONTENT_DIR_NAME}/main.ts`,
      popup: `${SOURCE_ROOT}/${POPUP_DIR_NAME}/main.tsx`
    },

    output: {
      filename: '[name]/main.js',
      path: targetDir
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
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
              content = content.toString().replace(/__CONTENT_DIR_NAME__/g, CONTENT_DIR_NAME);
              content = content.toString().replace(/__POPUP_DIR_NAME__/g, POPUP_DIR_NAME);
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
            from: `${POPUP_DIR_NAME}/*`,
            to: `${POPUP_DIR_NAME}/[name][ext]`,
            transform(content, path) {
              if (path.endsWith('.html')) {
                content = content.toString().replace(/__BLUESKY_OVERHAUL_VERSION__/g, version);
              }
              return content;
            }
          },
          {
            from: 'node_modules/bootstrap/dist/css/bootstrap.css',
            to: `${POPUP_DIR_NAME}/bootstrap.css`
          },
          {
            from: 'node_modules/awesome-notifications/dist/style.css',
            to: `${CONTENT_DIR_NAME}/awesome-notifications-style.css`
          },
          {
            from: 'styles/*.css',
            to: `${CONTENT_DIR_NAME}/bluesky-overhaul.css`,
            transformAll(assets) {
              return assets.reduce((accumulator, asset) => `${accumulator}${asset.data}\n`, "");
            }
          }
        ]
      }),

      ...(mode === PROD_MODE ? PROD_MODE_PLUGINS : [])
    ]
  };
};
