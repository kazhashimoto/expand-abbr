#!/usr/bin/env node

const { program } = require("commander");
const expand = require('emmet').default;
const XRegExp = require('xregexp');
const MersenneTwister = require('mersenne-twister');
const mt = new MersenneTwister();
const icons = require('./icons');
const { macroMap } = require('./macros');
const { styleMap, styleMapOptions } = require('./preset-styles');
const styleRules = [];
const elements = [
  /* Sections */
  'article', 'section', 'nav', 'aside', 'header', 'footer',
  /* Grouping content */
  'ol', 'ul', 'dl', 'figure', 'figcaption', 'main', 'div',
  /* Text-level semantics */
  'a', 'span',
  /* Tabular data */
  'table'
];

const emmetOptions = {
  options: {
    'output.indent': '  '
  }
};

styleMapOptions.getIconURL = icons.getIconURL;

function collect(value, previous) {
  return previous.concat([value]);
}

program
  .name('expand-abbr')
  .version('1.1.10')
  .usage('[options] abbreviation ...')
  .showHelpAfterError()
  .option('-h,--head', 'prepend html header')
  .option('-w,--wrapper <parent>', 'wrap expanded elements with div.parent')
  .option('--local', 'use local path for the src attribute of <img> elements')
  .option('--path <prefix>', 'set the src attribute of img elements to a pathname starting with prefix')
  .option('-c,--css <stylesheet>', 'insert a link to an external stylesheet inside head element', collect, [])
  .option('-f,--load-macros <module>', 'load user defined macros from <module>')
  .option('-l,--list-macros', 'list Element macros')
  .option('-m,--macro <key_value>', 'add Element macro definition', collect, [])
  .option('-q,--query <key>', 'print Element macro that matches <key>')
  .option('--dark', 'apply dark theme on the generated page')
  .option('--grayscale', 'get grayscale images')
  .option('-t,--tab', 'use a tab character for indenting instead of spaces. (default: 2 spaces)')
  .option('--without-style', 'If this option disabled, insert default styles by using a <style> element in the <head> section')
  .option('-x', 'add compiled abbreviation as HTML comment to output')
  .option('--check', 'check for inconsistency in macro definitions and in style rules')
  .option('-d', 'print debug info.');

