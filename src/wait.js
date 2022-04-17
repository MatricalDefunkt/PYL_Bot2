let wait = require("util").promisify(setTimeout);
let _wait = wait
wait = null
wait = function (time) {
  _wait(time);
};

module.exports = { wait }