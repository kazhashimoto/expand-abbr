#!/usr/bin/env node

const { program } = require("commander");
const emmet = require('emmet');
const expand = emmet.default;
const XRegExp = require('xregexp');
const MersenneTwister = require('mersenne-twister');
const mt = new MersenneTwister();
const icons = require('./icons');
const { macroMap } = require('./macros');
const { getPresetStyles } = require('./preset-styles');

function collect(value, previous) {
  return previous.concat([value]);
}

program
  .name('expand-abbr')
  .version('1.1.6')
  .usage('[options] abbreviation ...')
  .showHelpAfterError()
  .option('-h,--head', 'prepend html header')
  .option('-w,--wrapper <parent>', 'wrap expanded elements with div.parent')
  .option('--local', 'use local path for the src attribute of <img> elements')
  .option('--path <prefix>', 'set the src attribute of img elements to a pathname starting with prefix')
  .option('-c,--css <stylesheet>', 'insert a link to an external stylesheet inside head element', collect, [])
  .option('--class', 'add class attribute to the primary elements')
  .option('--add-style', 'insert default styles by using a <style> element in the <head> section')
  .option('-f,--load-macros <module>', 'load user defined macros from <module>')
  .option('-l,--list-macros', 'list Element macros')
  .option('-m,--macro <key_value>', 'add Element macro definition', collect, [])
  .option('-q,--query <key>', 'print Element macro that matches <key>')
  .option('-x', 'add compiled abbreviation as HTML comment to output')
  .option('-d', 'print debug info.');

program.parse(process.argv);
const options = program.opts();
if (options.addStyle) {
  options.class = true;
}
if (options.path) {
  if (/[^/]$/.test(options.path)) {
    options.path += '/';
  }
  options.local = true;
}

let debug = () => {};
if (options.d) {
  debug = (...args) => { console.log(...args); }
}

if (options.macro) {
  addMacros(options.macro);
}
if (options.loadMacros) {
  loadMacros(options.loadMacros);
}
if (options.class) {
  addClassNames();
}
if (options.listMacros) {
  console.log(macroMap);
  process.exit(0);
}
if (options.query) {
  const value = macroMap.get(options.query);
  if (value) {
    console.log(value);
  }
  process.exit(0);
}

function addMacros(defs) {
  for (const entry of defs) {
    const [key, value] = entry.split(':');
    if (!value) {
      console.error(`${entry}: is not valid macro format [key:value].`);
      process.exit(1);
    }
    if (macroMap.has(key)) {
      macroMap.get(key).push(value);
    } else {
      macroMap.set(key, [ value ]);
    }
  }
}

function loadMacros(local_path) {
  let obj;
  const path = require('node:path');

  if (!path.isAbsolute(local_path)) {
    local_path = path.join(process.cwd(), local_path);
  }
  try {
    obj = require(local_path);
  } catch(err) {
    console.error(err.message);
    process.exit(1);
  }

  const copyValues = (target, src) => {
    for (const e of src) {
      target.push(e);
    }
  };
  for (const [key, value] of obj.macroMap) {
    if (macroMap.has(key)) {
      copyValues(macroMap.get(key), value);
    } else {
      macroMap.set(key, value);
    }
  }
}

function concat(abbr_list) {
  let expression = '';
  abbr_list.forEach(abbr => {
    if (expression) {
      expression += '+';
    }
    abbr = compile(abbr);
    expression += `(${abbr})`;
  });
  return expression;
}

function multiplication(match) {
  // convert '%min,max%' to array [min, max]
  const range = match.replace(/%/g, '').split(',').map(x => isNaN(x)? 1: parseInt(x));
  if (!range.length) {
    return '*1';
  }
  let x, y;
  if (range.length === 1) {
    x = 1;
    y = range[0];
  } else {
    [x, y] = range;
  }
  if (x > y) {
    return '*1';
  }
  const base = mt.random_int();
  const n = x + base % (y - x + 1);
  debug('rand=n,x,y', n, x, y);
  return `*${n}`;
}

