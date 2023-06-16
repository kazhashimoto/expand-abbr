let history = [];
history.range = 0;
const MAX_HIST = 200;
let frequency = [];
let last_update = [];
let temp_median = 0;
let age = 0;
let runs_count = [0, 0];
let runs_length = [];
let runs_up = [];
let runs_down = [];
let runs_up_odd = [];
let runs_up_even = [];
let runs_down_odd = [];
let runs_down_even = [];
let pairs = [];
const config = {
  mode: 'default',
  generator: () => Math.random()
};
// DEBUG--
const stat = {};
let score_log = [];
//-- DEBUG

const reset = (x) => {
  history = [];
  history.range = x;
  frequency = zero(x + 1);
  last_update = zero(x + 1);
  age = 0;
  score_log = [];

  temp_median = v_median();
  runs_count = [0, 0];
  runs_length = [];
  runs_up = [];
  runs_down = [];
  runs_up_odd = [];
  runs_up_even = [];
  runs_down_odd = [];
  runs_down_even = [];
  pairs = matrix(x + 1);
};

const zero = (x) => new Array(x).fill(0);
const matrix = (x) => zero(x).map(() => zero(x));

const updateRunsCount = () => {
  const x = history[history.length - 1];
  if (x === temp_median) {
    return;
  }
  let idx = x > temp_median ? 0 : 1;
  runs_count[idx]++;
  const arr = runs_length;
  if (arr.length > 0) {
    const last = arr[arr.length - 1];
    if ((last === '+' && idx === 0) || (last === '-' && idx === 1)) {
      arr[arr.length - 2]++;
    } else if (last === '+' && idx === 1) {
      arr[arr.length - 1] = 1;
      arr.push('-');
    } else if (last === '-' && idx === 0) {
      arr[arr.length - 1] = 1;
      arr.push('+');
    }
  } else {
    arr[0] = 1;
    arr[1] = idx === 0 ? '+' : '-';
  }
};

const updateRunsUpDownCount = () => {
  if (history.length < 2) {
    return;
  }
  const seq = history.slice(-2);
  const d = seq[1] - seq[0];
  if (!d) {
    return;
  }
  const arr = d > 0 ? runs_up : runs_down;
  arr.push(d);
};

const updateRunsUpDownCount2 = () => {
  if (history.length < 3) {
    return;
  }
  const seq = history.slice(-3);
  const d = seq[2] - seq[0];
  if (!d) {
    return;
  }
  let arr;
  if (age % 2) {
    arr = d > 0 ? runs_up_odd : runs_down_odd;
  } else {
    arr = d > 0 ? runs_up_even : runs_down_even;
  }
  arr.push(d);
};

const updatePairsCount = () => {
  if (history.length < 2) {
    return;
  }
  const [x, y] = history.slice(-2);
  pairs[x][y]++;
};

const v_median = () => {
  let m;
  const count = frequency.length;
  const mid = count / 2;
  if (count % 2) {
    m = Math.ceil(mid) - 1;
  } else {
    m = mid - 0.5;
  }
  return m;
};

const is_bias = (x) => {
  const sum = (p, c) => p + c;
  let s = frequency.reduce(sum);
  if (!s) {
    return 0;
  }
  const m = temp_median;
  let fn = (p, c, i) => (i > m ? p + c : p);
  let u = frequency.reduce(fn, 0);
  let r = u / s;
  if (x > m && r > 0.5) {
    return true;
  } else if (x < m && r < 0.5) {
    return true;
  }
  return false;
};

function _xrand(max) {
  return getRandomIntInclusive(0, max, config.generator);
}

