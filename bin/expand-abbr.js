#!/usr/bin/env node

const { program } = require("commander");
const emmet = require('emmet');
const expand = emmet.default;
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

function replacer(match) {
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

const macroMap = new Map();
macroMap.set('root', [
  '%pg-main-content%',
  '(%pg-header%)+(%pg-main-content%)',
  '(%pg-header%)+(%pg-main-content%)+(%pg-footer%)',
  '(%pg-main-content%)+(%pg-footer%)'
]);
macroMap.set('pg-main-content', [
  '(%section%)%3,6%',
  '(%block%)%+3,6%',
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
macroMap.set('block', [
  '(%block-content%)%+6%',
  '(((div>(%block-content%))+(div>(%block-content%)))%+3%',
  '(((div>(%block-content%))+(div>(%block-content%))+(div>(%block-content%)))%+3%'
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
  'div>(%p%)+(%anchor%)+(%img%)',
  '%one-time%'
]);
macroMap.set('one-time', [
  '%list%',
  '%table%',
]);
macroMap.set('p', [
  'p%2,5%>lorem10',
  'p%5%>span>lorem2^lorem8',
  'p%5%>lorem8+span>lorem2',
  'p%5%>a[href=page$.html]>lorem2^lorem8',
  'p%5%>a>lorem2+span>lorem2',
  'p%5%>lorem8+a[href=page$.html]>lorem2',
  'p%5%>lorem6+a[href=page$.html]>lorem2+span>lorem2'
]);
macroMap.set('img', [
  'div>img[src=photo.jpg]',
  'div%3%>img[src=photo$.jpg]'
]);
macroMap.set('anchor', [
  'div>a[href=#]>lorem4',
  'div>a[href=#]>span>lorem4',
  'div>a[href=#]>img[src=button.svg]',
]);
macroMap.set('list', [
  'ul>li%2,5%>lorem4-8',
  'ul>li%2,5%>lorem8-16',
  'ul>li%2,5%>a[href=page$.html]>lorem2-4',
  'ul>li%2,5%>a[href=page$,html]>lorem4-8',
  'dl>(dt>lorem2-4^dd>lorem4-8)%3,6%'
]);
macroMap.set('section', [
  '%section-content%',
  'div%>div{1}%(%section-content%)'
]);
macroMap.set('section-content', [
  'section>(%section-inner%)',
  'section%>div{1}%(%section-inner%)',
]);
macroMap.set('section-inner', [
  '(%section-heading%)+(%section-body%)',
]);
macroMap.set('section-heading', [
  'h2{Section $}',
  'div>h2{Section $}'
]);
macroMap.set('section-body', [
  '(%section-body-content%)%3%'
]);
macroMap.set('section-body-content', [
  'div>(%p%)+div>img[src=photo$.jpg]',
  'div>(%p%)^div>img[src=photo$.jpg]',
  'div>img[src=photo$.jpg]+div>(%p%)',
  'div>img[src=photo$.jpg]^div>(%p%)',
]);
macroMap.set('table', [
  'table>thead>tr>th*3{item$}^^tbody>tr%3,5%>td*3>lorem4',
  'table>caption>lorem4^thead>tr>th*4{item$}^^tbody>tr%3,5%>td*4>lorem4'
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
  if (item == 'one-time') {
    if (abbr) {
      abbr = abbr.slice(0);
      values[idx] = undefined;
    } else {
      return 'div>p>lorem4-8';
    }
  }
  re = /%\+\d+(,\d+)?%/;
  found = abbr.match(re);
  if (found) {
    const range = found[0].replace(/%/g, '').replace(/^\+/, '').split(',')
        .map(x => isNaN(x)? 1: parseInt(x));
    abbr = abbr.replace(re, '');
    if (!range.length) {
      return abbr;
    }
    let x, y;
    if (range.length === 1) {
      x = 1;
      y = range[0];
    } else {
      [x, y] = range;
    }
    if (x > y) {
      return abbr;
    }
    const base = mt.random_int();
    let n = x + base % (y - x + 1);
    debug('macro: rand=n,x,y', n, x, y);
    let expression = abbr;
    for (; n > 1; n--) {
      expression += `+${abbr}`;
    }
    return `(${expression})`;

  }
  return abbr;
}

function compile(abbr) {
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

  re = /%\d+(,\d+)?%/g;
  while (re.test(abbr)) {
    abbr = abbr.replace(re, replacer);
  }
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

function replaceText(specifier) {
  let text = '';
  const re = /__([A-Z_]+)__/;
  const found = specifier.match(re);
  if (found) {

    const macro = found[1];
    if (macro == 'HEADING') {
      text = getLoremText('lorem6*3', 1, false, true);
    }
  }
  return text;
}

function outputHTML(abbr) {
  const html = expand(abbr).replace(/__[A-Z_]+__/g, replaceText);
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
  // console.log(expand(abbr));
  outputHTML(abbr);
} else {
  program.args.forEach(abbr => {
    abbr = compile(abbr);
    if (options.x) {
      console.log('<!--', abbr, '-->');
    }
    // let html = expand(abbr).replace(/__[A-Z_]+__/g, replaceText);
    // console.log(html);
    outputHTML(abbr);
    // console.log(expand(abbr));
  });
}
if (options.head) {
  console.log('</html>');
}
if (options.stat) {
  console.log(statMap);
}