function addition(str) {
  let arr;
  const options = {
    valueNames: [
    'outside',
    'left',
    'text-between',
    'right']
  };
  let found = XRegExp.matchRecursive(str, '\\(', '\\)', 'g', options);
  let range = {};
  for (const o of found) {
    if (o.name == 'outside' && /^%\+\d+/.test(o.value)) {
      range.end = o.start;
      let [min, max] = [1, 1];
      let val = o.value.replace(/^%\+/, '').replace(/%.*$/, '')
              .split(',').map(d => isNaN(d)? 1: +d);
      if (val.length === 1) {
        max = val[0];
      } else {
        [min, max] = val;
      }
      range.repeat = [min, max];
      const t = o.value.match(/^%\+\d+(,\d+)?%/);
      range.startTrailing = o.start + t[0].length;
      break;
    }
  }
  if (!range.end) {
    for (const o of found) {
      if (o.name == 'text-between' && /%\+\d+/.test(o.value)) {
        arr = splitText(str, o.start, o.end);
        arr[1] = addition(o.value);
        return arr.join('');
      }
    }
  }
  for (const o of found) {
    if (o.name == 'text-between' && o.end === range.end - 1) {
      range.startExpr = o.start;
      range.expression = o.value;
      break;
    }
  }

  /*
   * outside ( expression ) %+d,d% outside
   *           ^1           ^2     ^3
   * 1: startExpr
   * 2: end
   * 3: startTrailing
   */
  arr = splitText(str, range.startExpr - 1, range.startTrailing);
  const term = `(${range.expression})`;

  let [x, y] = range.repeat;
  const base = mt.random_int();
  let n = x + base % (y - x + 1);
  debug('addition: rand=n,x,y', n, x, y);

  let expression = term;
  for (let i = 1; i < n; i++) {
    expression += `+${term}`;
  }
  arr[1] = expression;
  return arr.join('');
}

function splitText(str, left, right) {
  const arr = [];
  arr[0] = str.slice(0, left);
  arr[2] = str.slice(right);
  return arr;
}

