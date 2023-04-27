let generator = () => Math.random(); // default
let history = [];
history.range = 0;
let frequency = [];

const reset = (x) => {
  history = [];
  history.range = x;
  frequency = new Array(x + 1).fill(0);
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
    let top = Math.max(...frequency);
    const exclude = frequency
      .map((v, i) => (v === top ? i : -1))
      .filter((v) => v >= 0);
    const seq = history.slice(-2);
    exclude.push(seq[1]);
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
  frequency[n]++;
  if (history.length > 5) {
    history.shift();
  }
  return min + n;
};
