const path = require('path');
const webpack = require('webpack');
const defaultConfig = require('./config.js')();

/*
* function to allow merging of config. Used to separate common
* config from build and dev config options then merge them into
* a single config as needed for the environment
*/
const merge = require('webpack-merge');
// To catch webpack config validation errors
const validate = require('webpack-validator');
// linting css
const stylelint = require('stylelint');
const sasslint = require('stylelint-config-sass-guidelines');
// import modules of webpack functionality
const parts = require('./webpack.helper');
// get all deps from package.json
const pkg = require('./package.json');


// Common parts of the config
const common = {

  context: __dirname,

  target: 'web',
  // Entry points taken from the PATH object above
  // entry: {
  //   style: defaultConfig.PATHS.style,
  //   app: defaultConfig.PATHS.app,
  //   // Add all the dependencies from package.json (will only work without a backend in the app)
  //   vendor: Object.keys(pkg.dependencies)
  // },
  output: {
    path: defaultConfig.PATHS.build,
    filename: 'js/[name].js'
  },
  module: {
    preLoaders: [
      // Lint all JS with eslint
      {
        test: /\.(js|es6|jsx)$/,
        loaders: ['eslint'],
        include: defaultConfig.PATHS.app
      },
      // lint css
      {
        test: /\.css$/,
        loaders: ['postcss'],
        include: defaultConfig.PATHS.app
      },
    ],
    loaders: [
      // allow use of ES6 features and JSX syntax
      {
        test: /\.(js|es6|jsx)$/,
        // Enable caching for improved performance during development
        // It uses default OS directory by default. If you need
        // something more custom, pass a path to it.
        // I.e., babel?cacheDirectory=<path>
        loaders: ['babel?cacheDirectory'],
        // Parse only app files! Without this it will go through
        // the entire project. In addition to being slow,
        // that will most likely result in an error.
        include: defaultConfig.PATHS.app
      },
      {
        test: /\.woff$/,
        // Inline small woff files and output them below font/.
        // Set mimetype just in case.
        loader: 'url',
        query: {
          name: 'font/[hash].[ext]',
          limit: 5000,
          mimetype: 'application/font-woff'
        },
        include: defaultConfig.PATHS.fonts
      },
      {
        test: /\.ttf$|\.eot$/,
        loader: 'file',
        query: {
          name: 'font/[hash].[ext]'
        },
        include: defaultConfig.PATHS.fonts
      },
      {
        test: /\.html$/,
        exclude: path.join(__dirname, defaultConfig.client + 'index.html'),
        loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname)) + '/src/!html',
        include: defaultConfig.PATHS.app
      }
    ]
  },
  // Function used to lint css.
  postcss: function () {
    return [
      stylelint(sasslint)
    ];
  },
  plugins: [],
  externals: {
    // declare any libs that are using CDNs instead
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.es6', '.scss', '.html', '.css']
  }
};

var config;

// Run the production ready config to the build
if(process.env.npm_lifecycle_event === 'build' || process.env.npm_lifecycle_event === 'start') {

    config = merge(
      common,
      {
        entry: {
          style: defaultConfig.PATHS.style,
          app: defaultConfig.PATHS.app,
          // Add all the dependencies from package.json (will only work without a backend in the app)
          vendor: Object.keys(pkg.dependencies)
        },
        // Make separate high quality source map files
        devtool: 'source-map',
        output: {
          path: defaultConfig.PATHS.build,
          filename: 'js/[name].[chunkhash].js',
          // This is used for require.ensure. The setup
          // will work without but this is useful to set.
          chunkFilename: 'js/[chunkhash].js'
        },
        plugins: [
          new webpack.optimize.DedupePlugin()
        ]
      },
      parts.commonChunks(),
      parts.addHtml('index', defaultConfig.client + 'index.html'),
      // Delete build directory ready for the new build
      parts.clean(defaultConfig.PATHS.build),
      // Set node environment to production
      // This can be used
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      // Extract out individual libraries into the vendor file only
      // Not currently using as the commons bundle is added to the common
      // Section as it is needed in dev as well as build
      // parts.extractBundle({
      //   name: 'vendor',
      //   entries: Object.keys(pkg.dependencies)
      // }),
      parts.minifyJS(),
      // Remove any redundant css
      parts.purifyCSS([defaultConfig.PATHS.app]),
      // Pull css out into it's own file and add link tag
      parts.extractCSS(defaultConfig.PATHS.style),
      // Put images into the bundle if under 25kb or put into build folder otherwise
      parts.setupImages(defaultConfig.PATHS.images, defaultConfig.imageThresh),
      // Pull SVG into the build folder
      parts.setupSVG(defaultConfig.PATHS.images, defaultConfig.svgThresh),
      parts.browserSync(defaultConfig.defaultPort)
    );

}else if(process.env.npm_lifecycle_event === 'test'){
  // Test config for phantomJS

  config = merge(
    common,
    parts.setEntry(defaultConfig.PATHS.tests),
    {
      plugins: []
    }
  );

}else if(process.env.npm_lifecycle_event === 'test:browser'){
  // Testing in the browser

  config = merge(
    common,
    parts.setEntry('mocha!' + defaultConfig.PATHS.tests),
    // additional configs for browser testing
    parts.devServer({
      // Customize host/port here if needed
      host: 'localhost',
      port: defaultConfig.defaultPort
    }),
    parts.addHtmlNoTemplate('index'),
    parts.browserSync(defaultConfig.defaultPort)

  );

}else{
    // Dev config

    config = merge(
      common,
      {
        entry: {
          style: defaultConfig.PATHS.style,
          app: defaultConfig.PATHS.app,
          // Add all the dependencies from package.json (will only work without a backend in the app)
          vendor: Object.keys(pkg.dependencies)
        }
      },
      parts.setupCSS(defaultConfig.PATHS.style),
      {
        // bundle source map in with JS
        devtool: 'eval-source-map'
      },
      parts.devServer({
        // Customize host/port here if needed
        host: 'localhost',
        port: defaultConfig.defaultPort
      }),
      parts.addHtml('index', defaultConfig.client + 'index.html'),
      // set up images
      parts.setupImages(defaultConfig.PATHS.images, defaultConfig.imageThresh),
      // Set up SVG into build folder
      parts.setupSVG(defaultConfig.PATHS.images),
      // parts.addHtml('testnumber2', 'src/blah.html'),
      parts.browserSync(defaultConfig.defaultPort)
    );

}

// Run validator in quiet mode to avoid output in stats
module.exports = validate(config, {
  quiet: true
});
