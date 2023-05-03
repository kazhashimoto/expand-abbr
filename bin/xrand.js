let generator = () => Math.random(); // default
let history = [];
history.range = 0;
const MAX_HIST = 50;
const RECENT_LEN = 5;
let frequency = [];
let distance = [];
const MAX_DISTANCE = 5;

const reset = (x) => {
  history = [];
  history.range = x;
  frequency = zero(x + 1);
  distance = zero(MAX_DISTANCE).map(() => matrix(x + 1));
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

  const pick = (v, ex) => {
    let k = 2 * (range + 1);
    let n = v;
    while (ex.includes(v) && --k > 0) {
      v = _xrand(range);
    }
    let found = k > 0;
    if (!found) {
      v = n;
    }
    return { value: v, found: found };
  };

  const p_upper = () => {
    let arr = undefined;
    if (upper() > 0.5) {
      arr = [Math.ceil(range / 2), range];
    } else {
      arr = [0, Math.floor(range / 2)];
    }
    return arr;
  };

  const p_consecutive = (x) => {
    const seq = history.slice(-2);
    const last = seq[1];
    let arr = undefined;
    if (x === last + 1 && last === seq[0] + 1) {
      arr = [last, last + 1];
    } else if (x === last - 1 && last === seq[0] - 1) {
      arr = [last - 1, last];
    } else if (x === last && last === seq[0]) {
      arr = [last];
    }
    return arr;
  };

  const p_maxfreq = () => indicesMax(frequency);
  const p_recent = () => indicesMax(history.slice(-RECENT_LEN));
  const p_equal = () => [history[history.length - 1]];

  const p_zigzag = () =>
    history.length > 1 ? [history[history.length - 2]] : undefined;

  const getDistanceArray = (d) => {
    const idx = history.length - 1 - d;
    let arr = undefined;
    if (idx >= 0) {
      const x = history[idx];
      arr = indicesMax(distance[d][x]);
    }
    return arr;
  };

  const p_pair_0 = () => getDistanceArray(0);
  const p_pair_1 = () => getDistanceArray(1);
  const p_pair_2 = () => getDistanceArray(2);

  const procList = [
    { handler: p_maxfreq, weight: 10 },
    { handler: p_recent, weight: 8 },
    { handler: p_upper, weight: 2 },
    { handler: p_zigzag, weight: 3 },
    { handler: p_consecutive, weight: 10 },
    { handler: p_equal, weight: 8 },
    { handler: p_pair_0, weight: 10 },
    { handler: p_pair_1, weight: 8 },
    { handler: p_pair_2, weight: 6 },
  ];

  const match = (seq, arr, from) => {
    let end = from + seq.length;
    if (end > arr.length) {
      return false;
    }
    for (let i = 0, k = from; i < seq.length; i++, k++) {
      if (seq[i] !== arr[k]) {
        return false;
      }
    }
    return true;
  };

  const occurrences = (seq) => {
    let count = 0;
    const min_len = seq.length;
    if (history.length >= min_len) {
      let from = 0;
      let idx;
      while ((idx = history.indexOf(seq[0], from)) !== -1) {
        if (match(seq, history, idx)) {
          count++;
        }
        from = idx + 1;
      }
    }
    return count;
  };

  const countDuplicate = (len, last) => {
    let count = 0;
    if (history.length >= len) {
      const seq = history.slice(-len + 1);
      seq.push(last);
      count = occurrences(seq);
    }
    return count;
  };

  const evaluate = (x) => {
    let score = 0;
    for (const p of procList) {
      const excl = p.handler(x);
      if (excl && excl.includes(x)) {
        score += p.weight;
      }
    }
    if (history.length >= 5) {
      let count = countDuplicate(3, x);
      score += count * 20;

      count = countDuplicate(4, x);
      score += count * 30;
    }
    return score;
  };

  let n = pick(_xrand(range), history).value;
  if (history.length > 1) {
    let k = 2 * (range + 1);
    let min_score = 100;
    let best = n;
    do {
      let score = evaluate(n);
      if (score < min_score) {
        min_score = score;
        best = n;
      }
      n = _xrand(range);
    } while (--k > 0);

    n = best;

    for (let i = 0; i < MAX_DISTANCE; i++) {
      let idx = history.length - 1 - i;
      if (idx < 0) {
        break;
      }
      let x = history[idx];
      const arr = distance[i];
      arr[x][n]++;
    }
  }

  history.push(n);
  frequency[n]++;
  if (history.length > MAX_HIST) {
    history.shift();
  }
  return min + n;
}

function xrand(min, max, fn) {
  const range = max - min;

  if (typeof fn === 'function' || range !== history.range) {
    if (typeof fn === 'function') {
      generator = fn;
    }
    reset(range);
  }
  if (max <= min) {
    return min;
  }
  return _xrand_proc(min, max);
}

module.exports.xrand = xrand;
