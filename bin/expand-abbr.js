#!/usr/bin/env node

const { program } = require("commander");
const emmet = require('emmet');
const expand = emmet.default;
const XRegExp = require('xregexp');
const MersenneTwister = require('mersenne-twister');
const mt = new MersenneTwister();

function collect(value, previous) {
  return previous.concat([value]);
}

program
  .name('expand-abbr')
  .version('1.1.3')
  .usage('[options] abbreviation ...')
  .showHelpAfterError()
  .option('-h,--head', 'prepend html header')
  .option('-c,--css <stylesheet>', 'insert a link to an external stylesheet inside head element', collect, [])
  .option('--picsum', 'embed a random image via picsum into the document')
  .option('-w,--wrapper <parent>', 'wrap expanded elements with parent')
  .option('-x', 'add HTML comments to output')
  .option('-d', 'debug random numbers generated')
  .option('--stat', 'print counters');

program.parse(process.argv);
const options = program.opts();

let debug = () => {};
if (options.d) {
  debug = (...args) => { console.log(...args); }
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

const macroMap = new Map();
macroMap.set('root', [
  '(%pg-header%)+(%pg-main-content%)+(%pg-footer%)'
]);
macroMap.set('pg-main-content', [
  '(%section%)%+4,6%',
]);
macroMap.set('pg-header', [
  '%pg-header-content%',
  'div%>div{1}%(%pg-header-content%)'
]);
macroMap.set('pg-header-content', [
  'header%>div{1}%(%nav%)',
  'header%>div{1}%(h1{__HEADING__}+(%nav%))',
  'header%>div{1}%div>(h1{__HEADING__}+h2{__HEADING__})^(%nav%)',
  'header%>div{1}%h1{__HEADING__}+div>(%nav%)',
]);
macroMap.set('pg-footer', [
  '%pg-footer-content%',
  'div%>div{1}%(%pg-footer-content%)'
]);
macroMap.set('pg-footer-content', [
  'footer%>div{1}%p{&copy;2023 Example}',
  'footer%>div{1}%nav>p%3,5%>a[href=page$.html]{page$}',
  'footer%>div{1}%(nav>p%3,5%>a[href=page$.html]{page$})+p{&copy;2023 Example}'
]);
macroMap.set('nav', [
  'nav>ul>li%3,6%>a[href=#s$]{Section $}'
]);
macroMap.set('block-content', [
  '%p%',
  'div>(%p%)^(div>(%p%))',
  'div>(%p%)+div>(%p%)',
  'div>(%p%)^(%anchor%)',
  'div>(%p%)+(%anchor%)',
  'div>(%p%)^(%img%)',
  'div>(%p%)+(%img%)',
  '(%img%)+(div>(%p%))',
  '%img%+(div>(%p%))',
  'div>(%p%)^(%img%)^(%anchor%)',
  '(div>(%p%)+(%img%))^(%anchor%)',
  'div>(%p%)^(%img%+%anchor%)',
  'div>((%p%)+%img%+%anchor%)',
  '(%img%)+(div>(%p%))+(%anchor%)',
  '(%img%+(div>(%p%))+(%anchor%)',
  '%img%+(div>(%p%)+(%anchor%))',
  '(div>(%p%))+(%anchor%)+(%img%)',
  'div>(%p%)+(%anchor%)+(%img%)'
]);
macroMap.set('p', [
  'p%2,5%>lorem10',
  'p%5%>span>lorem2^lorem8',
  'p%5%>lorem8+span>lorem2',
  'p%5%>a[href=page$.html]{__PHRASE__}+lorem8',
  'p%5%>a[href=page$.html]>{__PHRASE__}+span>{__PHRASE__}',
  'p%5%>lorem8+a[href=page$.html]{__PHRASE__}',
  "p%5%>lorem6+a[href=page$.html]>{__PHRASE__}+span{__PHRASE__}"
]);
macroMap.set('p-long', [
  'p>lorem100',
  'p*2>lorem50',
  'p*3>lorem33',
  'p*4>lorem25',
  'p*5>lorem20'
]);
macroMap.set('img', [
  'div>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div>img[src=photo16x9_$.jpg alt=__PHRASE__]',
  'div%3%>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div%3%>img[src=photo16x9_$.jpg alt=__PHRASE__]'
]);
macroMap.set('thumbnail', [
  'div>img[src=photo1x1_$.jpg alt=__PHRASE__]',
  'div>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div>img[src=photo16x9_$.jpg alt=__PHRASE__]',
]);
macroMap.set('anchor', [
  'div>a[href=#]{__PHRASE__}',
  'div>a[href=#]>span{__PHRASE__}',
  'div>a[href=#]>img[src=button.svg]',
]);
macroMap.set('list', [
  'ul>li%2,5%>lorem4-8',
  'ul>li%2,5%>lorem8-16',
  'ul>li*4>a[href=page$.html]{__PHRASE__}',
  'ul>li%2,5%>a[href=page$,html]>lorem4-8',
  'dl>(dt>{__PHRASE__}^dd>lorem8-16)%3,6%'
]);
macroMap.set('section', [
  '%section-content%',
  'div%>div{1}%(%section-content%)'
]);
macroMap.set('section-content', [
  'section[id=s__SEQ_ID__]>(%section-inner%)',
  'section[id=s__SEQ_ID__]%>div{1}%(%section-inner%)',
]);
macroMap.set('section-inner', [
  '(%section-heading%)+(%section-body%)',
  '(%section-heading%)+(%section-body%)+div>(%list%)',
  '(%section-heading%)+(%section-body%)+div>(%table%)',
  '(%section-heading%)+(%section-body%)+div>(%list%)^div>(%table%)',
]);
macroMap.set('section-heading', [
  'h2{Section __SEQ_1__}',
  'div>h2{Section __SEQ_1__}'
]);
macroMap.set('section-body', [
  '(%section-body-content%)%3%',
  '((%section-body-content%)+(%block-content%))%3%'
]);
macroMap.set('section-body-content', [
  'div>(%p-long%)+(%img%)',
  'div>(%p-long%)^(%img%)',
  'div>(%p-long%)+(%thumbnail%)',
  'div>(%p-long%)^(%thumbnail%)',
  '%img%+div>(%p-long%)',
  '%img%^div>(%p-long%)',
  '%thumbnail%+div>(%p-long%)',
  '%thumbnail%^div>(%p-long%)',
]);
macroMap.set('table', [
  'table>thead>tr>th*3{item$}^^tbody>tr%3,5%>td*3>{__PHRASE__}',
  'table>caption>lorem4^thead>tr>th*4{item$}^^tbody>tr%3,5%>td*4>{__PHRASE__}'
]);

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
        if (rx === 1) {
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
    if (options.picsum) {
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

const seqMap = new Map();

function replaceText(specifier) {
  let text = '';
  let re = /__([A-Z][A-Z_0-9]*)__/;
  let found = specifier.match(re);
  if (found) {
    const macro = found[1];
    if (macro == 'HEADING') {
      text = getLoremText('lorem6*3', 1, false, true);
    } else if (macro == 'PHRASE') {
      text = getLoremText('lorem2*5', 1, false, false);
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
    }
  }
  return text;
}

function outputHTML(abbr) {
  const html = expand(abbr).replace(/__([A-Z][A-Z_0-9]*)__/g, replaceText);
  console.log(html);
}

if (options.head) {
  let str = expand('!');
  if (options.css) {
    str = str.replace(/<\/head>[^]*<\/html>/, '');
  } else {
    str = str.replace(/<body>[^]*<\/html>/, '');
  }
  process.stdout.write(str);
  if (options.css) {
    for (const p of options.css) {
      console.log('\t' + expand(`link[href=${p}]`));
    }
    console.log('</head>');
  }
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
if (options.stat) {
  console.log(statMap);
}
