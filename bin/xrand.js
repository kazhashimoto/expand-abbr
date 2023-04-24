const history = [];
let generator = () => 0; // default

function _xrand(max) {
  let length = max + 1;
  const arr = [];
  for (let i = 0; i < length; i++) {
    const x = generator();
    arr.push({ idx: i, val: x });
  }
  arr.sort((a, b) => a.val - b.val);
  return arr[0].idx;
}

module.exports.xrand = function (min, max, fn) {
  if (typeof fn === 'function') {
    generator = fn;
  }
  if (max <= min) {
    return min;
  }
  let n;
  let limit = 10;
  do {
    n = _xrand(max - min);
  } while (history.includes(n) && --limit > 0);

  history.push(n);
  if (history.length > 5) {
    history.shift();
  }
  return min + n;
};