program.parse(process.argv);
const options = program.opts();
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
if (options.head && !options.withoutStyle) {
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
if (options.tab) {
  emmetOptions.options['output.indent'] = '\t';
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

/**
 * @param range min | min,max
 * @param min   default min value
 * @return  random integer between min and max values (inclusive).
 */
function getRandomInt(range, min) {
  const arr = range.split(',').map(x => isNaN(x)? min : +x);
  if (!arr.length) {
    return min;
  }
  let x, y, num;
  if (arr.length < 2) {
    x = min;
    y = arr[0];
  } else {
    [x, y] = arr;
  }
  if (x < y) {
    num = x + mt.random_int() % (y + 1 - x);
  } else {
    num = y;
  }
  return num;
}

function multiplication(match) {
  const str = match.replace(/%/g, '');
  const n = getRandomInt(str, 1);
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
      range.repeat = o.value.replace(/^%\+/, '').replace(/%.*$/, '');
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
  let n = getRandomInt(range.repeat, 1);

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
  let re =  /^\(*([a-z]+)[^a-z]/;
  const addClass = (key, item) => {
    const prefix = '_x';
    const found = item.match(re);
    if (!found) {
      return item;
    }
    const tag = found[1];
    if (elements.includes(tag)) {
      const cls = `${prefix}-${key}_${tag}`;
      let str = found[0].replace(tag, `${tag}.${cls}`);
      let obj = getPresetStyles(cls);
      if (obj && !obj.checked) {
        obj.checked = true;
        obj.class = cls;
        styleRules.push(obj);
      }
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

function getPresetStyles(cls) {
  let tag;
  let str = cls;
  let re = /_([a-z]+)$/;
  let found = cls.match(re);
  if (found) {
    tag = found[1];
    str = cls.replace(re, '');
  }
  const words = str.split('-');
  return bestMatch(words, tag);
}

function bestMatch(words, tag) {
  let matches;
  let best = undefined;
  for (const [key, obj] of styleMap) {
    if (obj.accept.includes(tag)) {
      if (!obj._key_words) {
        obj._key_words = key.split('-');
      }
      matches = true;
      for (const w of obj._key_words) {
        if (!words.includes(w)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        if (!best ||(obj._key_words.length > best._key_words.length)) {
          best = obj;
        }
      }
    }
  }
  return best;
}

const statMap = new Map();
const randGenMap = new Map();
for (const key of macroMap.keys()) {
  randGenMap.set(key, new MersenneTwister());
  const val = macroMap.get(key);
  statMap.set(key, (new Array(val.length)).fill(0));
}

function dig(specifier) {
  let re = /^%>([a-z]+)\{(\d+(,\d+)?)\}%$/;
  let found = specifier.match(re);
  if (found) {
    let tag = found[1];
    const descend = [];
    let depth = getRandomInt(found[2], 0);
    for (let i = 0; i < depth; i++) {
      descend.push(tag);
    }
    if (descend.length) {
      let abbr = descend.join('>');
      return `>${abbr}>`;
    }
    return '>';
  }
  return specifier;
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
  if (item == 'table' && !values.used) {
    values.fill('%alternative%');
    values.used = true;
  }

  let grayscale = '';
  re = /(img\[src=)photo(\d+x\d+)?_?\$?\.(jpg|png)/;
  found = abbr.match(re);
  if (found) {
    let [width, height] = [320, 240];
    if (found[2]) {
      let [rx, ry] = found[2].split('x').map(d => +d);
      let c;
      if (item == 'thumbnail') {
        c = 20;
        if (rx < 4) {
          c = 400;
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
        if (options.grayscale) {
          grayscale = '_GRAYSCALE'
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
        abbr = abbr.replace(re, `$1__IMAGE${width}X${height}${grayscale}__`);
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
  let re = /%\d+(,\d+)?%/;
  while (re.test(abbr)) {
    abbr = abbr.replace(new RegExp(re, 'g'), multiplication);
  }
  return abbr;
}

const reMacros = [
  {re: /%[a-z-]+(\d+)?(@\d+)?%/, handler: macro },
  {re: /%>[a-z]+\{\d+(,\d+)?\}%/, handler: dig }
];

function replaceMacro(abbr) {
  const fn = (p, o) => p || o.re.test(abbr);
  while (reMacros.reduce(fn, false)) {
    for (const o of reMacros) {
      while (o.re.test(abbr)) {
        abbr = abbr.replace(new RegExp(o.re, 'g'), o.handler);
      }
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
  let arr = expand(lorem, {options: {'output.newline': '\n'}}).split('\n');
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

function concatLoremText(words, count) {
  const lorem = `lorem${words}*${count + 1}`;
  let arr = expand(lorem, {options: {'output.newline': '\n'}}).split('\n');
  arr.shift();  // skip the first sentence starting "Lorem ipsum"
  if (words > 5 && prob(0.2)) {
    arr[0] = arr[0].replace(/^[A-Z][a-z]*( [a-z]+){4}/, 'Lorem ipsum dolor sit amet')
  }
  return arr.join(' ');
}

const emoji_code = [
  '&#x1F600;', // grinning face
  '&#x1F923;',  // rolling on the floor laughing
  '&#x1F602;',  // face with tears of joy
  '&#x1F970;',  // smiling face with hearts
  '&#x1F44D;',  // thumbs up
  '&#x1F4AF;',  // hundred points
  '&#x1F49A;',  // green heart
  '&#x1F3B5;',  // musical note,
  '&#x1F4F8;',  // camera with flash,
  '&#x1F63B;',   //smiling cat with heart-eyes
];

// Fisher–Yates
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const r = Math.floor(mt.random() * (i + 1));
    [array[i], array[r]] = [array[r], array[i]];
  }
}

function getEmoji(count) {
  shuffle(emoji_code);
  let str = '';
  for (let i = 0; i < count; i++) {
    const idx = i % emoji_code.length;
    str += emoji_code[idx];
  }
  return str;
}

function prob(p) {
  const x = mt.random_incl();
  const r = p / 2;
  return (Math.abs(x - 0.5) < r);
}

function insertLink(str) {
  let param = str.toLowerCase().replace(/\W/g, encodeURIComponent);
  let url = `https://www.google.com/search?q=${param}`;
  const abbr = `a[href="${url}"]{${str}}`;
  return expand(abbr);
}

function insertNumber(str) {
  if (prob(0.02)) {
    let x = mt.random_incl();
    let y = Math.exp(4 * x - 4);
    let n = Math.floor(2500 * y);
    let digits = new Intl.NumberFormat('en-US').format(n);
    str = str.replace(' ', ` ${digits} `);
  }
  return str;
}

function insertDash(str) {
  if (prob(0.2)) {
    str = str.replace(/^([a-z]) /, '$1&mdash;').replace(/ ([a-z])$/, '&mdash;$1');
  }
  return str;
}

function reducePunctuationMarks(source) {
  let text = source;

  const full_stop = (str) => {
    if (prob(0.8)) {
      str = str.replace(/[!?]/, '.');
    }
    return str;
  };
  const comma = (str) => {
    return prob(0.7)? '': str;
  };
  const first_word_comma = (str) => str.replace(',', '');
  const single_word1 = (str) => str.replace(/^[.!?]/, '').toLowerCase();
  const single_word2 = (str) => {
    str = str.replace(/[.!?]/, '').replace(/[A-Z]$/, str => str.toLowerCase());
    return str;
  };
  const parentheses = (str) => {
    if (prob(0.3)) {
      str = str.replace(/^, /, ' (').replace(/,$/, ')');
    }
    return str;
  };
  text = text.replace(/[!?]/g, full_stop);
  text = text.replace(/[A-Z][a-z]*,/g, first_word_comma);
  text = text.replace(/[.!?] [A-Z][a-z]*[.!?]/g, single_word1);
  text = text.replace(/[A-Z][a-z]*[.!?] [A-Z]/g, single_word2);
  text = text.replace(/,( [a-z]+){1,4},/g, parentheses);
  text = text.replace(/,/g, comma);
  return text;
}

function makeHypertext(source) {
  let text = source;
  text = reducePunctuationMarks(text);
  text = text.replace(/[a-z]( [a-z]+){5} [a-z]/, insertDash);
  text = text.replace(/[a-z] [a-z]/g, insertNumber);
  const mark = (str) => {
    if (prob(0.05)) {
      str = str.replace(/ $/, '#');
    }
    return str;
  };
  const mark2 = (str) => {
    if (prob(0.5)) {
      str = str.replace(/ $/, '#');
    }
    return str;
  };
  const hypertext = (str) => {
    str = str.replace(/#/g, ' ').replace(/ $/, '');
    str = insertLink(str) + ' ';
    return str;
  };
  text = text.replace(/[A-Za-z]{5,} /g, mark)
              .replace(/#[[A-Za-z]+ /g, mark2)
              .replace(/#[[A-Za-z]+ /g, mark2)
              .replace(/([A-Za-z]+#)+/g, hypertext);
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
    } if (macro == 'HEADING_SHORT') {
      n = fluctuation(5, 1);
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
    } else if (macro == 'COMMENT') {
      n = fluctuation(20, 10);
      text = getLoremText(`lorem${n}*5`, 1, true, false);
      if (prob(0.5)) {
        n = 1 + mt.random_int() % 4;
        text += getEmoji(n);
      }
    } else if (/^HYPERTEXT(\d+X\d+)/.test(macro)) {
      found = macro.match(/^HYPERTEXT(\d+X\d+)/);
      let [words, count] = found[1].split('X').map(d => +d);
      text = concatLoremText(words, count);
      text = makeHypertext(text);
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
      found = macro.match(/^IMAGE(\d+X\d+)(_GRAYSCALE)?/);
      let [width, height] = found[1].split('X').map(d => +d);
      let x = 1 + mt.random_int() % 1000;
      let grayscale = found[2]? '&grayscale': '';
      text = `https://picsum.photos/${width}/${height}?random=${x}${grayscale}`;
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
  let html = expand(abbr, emmetOptions).replace(/__([A-Z][A-Z_0-9]*)__/g, replaceText);
  html = replaceLocalPath(html);
  html = replaceDate(html);
  console.log(html);
}

function embedStyles(/* specifier */) {
  const ruleText = (selector, props) => {
    const decl = props.join('; ');
    const rules = `${selector} {${decl}}\n`;
    return rules;
  };
  let text = '\n';
  for (const o of styleRules) {
    const map = o.getStyleRule(o.class, options.dark);
    for (const [key, value] of map) {
      text += ruleText(key, value);
    }
  }
  return text;
}

if (options.head) {
  let str = expand('!', emmetOptions);
  if (options.css) {
    str = str.replace(/<\/head>[^]*<\/html>/, '');
  } else {
    str = str.replace(/<body>[^]*<\/html>/, '');
  }
  process.stdout.write(str);
  if (!options.withoutStyle) {
    const theme = options.dark? 'normalize.dark.min.css': 'normalize.light.min.css';
    options.css.unshift(
      'https://unpkg.com/open-props',
      `https://unpkg.com/open-props/${theme}`
    );
  }
  for (const p of options.css) {
    console.log('\t' + expand(`link[href=${p}]`));
  }
  if (!options.withoutStyle) {
    console.log(expand('style>{__STYLE__}').replace(/__STYLE__/, embedStyles));
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

if (options.check) {
  console.log('### check macros ###');
  let value = macroMap.get('root');
  visitMacros(value, 'root');
  checkMacros();

  console.log('### check style rules ###');
  checkStyleRules();
}

function visitMacros(value, parent) {
  if (value.visited) {
    return;
  }
  value.visited = true;
  let re = /%[a-z-]+(@\d+)?%/g;
  for (const expression of value) {
    const found = expression.match(re);
    if (found) {
      for (const macro of found) {
        const key = macro.replace(/%/g, '').replace(/@\d+/, '');
        const v = macroMap.get(key);
        if (v) {
          visitMacros(v, key);
        } else {
          value.error = `Error: ${key} in ${parent} not defined`;
        }
      }
    }
  }
}

function checkMacros() {
  let [used, notused] = [0, 0];
  for (const [key, value] of macroMap) {
    if (value.visited) {
      used++;
    } else {
      notused++;
      console.log(`${key} visited=${value.visited}`);
    }
    if (value.error) {
      console.log(value.error);
    }
  }
  console.log(`used=${used}, not used=${notused}`);
}

function checkStyleRules() {
  if (!styleRules.length) {
    addClassNames();
  }
  let [used, notused] = [0, 0];
  for (const [key, value] of styleMap) {
    if (value.checked) {
      used++;
    } else {
      notused++;
      console.log(`${key}: checked=${value.checked}`);
    }
  }
  console.log(`used=${used}, not used=${notused}`);
}
