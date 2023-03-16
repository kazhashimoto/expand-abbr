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
  '%pg-header-content%',
  'div%>div{1}%(%pg-header-content%)'
]);
macroMap.set('pg-header-content', [
  'header%>div{1}%(%nav%)',
  'header%>div{1}%((h1>%lorem4%)+(%nav%))',
  'header%>div{1}%(h1>%lorem4%)+(%nav%)',
  'header%>div{1}%(h1>%lorem4%)+div>(%nav%)',
]);
macroMap.set('pg-footer', [
  '%pg-footer-content%',
  'div%>div{1}%(%pg-footer-content%)'
]);
macroMap.set('pg-footer-content', [
  'footer%>div{1}%p{&copy;2023 Example}',
  'footer%>div{1}%nav>p>(a[href=page$.html]{page$})%3,5%',
  'footer%>div{1}%(nav>p>(a[href=page$.html]{page$})%3,5%)+p{&copy;2023 Example}'
]);
macroMap.set('nav', [
  'nav>ul>(li>a[href=#s$]{Section $})%3,6%'
]);
macroMap.set('block', [
  '%block-content%',
  'div%>div{2}%(%block-content%)',
  '(div>(%block%))+(%block%)',
  '(%block%)+div>(%block%)',
  'div>(%block%)+div>(%block%)',
]);
macroMap.set('block-content', [
  '%p%',
  'img[src=photo.jpg]',
  'a[href=#]>(%inline%)',
  '%one-time%'
]);
macroMap.set('one-time', [
  '%list%',
  '%table%',
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
  const item = specifier.replace(/%/g, '');
  found = item.match(/^(lorem|text)(\d+)?$/);
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
  re = /^>([a-z]+){(\d+)}$/;
  found = item.match(re);
  if (found) {
      let tag = found[1];
      let depth = found[2];
      abbr = '';
      for (let i = 0; i < depth; i++) {
        const p = mt.random_incl();
        if (p < 0.4) {
          break;
        }
        abbr += `>${tag}`;
      }
      return `${abbr}>`;
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
    if (options.d) {
      console.log('macro: rand=i,length', idx, values.length);
    }
  }
  abbr = values[idx];
  if (item == 'one-time') {
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
  let re = /%>?[a-z-]+(\d+)?({\d+})?(@\d+)?%/g;
  const found = abbr.match(re);
  if (found) {
    let limit = found.length * 20;
    while (limit > 0 && re.test(abbr)) {
      abbr = abbr.replace(re, macro);
      limit--;
    }
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
