#!/usr/bin/env node

const { program } = require("commander");
const emmet = require('emmet');
const expand = emmet.default;

program
  .name('expand-abbr')
  .version('1.0.6')
  .usage('[options] abbreviation ...')
  .showHelpAfterError()
  .option('-h,--head', 'prepend html header')
  .option('-w,--wrapper <parent>', 'wrap expanded elements with parent')

program.parse(process.argv);
const options = program.opts();

function concat(abbr_list) {
  let expression = '';
  abbr_list.forEach(abbr => {
    if (expression) {
      expression += '+';
    }
    expression += `(${abbr})`;
  });
  return expression;
}

if (options.head) {
  let str = expand('!');
  str = str.replace(/<body>[^]*<\/html>/, '');
  process.stdout.write(str);
}
if (options.head || options.wrapper) {
  let root = '';
  if (options.head) {
    root = 'body>';
  }
  if (options.wrapper) {
    root += `${options.wrapper}>`
  }
  console.log(expand(root + concat(program.args)));
} else {
  program.args.forEach(abbr => {
    console.log(expand(abbr));
  });
}
if (options.head) {
  console.log('</html>');
}