function addClassNames() {
  const elements = [
    /* sections */
    'article', 'section', 'nav', 'aside', 'header', 'footer',
    /* grouping content */
    'ol', 'ul', 'dl', 'figure', 'figcaption', 'main', 'div',
    /* tabular data */
    'table'
  ];
  let re =  /^\(*([a-z]+)[^a-z]/;
  const addClass = (key, item) => {
    const prefix = '_x';
    const found = item.match(re);
    if (!found) {
      return item;
    }
    const tag = found[1];
    if (elements.includes(tag)) {
      let str = found[0].replace(tag, `${tag}.${prefix}-${key}_${tag}`);
      return item.replace(re, str);
    }
    return item;
  }
  for (const key of macroMap.keys()) {
    const values = macroMap.get(key);
    for (let i = 0; i < values.length; i++) {
      values[i] = addClass(key, values[i]);
    }
  }
}

const statMap = new Map();
const randGenMap = new Map();
for (const key of macroMap.keys()) {
  randGenMap.set(key, new MersenneTwister());
  const val = macroMap.get(key);
  statMap.set(key, (new Array(val.length)).fill(0));
}

function macro(specifier) {
  let idx = -1;
  let abbr;
  let re = /@(\d+)%$/;
  let found = specifier.match(re);
  if (found) {
    idx = parseInt(found[1]);
    specifier = specifier.replace(re, '');
  }
  const item = specifier.replace(/%/g, '');
  re = /^>([a-z]+){(\d+)}$/;
  found = item.match(re);
  if (found) {
      let tag = found[1];
      let depth = found[2];
      const descend = [];
      for (let i = 0; i < depth; i++) {
        const p = mt.random_incl();
        if (p < 0.4) {
          break;
        }
        descend.push(tag);
      }
      if (descend.length) {
        abbr = descend.join('>');
        return `>${abbr}>`;
      }
      return `>`;
  }
  const values = macroMap.get(item);
  if (!values) {
    return 'div.error';
  }
  if (idx >= 0) {
    idx = Math.min(idx, values.length - 1);
  } else {
    const gen = randGenMap.get(item);
    const base = gen.random_int();
    idx = base % values.length;
    debug('macro: rand=i,length', idx, values.length);
    const stat = statMap.get(item);
    stat[idx]++;
  }
  abbr = values[idx];

  re = /(img\[src=)photo(\d+x\d+)?_?\$?\.(jpg|png)/;
  found = abbr.match(re);
  if (found) {
    let [width, height] = [320, 240];
    if (found[2]) {
      let [rx, ry] = found[2].split('x').map(d => +d);
      let c;
      if (item == 'thumbnail') {
        c = 15;
        if (rx < 4) {
          c = 100;
        } else if (rx < 10) {
          c = 60;
        }
      } else {
        c = 50;
        if (rx === 1) {
          c = 300;
        } else if (rx < 10) {
          c = 150;
        }
      }

      width = rx * c;
      height = ry * c;
      const attr = `width=${width} height=${height}`;
      abbr = abbr.replace(re, `$& ${attr}`);
    }
    if (!options.local) {
      found = abbr.match(re);
      if (found) {
        abbr = abbr.replace(re, `$1__IMAGE${width}X${height}__`);
      }
    }
  }

  abbr = replaceAddition(abbr);
  return abbr;
}

function replaceAddition(abbr) {
  let re = /%\+\d+(,\d+)?%/;
  while (re.test(abbr)) {
    abbr = addition(abbr);
  }
  return abbr;
}

function replaceMultiplication(abbr) {
  let re = /%\d+(,\d+)?%/g;
  while (re.test(abbr)) {
    abbr = abbr.replace(re, multiplication);
  }
  return abbr;
}

function replaceMacro(abbr) {
  let re = /%>?[a-z-]+(\d+)?({\d+})?(@\d+)?%/g;
  const found = abbr.match(re);
  if (found) {
    let limit = 20;
    while (limit > 0 && re.test(abbr)) {
      abbr = abbr.replace(re, macro);
      limit--;
    }
    debug('## limit, length', limit, found.length, found);
    if (!limit) {
      abbr = abbr.replace(re, '');
    }
  }
  return abbr;
}

function compile(abbr) {
  abbr = replaceAddition(abbr);
  abbr = replaceMacro(abbr);
  abbr = replaceMultiplication(abbr);
  return abbr;
}

/**
 * @param lorem lorem[min [-max]][*times]
 * @param idx   the index of the array from which the dummy text is extracted
 * @param punctuation  if true, remove punctuation characters
 * @param capitalize  if true, capitalize the first letter of each word in the dummy text
 */
function getLoremText(lorem, idx, punctuation, capitalize) {
  let arr = expand(lorem).split('\n');
  if (idx < 0) {
    idx = 0;
  } else if (idx >= arr.length) {
    idx = arr.length - 1;
  }
  let text = arr[idx];
  if (!punctuation) {
    text = text.replace(/[.,!]/g, '');
  }
  if (capitalize) {
    arr = text.split(' ');
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    text = arr.join(' ');
  }
  return text;
}

function fluctuation(base, delta) {
  let r;
  let d = 0;
  for (; d < delta; d++) {
    r = mt.random();
    if (r > 0.25 && r <= 0.75) {
      break;
    }
  }
  r = mt.random();
  if (r > 0.25 && r <= 0.75) {
    d = -d;
  }
  base += d;
  return (base < 0)? 0: base;
}

const seqMap = new Map();

function replaceText(specifier) {
  let text = '';
  let n;
  let re = /__([A-Z][A-Z_0-9]*)__/;
  let found = specifier.match(re);
  if (found) {
    const macro = found[1];
    if (macro == 'HEADING') {
      n = fluctuation(6, 2);
      text = getLoremText(`lorem${n}*3`, 1, false, true);
    } else if (macro == 'PHRASE') {
      text = getLoremText('lorem2*5', 1, false, false);
    } else if (macro == 'NAME') {
      text = getLoremText('lorem2*5', 1, false, true);
      text = text.replace(/\?/, '');
    } else if (macro == 'DIGEST') {
      n = fluctuation(6, 2);
      text = getLoremText(`lorem${n}*5`, 1, true, false);
    } else if (macro == 'MESSAGE') {
      n = fluctuation(12, 3);
      text = getLoremText(`lorem${n}*5`, 1, true, false);
    } else if (/^SEQ/.test(macro)) {
      let v = [0];
      if (seqMap.has(macro)) {
        v = seqMap.get(macro);
      } else {
        seqMap.set(macro, v);
      }
      v[0]++;
      text = v[0].toString();
    } else if (/^IMAGE(\d+X\d+)/.test(macro)) {
      found = macro.match(/^IMAGE(\d+X\d+)/);
      let dim = found[1].split('X').map(d => +d);
      let x = 1 + mt.random_int() % 1000;
      text = `https://picsum.photos/${dim[0]}/${dim[1]}?random=${x}`;
    } else if (macro == 'ICON') {
      text = icons.getIconURL(() => mt.random_int(), !options.local);
    } else if (macro == 'DATETIME') {
      text = getRandomTime();
    } else if (macro == 'DATE') {
      return specifier;
    }
  }
  return text;
}

function getRandomTime() {
  const base = new Date();
  const day = new Date();

  let diff = mt.random_int() % 365;
  day.setDate(base.getDate() - diff);
  diff = mt.random_int() % (60 * 60 * 24);
  day.setMinutes(day.getMinutes() - diff);
  const found = day.toISOString().match(/^(\d{4}-\d{2}-\d{2})T(\d\d:\d\d)/);
  return `${found[1]} ${found[2]}`;
}

function replaceDate(html) {
  let re = /<time datetime="([0-9-: ]+)">(__DATE__)/;

  const replacer = (tag) => {
    const found = tag.match(re);
    if (found) {
      let iso = found[1].replace(' ', 'T').replace(/$/, ':00.000Z');
      const day = new Date(iso);
      const opt = {
        month: 'short', day: 'numeric', year: 'numeric'
      };
      let str = new Intl.DateTimeFormat('en-US', opt).format(day);
      tag = tag.replace(/__DATE__/, str);
    }
    return tag;
  };

  html = html.replace(new RegExp(re, 'g'), replacer);
  return html;
}

function replaceLocalPath(html) {
  if (!options.path) {
    return html;
  }
  let re = /(<img src=")([^"]+")/;
  const replacer = (tag) => {
    const f = tag.match(re);
    if (!/^(http|[./])/.test(f[2])) {
      tag = tag.replace(re, `$1${options.path}$2`);
    }
    return tag;
  };

  html = html.replace(new RegExp(re, 'g'), replacer);
  return html;
}

function outputHTML(abbr) {
  let html = expand(abbr).replace(/__([A-Z][A-Z_0-9]*)__/g, replaceText);
  html = replaceLocalPath(html);
  html = replaceDate(html);
  console.log(html);
}

function embedStyles(/* specifier */) {
  let text = getPresetStyles();
  return text;
}

if (options.head) {
  let str = expand('!');
  if (options.css) {
    str = str.replace(/<\/head>[^]*<\/html>/, '');
  } else {
    str = str.replace(/<body>[^]*<\/html>/, '');
  }
  process.stdout.write(str);
  if (options.addStyle) {
    options.css.unshift(
      'https://unpkg.com/open-props',
      'https://unpkg.com/open-props/normalize.min.css'
    );
  }
  for (const p of options.css) {
    console.log('\t' + expand(`link[href=${p}]`));
  }
  if (options.addStyle) {
    console.log(expand('style>{__STYLE__}').replace(/__STYLE__/g, embedStyles));
  }
  console.log('</head>');
}
if (options.head || options.wrapper) {
  let root = '';
  if (options.head) {
    root = 'body>';
  }
  if (options.wrapper) {
    root += `${options.wrapper}>`
  }
  const abbr = root + concat(program.args);
  if (options.x) {
    console.log('<!--', abbr, '-->');
  }
  outputHTML(abbr);
} else {
  program.args.forEach(abbr => {
    abbr = compile(abbr);
    if (options.x) {
      console.log('<!--', abbr, '-->');
    }
    outputHTML(abbr);
  });
}
if (options.head) {
  console.log('</html>');
}
debug(statMap);
