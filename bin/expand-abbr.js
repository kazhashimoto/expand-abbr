#!/usr/bin/env node

const { program } = require("commander");
const emmet = require('emmet');
const expand = emmet.default;

function collect(value, previous) {
  return previous.concat([value]);
}

program
  .name('expand-abbr')
  .version('1.1.1')
  .usage('[options] abbreviation ...')
  .showHelpAfterError()
  .option('-h,--head', 'prepend html header')
  .option('-c,--css <stylesheet>', 'insert a link to an external stylesheet inside head element', collect, [])
  .option('-w,--wrapper <parent>', 'wrap expanded elements with parent')
  .option('-x', 'add HTML comments to output')

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

/**
 * Taken from
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
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
  const base = getRandomInt(0, 10000);
  const n = x + base % (y - x + 1);
  return `*${n}`;
}

const macroMap = new Map();
macroMap.set('root', [
  '(%section%)%2,5%',
  'div>%textblock%',
  'div>%list%',
  'div>%list%',
  // 'div>img[src=photo1.jpg]+p>(%inline%)',
  // 'div>%list%',
  // 'div>%list%'
]);
macroMap.set('textblock', [
  '(p>%lorem10%)%2,5%',
]);
macroMap.set('list', [
  'ul>(li>%lorem%)%2,5%',
  'ul>(li>%lorem8%)%2,5%',
  'ul>(li>a[href=#]>%lorem2%)%2,5%',
  'ul>(li>a[href=#]>%lorem4%)%2,5%',
]);
macroMap.set('section', [
  'section>h2{Section $}+%textblock%',
  'section>h2{Section $}+div>%textblock%',
]);
macroMap.set('inline', [
  '{%text8%}',
  '({%text%}+span{%text2%})',
  '({%text8%}+span{%text2%})',
]);

function macro(match) {
  const tag = match.replace(/%/g, '');
  let found = tag.match(/^(lorem|text)(\d+)?$/);
  if (found) {
    const n = found[2]? parseInt(found[2]): 4;
    const base = getRandomInt(0, 10000);
    const words = n + base % (n * 2);
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
  const base = getRandomInt(0, 10000);
  let i = base % values.length;
  return values[i];
}

function compile(abbr) {
  let re = /%[a-z]+([0-9]+)?%/g;
  const found = abbr.match(re);
  if (found) {
    let limit = found.length * 5;
    while (limit > 0 && re.test(abbr)) {
      abbr = abbr.replace(re, macro);
      limit--;
    }
    if (!limit) {
      abbr.replace(re, 'div');
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
