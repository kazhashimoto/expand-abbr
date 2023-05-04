let generator = () => Math.random(); // default
let history = [];
history.range = 0;
const MAX_HIST = 50;
const RECENT_LEN = 5;
let frequency = [];
let distance = [];
const MAX_DISTANCE = 5;

// DEBUG--
const stat = {};
//-- DEBUG

const reset = (x) => {
  history = [];
  history.range = x;
  frequency = zero(x + 1);
  distance = zero(MAX_DISTANCE).map(() => matrix(x + 1));
};

const zero = (x) => new Array(x).fill(0);
const matrix = (x) => zero(x).map(() => zero(x));
const indicesMax = (arr, threshold) => {
  const top = Math.max(...arr);
  if (typeof threshold === 'undefined') {
    threshold = 0;
  }
  if (top > threshold) {
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

  const p_bias = () => {
    let arr = undefined;
    if (upper() > 0.5) {
      arr = [Math.ceil(range / 2), range];
    } else {
      arr = [0, Math.floor(range / 2)];
    }
    return arr;
  };

  const p_consecutive = (x) => {
    let arr = undefined;
    if (history.length >= 2) {
      const seq = history.slice(-2);
      const last = seq[1];
      if (x === last + 1 && last === seq[0] + 1) {
        arr = [x];
      } else if (x === last - 1 && last === seq[0] - 1) {
        arr = [x];
      }
    }
    return arr;
  };

  const p_triple = (x) => {
    if (history.length >= 2) {
      const seq = history.slice(-2);
      if (x === seq[0] && x === seq[1]) {
        return [x];
      }
    }
    return undefined;
  };

  const p_maxfreq = () => indicesMax(frequency);
  const p_recent = (x) => {
    if (history.length >= RECENT_LEN) {
      const arr = history.slice(-RECENT_LEN);
      arr.push(x);
      return indicesMax(arr, 1);
    }
    return undefined;
  };
  const p_double = () => [history[history.length - 1]];

  const p_zigzag = () =>
    history.length > 1 ? [history[history.length - 2]] : undefined;

  const p_zigzag2 = (x) => {
    if (history.length >= 3) {
      const seq = history.slice(-3);
      if (seq[0] === seq[2] && seq[1] === x) {
        return [x];
      }
    }
    return undefined;
  };

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

  const p_step = (x) => {
    if (history.length >= 3) {
      const seq = history.slice(-3);
      if (seq[0] === seq[1] && seq[2] === x) {
        return [x];
      }
    }
    return undefined;
  };

  const p_3_over_4 = (x) => {
    if (history.length >= 3) {
      const seq = history.slice(-3);
      if (seq[0] === seq[1] && seq[1] === x) {
        return [x];
      } else if (seq[0] === seq[2] && seq[2] === x) {
        return [x];
      } else if (seq[1] === seq[2] && seq[2] === x) {
        return [x];
      }
    }
    return undefined;
  };

  const is_binary = (arr) => {
    const values = [];
    arr.forEach((v) => (values[v] = 1));
    return Object.keys(values).length <= 2;
  };

  const p_binary_3 = (x) => {
    if (range >= 2 && history.length >= 3) {
      const arr = history.slice(-3);
      arr.push(x);
      if (is_binary(arr)) {
        return [x];
      }
    }
    return undefined;
  };

  const p_binary_4 = (x) => {
    if (range >= 2 && history.length >= 4) {
      const arr = history.slice(-4);
      arr.push(x);
      if (is_binary(arr)) {
        return [x];
      }
    }
    return undefined;
  };

  const p_up_down = (x) => {
    if (range >= 2 && history.length >= 4) {
      const seq = history.slice(-4);
      seq.push(x);
      const top = seq[2];
      if (top < 2) {
        return undefined;
      }
      for (let i = 1; i <= 2; i++) {
        if (seq[2 - i] !== seq[2 + i] || seq[2 - i] !== top - i) {
          return undefined;
        }
      }
      return [x];
    }
    return undefined;
  };

  const p_down_up = (x) => {
    if (range >= 2 && history.length >= 4) {
      const seq = history.slice(-4);
      seq.push(x);
      const bottom = seq[2];
      if (bottom > range - 2) {
        return undefined;
      }
      for (let i = 1; i <= 2; i++) {
        if (seq[2 - i] !== seq[2 + i] || seq[2 - i] !== bottom + i) {
          return undefined;
        }
      }
      return [x];
    }
    return undefined;
  };

  const procList = [
    { handler: p_maxfreq, weight: 10 },
    { handler: p_recent, weight: 20 },
    { handler: p_bias, weight: 2 },
    { handler: p_zigzag, weight: 3 },
    { handler: p_zigzag2, weight: 10 },
    { handler: p_consecutive, weight: 10 },
    { handler: p_triple, weight: 30 },
    { handler: p_double, weight: 10 },
    { handler: p_pair_0, weight: 10 },
    { handler: p_pair_1, weight: 8 },
    { handler: p_pair_2, weight: 6 },
    { handler: p_step, weight: 40 },
    { handler: p_3_over_4, weight: 40 },
    { handler: p_binary_3, weight: 40 },
    { handler: p_binary_4, weight: 40 },
    { handler: p_up_down, weight: 40 },
    { handler: p_down_up, weight: 40 },
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
        // DEBUG--
        const name = p.handler.name;
        if (typeof stat[name] == 'undefined') {
          stat[name] = 1;
        } else {
          stat[name]++;
        }
        //--DEBUG
      }
    }
    if (history.length >= 5) {
      let count;
      for (let d = 2; d <= 4; d++) {
        count = countDuplicate(d, x);
        score += count * 20;
        // DEBUG--
        if (count) {
          stat[`dup${d}`] = count;
        }
        //-- DEBUG
      }
    }
    return score;
  };

  let n = pick(_xrand(range), history).value;
  if (history.length > 1) {
    let k = 2 * (range + 1);
    let min_score = 1000;
    let best = n;
    let first = true;
    do {
      if (first) {
        first = false;
      } else {
        n = _xrand(range);
      }
      let score = evaluate(n);
      if (score < min_score) {
        min_score = score;
        best = n;
      }
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

// DEBUG--
function printStat() {
  for (const p in stat) {
    const v = stat[p];
    console.log(`${p}: ${v}`);
  }
}
//-- DEBUG

function xrand(min, max, fn) {
  const range = max - min;

  // DEBUG--
  if (typeof fn === 'string') {
    if (fn == 'stat') {
      printStat();
    }
    return 0;
  }
  //-- DEBUG

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
