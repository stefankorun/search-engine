var mongoProcess;

(function init() {
  var exec = require('child_process').exec;
  console.log('Starting MongoDB server');

  mongoProcess = exec('cd .. & mongod --config mongod.conf',
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    }
  );
}());
