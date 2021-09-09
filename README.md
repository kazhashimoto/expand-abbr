# expand-abbr

## Installation
```
$ mkdir test-package
$ cd test-package/
$ npm init -y
$ echo "@kazhashimoto:registry=https://npm.pkg.github.com" > .npmrc
$ npm install -g @kazhashimoto/expand-abbr
```

How to uninstall this package:
```
$ npm uninstall -g @kazhashimoto/expand-abbr
```

## Usage
```
$ expand-abbr --help
Usage: expand-abbr [options] abbreviation ...

Options:
  -V, --version          output the version number
  -h,--head              prepend html header
  -w,--wrapper <parent>  wrap expanded elements with parent
  --help                 display help for command
```
```
$ expand-abbr 'ul>li>a'
$ expand-abbr 'header>div' 'dl>(dt+dd)*3' 'footer>p'
$ expand-abbr -w .wrapper '(header>ul>li*2>a)+footer>p'
$ expand-abbr -h '(div>dl>(dt+dd)*3)+footer>p'
```
