const wait = require("util").promisify(setTimeout);

const _wait = function (time) {
  wait(time);
};
export { _wait as wait };
