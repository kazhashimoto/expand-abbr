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

const zero = (x) => new Array(x).fill(0);
const matrix = (x) => zero(x).map(() => zero(x));
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

function xrand(min, max, fn) {
  const range = max - min;
  let first = false;
  let n;
  let exclude;
  let result;

  if (typeof fn === 'function') {
    generator = fn;
    reset(range);
    first = true;
  }
  if (range !== history.range) {
    reset(range);
    first = true;
  }
  if (max <= min) {
    return min;
  }

  const pick = (v, ex) => {
    let k = 2 * (range + 1);
    while (ex.includes(v) && --k > 0) {
      v = _xrand(range);
    }
    return { value: v, found: k > 0 };
  };

  if (first) {
    first = false;
    const freq = zero(range + 1);
    for (let i = 0; i < 10; i++) {
      n = _xrand(range);
      freq[n]++;
    }
    exclude = indicesMax(freq);
    n = pick(_xrand(range), exclude).value;
  } else {
    n = _xrand(range);
  }

  n = pick(n, history).value;

  if (history.length > 1) {
    const seq = history.slice(-2);
    const last = seq[1];

    const maxFollowed = indicesMax(followedBy[last]);
    result = pick(n, maxFollowed);
    n = result.value;
    let tentative = undefined;
    if (result.found) {
      tentative = n;
    }

    exclude = indicesMax(frequency);
    exclude.push(last);
    if (last === seq[0] + 1) {
      exclude.push(last + 1);
    } else if (last === seq[0] - 1) {
      exclude.push(last - 1);
    }

    result = pick(n, exclude);
    n = result.value;
    if (!result.found && tentative) {
      n = tentative;
      if (n === last + 1 && last === seq[0] + 1) {
        n = pick(n, [last, last + 1]).value;
      } else if (n === last - 1 && last === seq[0] - 1) {
        n = pick(n, [last - 1, last]).value;
      } else if (n === last && last === seq[0]) {
        n = pick(n, [last]).value;
      }
    }
    followedBy[last][n]++;
  }

  history.push(n);
  frequency[n]++;
  if (history.length > 5) {
    history.shift();
  }
  return min + n;
}

module.exports.xrand = xrand;