function _xrand_proc(min, max) {
  const range = max - min;

  const p_bias = (x) => {
    if (range >= 2 && history.length >= 2) {
      if (is_bias(x)) {
        return [x];
      }
    }
    return undefined;
  };

  const p_runs = (x) => {
    if (history.length >= 2 && runs_length.length >= 4) {
      let idx = x > temp_median ? 0 : 1;
      if (x === temp_median) {
        return undefined;
      }
      const arr = runs_length;
      const sign = arr[arr.length - 1];
      if ((sign === '+' && idx === 1) || (sign === '-' && idx === 0)) {
        return [x];
      }
    }
    return undefined;
  };

  const p_runs_up_down = (x) => {
    if (history.length >= 2) {
      const last = history[history.length - 1];
      const d = x - last;
      if (!d) {
        return [x];
      }
      let n1 = runs_up.length;
      let n2 = runs_down.length;
      let gap = Math.abs(n1 - n2);
      if (!gap) {
        return undefined;
      }
      if (d > 0) {
        n1++;
      } else if (d < 0) {
        n2++;
      }
      if (Math.abs(n1 - n2) > gap) {
        return [x];
      }
    }
    return undefined;
  };

  const p_runs_up_down2 = (x) => {
    if (range >= 5 && history.length >= 4) {
      const seq = history.slice(-2);
      const d = x - seq[0];
      if (!d) {
        return undefined;
      }
      let arr;
      if (age % 2) {
        arr = d > 0 ? runs_up_even : runs_down_even;
      } else {
        arr = d > 0 ? runs_up_odd : runs_down_odd;
      }
      if (d === arr[arr.length - 1]) {
        return [x];
      }
    }
    return undefined;
  };

  const p_runs_width = (x) => {
    if (range >= 5 && history.length > 0) {
      const last = history[history.length - 1];
      const d = Math.abs(x - last);
      if (d < 2 || d >= range - 1) {
        return [x];
      }
    }
    return undefined;
  };

  const p_successive = (x) => {
    if (range >= 2 && history.length >= 2) {
      const last = history[history.length - 1];
      const freq = pairs[last];
      const n = freq[x]; /* last --> x */
      const arr = freq.filter((v) => v > n);
      return arr.length ? undefined : [x];
    }
    return undefined;
  };

  const p_successive_rev = (x) => {
    if (range >= 2 && history.length >= 2) {
      const last = history[history.length - 1];
      const freq = pairs[x];
      const n = freq[last]; /* x --> last */
      const arr = freq.filter((v) => v > n);
      return arr.length ? undefined : [x];
    }
    return undefined;
  };

  const p_consecutive = (x) => {
    if (range >= 5 && history.length >= 2) {
      const seq = history.slice(-2);
      seq.push(x);
      let r;
      if (x > seq[0]) {
        r = seq.map((v, i) => v + 2 - i).filter((v) => v === x).length;
        if (r === 3) {
          return [x];
        }
      } else if (x < seq[0]) {
        r = seq.map((v, i) => v - 2 + i).filter((v) => v === x).length;
        if (r === 3) {
          return [x];
        }
      }
    }
    return undefined;
  };

  const p_close_to = (x) => {
    if (range >= 5 && history.length >= 2) {
      const t = last_update[x];
      const d = age + 1 - t;
      if (d < 3) {
        return [x];
      }
    }
    return undefined;
  };

  const p_short = (x) => {
    if (range >= 5 && history.length > 0) {
      const t = last_update[x];
      const d = age + 1 - t;
      if (d < range) {
        return [x];
      }
    }
    return undefined;
  };

  let procList = [
    { handler: p_bias },
    { handler: p_runs },
    { handler: p_runs_up_down },
    { handler: p_runs_up_down2 },
    { handler: p_runs_width },
    { handler: p_successive },
    { handler: p_successive_rev },
    { handler: p_short },
    { handler: p_close_to },
    { handler: p_consecutive },
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
        score++;
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
    if (range >= 2 && history.length >= 5) {
      let count;
      for (let d = 2; d <= 4; d++) {
        count = countDuplicate(d, x);
        score += count;
        // DEBUG--
        if (count) {
          stat[`dup${d}`] = count;
        }
        //-- DEBUG
      }
    }
    return score;
  };

  let n;
  if (history.length >= 1) {
    let k = 2 * (range + 1);
    let min_score = 1000;
    let best = 0;
    do {
      n = _xrand(range);
      let score = evaluate(n);
      let t = age - last_update[n];
      if (t > range) {
        score--;
      }
      if (score < min_score) {
        min_score = score;
        best = n;
      }
    } while (--k > 0);

    n = best;
    // DEBUG--
    score_log.push(min_score);
    //-- DEBUG
  } else {
    n = _xrand(range);
  }

  record(n);
  return min + n;
}

function record(n) {
  history.push(n);
  frequency[n]++;
  if (history.length > MAX_HIST) {
    history.shift();
  }
  age++;
  last_update[n] = age;
  updateRunsCount();
  updateRunsUpDownCount();
  updateRunsUpDownCount2();
  updatePairsCount();
}

// DEBUG--
function printStat() {
  for (const p in stat) {
    const v = stat[p];
    console.log(`${p}: ${v}`);
  }
  console.log('age:', last_update);
  console.log('score log:', score_log.slice(-100));
  console.log(`temp_median: ${temp_median}`);
  console.log('runs count:', runs_count);
  console.log('runs length:', runs_length.length, runs_length);
  console.log('runs up:', runs_up.length, runs_up);
  console.log('runs_down:', runs_down.length, runs_down);
  console.log('runs up_odd:', runs_up_odd);
  console.log('runs up_even', runs_up_even);
  console.log('runs_down_odd:', runs_down_odd);
  console.log('runs_down_even:', runs_down_even);
}

function printInfo() {
  console.log('');
  console.log(`mode: ${config.mode}`);
  console.log(`generator: ${config.generator.toString()}`);
}
//-- DEBUG

function xrand(min, max, arg) {
  const range = max - min;

  // DEBUG--
  if (typeof arg === 'string') {
    if (arg == 'stat') {
      printStat();
    } else if (arg == 'info') {
      printInfo();
    } else if (arg == 'reset') {
      reset(0);
    }
    return 0;
  }
  if (typeof arg === 'object') {
    Object.assign(config, arg);
    return 0;
  }
  //-- DEBUG

  if (range !== history.range) {
    reset(range);
  }
  if (max <= min) {
    return min;
  }
  return _xrand_proc(min, max);
}

/**
 * taken from https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
function getRandomIntInclusive(min, max, fn) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(fn() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

module.exports.xrand = xrand;
