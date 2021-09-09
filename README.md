# expand-abbr
expand-abbrは、[Emmet](https://docs.emmet.io/)のシンタックスで記述した省略記法の文字列をHTMLタグに展開して標準出力に書き出すコマンドラインインターフェイスです。

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

引数abbreviationを複数並べて指定した場合は、展開したそれぞれのスニペットを直列に繋いだHTMLの構造が出力されます。
```
$ expand-abbr 'ul>li>a'
$ expand-abbr 'header>div' 'dl>(dt+dd)*3' 'footer>p'
```

展開したHTMLの構造をさらにラッパーで包むには、-wオプションを指定します。
```
$ expand-abbr -w .wrapper '(header>ul>li*2>a)+footer>p'
```

展開したHTMLの構造を ```<html>```, ```<head>```, ```<body>```要素で包んでHTML文書の体裁にするには、-hオプションを指定します。-wオプションと併用できます。ヘッダの内容は、emmetの省略記法```!```により生成したテンプレートが使用されます。
```
$ expand-abbr -h '(div>dl>(dt+dd)*3)+footer>p'
```
