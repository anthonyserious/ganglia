var fs = require('fs');

// Simple pid file manager
var pidManager = (function() {
  var _path = "";
  return {
    removePidFile: function() {
      try {
        fs.unlinkSync(_path);
        return true;
      } catch (err) {
        return false;
      }
    },
    createPidFile: function(path, force) {
      _path = path;
      var pid = new Buffer(process.pid + '\n');
      var fd = fs.openSync(_path, force ? 'w' : 'wx');
      var offset = 0;

      while (offset < pid.length) {
          offset += fs.writeSync(fd, pid, offset, pid.length - offset);
      }
      fs.closeSync(fd);
    }
  }
})();

module.exports = pidManager;

