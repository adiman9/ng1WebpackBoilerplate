# webpackBoilerplate
This is the boilerplate setup I use when starting a new project. It uses Webpack as the bundler and Karma as the test runner. Mocha is used for testing, helped along by Chai and Sinon.

The boilerplate is suited to be used with any kind of project, although in it's default state it contains AngularJS and Angular-Mocks as dependencies in the package.json. Therefore it is best suited to be used for Angular projects straight out of the box.

However, it is as simple as ```npm unistall --save angular ``` and ```npm uninstall --save-dev angular-mocks``` to get rid of those dependencies. 

You are then free to npm install any dependencies of your choosing. ```npm install --save react``` for example.
