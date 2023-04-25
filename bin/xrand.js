let generator = () => Math.random(); // default
let history = [];
history.range = 0;

const reset = (x) => {
  history = [];
  history.range = x;
};

function _xrand(max) {
  const arr = Array.from({ length: max + 1 }, (v, i) => {
    return { idx: i, val: generator() };
  });
  arr.sort((a, b) => a.val - b.val);
  return arr[0].idx;
}

module.exports.xrand = function (min, max, fn) {
  const range = max - min;
  if (typeof fn === 'function') {
    generator = fn;
    reset(range);
  }
  if (range !== history.range) {
    reset(range);
  }
  if (max <= min) {
    return min;
  }
  let n;
  let limit = Math.min(5, range + 1);
  do {
    n = _xrand(range);
  } while (history.includes(n) && --limit > 0);

  history.push(n);
  if (history.length > 5) {
    history.shift();
  }
  return min + n;
};
