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
const upper = () => {
  const sum = (p, c) => p + c;
  let s = frequency.reduce(sum);
  if (!s) {
    return 0;
  }
  const m = (frequency.length - 1) / 2;
  let fn = (p, c, i) => (i > m ? p + c : i === m ? c / 2 : p);
  let u = frequency.reduce(fn, 0);
  return u / s;
};

function _xrand(max) {
  const arr = Array.from({ length: max + 1 }, (v, i) => ({
    idx: i,
    val: generator(),
  }));
  arr.sort((a, b) => a.val - b.val);
  return arr[0].idx;
}

function _xrand_proc(min, max, fn) {
  const range = max - min;
  let n;
  let exclude;
  let result;

  const pick = (v, ex) => {
    let k = 2 * (range + 1);
    while (ex.includes(v) && --k > 0) {
      v = _xrand(range);
    }
    return { value: v, found: k > 0 };
  };

  if (history.length) {
    n = _xrand(range);
  } else {
    const freq = zero(range + 1);
    for (let i = 0; i < 10; i++) {
      n = _xrand(range);
      freq[n]++;
    }
    exclude = indicesMax(freq);
    n = pick(_xrand(range), exclude).value;
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
      exclude = undefined;
      if (n === last + 1 && last === seq[0] + 1) {
        exclude = [last, last + 1];
      } else if (n === last - 1 && last === seq[0] - 1) {
        exclude = [last - 1, last];
      } else if (n === last && last === seq[0]) {
        exclude = [last];
      }
      if (exclude) {
        n = pick(n, exclude).value;
        if (upper() > 0.5) {
          exclude = [Math.ceil(range / 2), range];
        } else {
          exclude = [0, Math.floor(range / 2)];
        }
        n = pick(n, exclude).value;
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

function _xrand_init(min, max, fn) {
  const range = max - min;
  if (typeof fn === 'function') {
    generator = fn;
  }
  reset(range);
}

function xrand(min, max, fn) {
  const range = max - min;
  const prev_range = history.range;

  if (typeof fn === 'function' || range !== history.range) {
    _xrand_init(min, max, fn);
  }
  if (max <= min) {
    return min;
  }

  if (range !== prev_range) {
    for (let i = 0; i < 20; i++) {
      _xrand_proc(min, max);
    }
  }
  return _xrand_proc(min, max);
}

module.exports.xrand = xrand;
