module.exports = function(){
  const client = './src/';
	const clientApp = client + 'app/';
	const report = './report/';
  const build = './build/';
  const path = require('path');
  const clientDir = 'src';

  const config = {
    /*
		* FILE PATHS
		*/
    PATHS: {

      app: path.join(__dirname, clientDir),

      style: [
        path.join(__dirname, clientDir, 'styles/main')
      ],

      fonts: path.join(__dirname, clientDir, 'fonts'),

      tests: './src/index.spec.js',

      build: path.join(__dirname, 'build')
    },


    // Client folder contains all our code to run in browser
		client: client,
    clientApp: clientApp,

		report: report,
		// Folder where the production code will be put
		build: build,

    defaultPort: 8080,

    imageThresh: 10000,
    svgThresh: 3000,

  }

  return config;

}
