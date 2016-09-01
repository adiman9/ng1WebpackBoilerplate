// require in any test helpers that may be needed


// require all modules ending in "spec" from the
// current directory and all subdirectories
var testsContext = require.context('.', true, /spec$/);
testsContext.keys().forEach(testsContext);
