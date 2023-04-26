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
  let limit = range + 1;
  do {
    n = _xrand(range);
  } while (history.includes(n) && --limit > 0);

  if (history.length > 1) {
    const freq = Array.from({ length: range + 1 }, (v, i) => 0);
    for (const v of history) {
      freq[v]++;
    }
    const x = freq.indexOf(Math.max(...freq));
    const exclude = [x];
    const seq = history.slice(-2);
    if (seq[1] === seq[0] + 1) {
      exclude.push(seq[1] + 1, ...seq);
    } else if (seq[1] === seq[0] - 1) {
      exclude.push(seq[1] - 1, ...seq);
    } else if (seq[0] === seq[1]) {
      exclude.push(seq[0]);
    }
    limit = range + 1;
    while (exclude.includes(n) && limit-- > 0) {
      n = _xrand(range);
    }
  }

  history.push(n);
  if (history.length > 5) {
    history.shift();
  }
  return min + n;
};
