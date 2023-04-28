let generator = () => Math.random(); // default
let history = [];
history.range = 0;
let frequency = [];
let followedBy = [];

const reset = (x) => {
  history = [];
  history.range = x;
  frequency = new Array(x + 1).fill(0);
  followedBy = matrix(x + 1);
};

const empty = (x) => new Array(x).fill(0);
const matrix = (x) => empty(x).map((v) => empty(x));
const indicesMax = (arr) => {
  const top = Math.max(...arr);
  if (top > 0) {
    arr = arr.map((v, i) => (v === top ? i : -1)).filter((v) => v >= 0);
    return arr;
  }
  return [];
};

function _xrand(max) {
  const arr = Array.from({ length: max + 1 }, (v, i) => ({
    idx: i,
    val: generator(),
  }));
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
  limit *= 2;
  do {
    n = _xrand(range);
  } while (history.includes(n) && --limit > 0);

  if (history.length > 1) {
    const exclude = indicesMax(frequency);
    const seq = history.slice(-2);
    const last = seq[1];
    exclude.push(last);
    const maxFollowed = indicesMax(followedBy[last]);
    limit = range + 1;
    limit *= 2;
    while (maxFollowed.includes(n) && limit-- > 0) {
      n = _xrand(range);
    }
    let tentative = undefined;
    if (limit) {
      tentative = n;
    }

    if (last === seq[0] + 1) {
      exclude.push(last + 1, ...seq);
    } else if (last === seq[0] - 1) {
      exclude.push(last - 1, ...seq);
    } else if (seq[0] === last) {
      exclude.push(seq[0]);
    }

    limit = range + 1;
    limit *= 2;
    while (exclude.includes(n) && limit-- > 0) {
      n = _xrand(range);
    }

    if (!limit && tentative) {
      n = tentative;
    }

    followedBy[last][n]++;
  }

  history.push(n);
  frequency[n]++;
  if (history.length > 5) {
    history.shift();
  }
  return min + n;
};
