const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Options for the webpack-dev-server
exports.devServer = function(options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn't set
      // HotModuleReplacementPlugin!
      hot: true,
      inline: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // If you use Vagrant or Cloud9, set
      // host: options.host || '0.0.0.0';
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: options.host, // Defaults to `localhost`
      port: options.port // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        multiStep: true
      })
    ]
  };
}

// Pull all css into a bundle with the JS, including source maps
exports.setupCSS = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.(scss|css)$/,
          loader: 'style!css!sass',
          include: paths
        }
      ]
    }
  };
}

// Minify JS
exports.minifyJS = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        // Don't beautify output (enable for neater output)
        beautify: false,
        // Eliminate comments
        comments: false,
         // Compression specific options
        compress: {
          warnings: false,
          // Drop `console` statements
          drop_console: true
        },
        // Mangling specific options
        mangle: {
          // Don't mangle $
          except: ['$', 'webpackJsonp'],

          // Don't care about IE8
          screw_ie8 : true,

          // Don't mangle function names
          keep_fnames: false
        }
      })
    ]
  };
}

// Set variables (such as NODE_ENV) to chosen value
exports.setFreeVariable = function(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  };
}

// Pull manifest into seperate bundle. Also create new bundles based on options
exports.extractBundle = function(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    // Define an entry point needed for splitting.
    entry: entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest']
      })
    ]
  };
}

// remove files from specified path
exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        // Without `root` CleanWebpackPlugin won't point to our
        // project and will fail to work.
        root: process.cwd()
      })
    ]
  };
}

// put all css from path into a css file. HTML plugin will add link tag
exports.extractCSS = function(paths) {
  return {
    module: {
      loaders: [
        // Extract CSS during build
        {
          test: /\.(scss|css)$/,
          loader: ExtractTextPlugin.extract('style', 'css?minimize!autoprefixer!sass'),
          include: paths
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('css/[name].[chunkhash].css'),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: {removeAll: true } },
        canPrint: true
      })
    ]
  };
}

// Remove redundant css
exports.purifyCSS = function(paths) {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        // `paths` is used to point PurifyCSS to files not
        // visible to Webpack. You can pass glob patterns
        // to it.
        paths: paths
      }),
    ]
  }
}

// Pull all images from path into bundle if under the size specified
// or pull into build folder if larger after compressing the images
exports.setupImages = function(paths, size) {
  return {
    module: {
      loaders: [
        {
          test: /\.(jpg|png)$/,
          loader: 'url?limit='+size+'!image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false',
          include: paths
        }
      ]
    }
  };
}


// Pull all SVG files from specified path into the build folder
exports.setupSVG = function(paths, size) {
  return {
    module: {
      loaders: [
        {
          test: /\.svg$/,
          loader: 'svg-url?limit='+size+'!image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false',
          include: paths
        }
      ]
    }
  };
}

// Add browsersync support
exports.browserSync = function(port) {
  return {
    plugins: [
      new BrowserSyncPlugin(
        //BrowserSync options
        {
            // browse to http://localhost:3000/ during development
            host: 'localhost',
            port: 3000,
            // proxy the Webpack Dev Server endpoint
            // (which should be serving on http://localhost:8080/)
            // through BrowserSync
            proxy: 'http://localhost:'+port
        },
        // plugin options
        {
            // prevent BrowserSync from reloading the page
            // and let Webpack Dev Server take care of this
            reload: false
        }
      ),
    ]
  }
}

// Add an html template to add css and js to then place in build folder
exports.addHtml = function(name, template) {
  return {
    plugins: [
      new HtmlWebpackPlugin({  // Also generate a test.html
        filename: name+'.html',
        template: template,
        minify: {
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true
        }
      })
    ]
  }
}

// Add an html template to add css and js to then place in build folder
exports.addHtmlNoTemplate = function(name) {
  return {
    plugins: [
      new HtmlWebpackPlugin({  // Also generate a test.html
        filename: name+'.html',
        minify: {
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true
        }
      })
    ]
  }
}

// Pull the common chunks out into a single file
exports.commonChunks = function() {
  return {
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      })
    ]
  }
}

// Compress imgs to be used in production
exports.compressImg = function() {
  return {
    module: {
      loaders: [
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
              'file?hash=sha512&digest=hex&name=[hash].[ext]',
              'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
          ]
        }
      ]
    }
  };
}

// set another entry
exports.setEntry = function(path) {
  return {
    entry: path
  };
}


