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

program.parse(process.argv);
const options = program.opts();

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
  if (options.d) {
    console.log('rand=n,x,y', n, x, y);
  }
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
  'header>(%nav%)',
  'header>(h1>%lorem4%)+(%nav%)',
]);
macroMap.set('pg-footer', [
  'footer>p{&copy;2023 Example}',
  'footer>nav>p>(a[href=page$.html]{page$})%3,5%',
  'footer>(nav>p>(a[href=page$.html]{page$})%3,5%)+p{&copy;2023 Example}'
]);
macroMap.set('nav', [
  'nav>(li>a[href=#s$]{Section $})%3,6%'
]);
macroMap.set('block', [
  'div>(%p%)',
  'div>img[src=photo.jpg]',
  'div>(a[href=#]>(%inline%))',
  'div>(%one-time%)',
  '(div>(%block%))+(%block%)',
  'div>(%block%)+(%block%)',
]);
macroMap.set('one-time', [
  'div>(%list%)',
  'div>(%table%)',
]);
macroMap.set('p', [
  '(p>(%lorem10%))%2,5%',
  '(p>(%inline%))%2,5%'
]);
macroMap.set('list', [
  'ul>(li>(%lorem%))%2,5%',
  'ul>(li>(%lorem8%))%2,5%',
  'ul>(li>a[href=#]>(%lorem2%))%2,5%',
  'ul>(li>a[href=#]>(%lorem4%))%2,5%',
  'dl>(dt>(%lorem2%)^dd>(%lorem4%))%3,6%'
]);
macroMap.set('section', [
  'section>h2{Section $}+div>(%p%)+div>img[src=photo$.jpg]',
  'section>h2{Section $}+div>(%p%)^div>img[src=photo$.jpg]',
  'section>h2{Section $}+div>img[src=photo$.jpg]+div>(%p%)',
  'section>h2{Section $}+div>img[src=photo$.jpg]^div>(%p%)',
]);
macroMap.set('table', [
  'table>thead>tr>(th{item$})*3^^tbody>(tr>(td>lorem4)*3)%3,5%',
  'table>caption>lorem4^thead>tr>(th{item$})*4^^tbody>(tr>(td>lorem4)*4)%3,5%'
]);
macroMap.set('inline', [
  '{%text8%}',
  '({%text%}+span{%text2%})',
  '({%text8%}+span{%text2%})',
]);

const randGenMap = new Map();
for (const key of macroMap.keys()) {
  randGenMap.set(key, new MersenneTwister());
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
  const tag = specifier.replace(/%/g, '');
  found = tag.match(/^(lorem|text)(\d+)?$/);
  if (found) {
    const n = found[2]? parseInt(found[2]): 4;
    const base = mt.random_int();
    const words = n + base % (n * 2);
    if (options.d) {
      console.log('rand=words,n', words, n);
    }
    if (found[1] == 'lorem') {
      return `lorem${words}`;
    } else {
      const text = expand(`lorem${words}*2`).split('\n');
      return text[1];
    }
  }
  const values = macroMap.get(tag);
  if (!values) {
    return 'div.error';
  }
  if (idx >= 0) {
    idx = Math.min(idx, values.length - 1);
  } else {
    const gen = randGenMap.get(tag);
    const base = gen.random_int();
    idx = base % values.length;
    if (options.d) {
      console.log('macro: rand=i,length', idx, values.length);
    }
  }
  abbr = values[idx];
  if (tag == 'one-time') {
    if (abbr) {
      abbr = abbr.slice(0);
      values[idx] = undefined;
    } else {
      return 'div>p{%text4%}';
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
    if (options.d) {
      console.log('macro: rand=n,x,y', n, x, y);
    }
    let expression = abbr;
    for (; n > 1; n--) {
      expression += `+${abbr}`;
    }
    return `(${expression})`;

  }
  return abbr;
}

function compile(abbr) {
  let re = /%[a-z-]+(\d+)?(@\d+)?%/g;
  const found = abbr.match(re);
  if (found) {
    let limit = found.length * 10;
    while (limit > 0 && re.test(abbr)) {
      abbr = abbr.replace(re, macro);
      limit--;
    }
    if (!limit) {
      abbr = abbr.replace(re, 'div.limit');
    }
  }

  re = /%\d+(,\d+)?%/g;
  while (re.test(abbr)) {
    abbr = abbr.replace(re, replacer);
  }
  return abbr;
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
  console.log(expand(abbr));
} else {
  program.args.forEach(abbr => {
    abbr = compile(abbr);
    if (options.x) {
      console.log('<!--', abbr, '-->');
    }
    console.log(expand(abbr));
  });
}
if (options.head) {
  console.log('</html>');
}
