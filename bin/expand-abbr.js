#!/usr/bin/env node

const { program } = require("commander");
const emmet = require('emmet');
const expand = emmet.default;

program
  .name('expand-abbr')
  .version('1.0.0')
  .usage('[options] abbreviation ...')
  .showHelpAfterError();

program.parse(process.argv);
// const options = program.opts();

program.args.forEach(abbr => {
  console.log(expand(abbr));
});
