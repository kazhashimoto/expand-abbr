#!/usr/bin/env node

const { program } = require("commander");
const emmet = require('emmet');
const expand = emmet.default;

program
  .name('expand-abbr')
  .version('1.0.0')
  .usage('[options] abbreviation ...')
  .showHelpAfterError()
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

if (options.wrapper) {
  // console.log(expand(options.wrapper));
  console.log(expand(options.wrapper + '>' + concat(program.args)));
} else {
  program.args.forEach(abbr => {
    console.log(expand(abbr));
  });
}
