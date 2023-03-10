# expand-abbr
expand-abbrは、[Emmet](https://docs.emmet.io/)のシンタックスで記述した省略記法の文字列をHTMLタグに展開して標準出力に書き出すコマンドラインインターフェイスです。

## Installation
```
$ mkdir test-package
$ cd test-package/
$ npm init -y
$ echo "@kazhashimoto:registry=https://npm.pkg.github.com" > .npmrc
```

```.npmrc```に自分のPersonal access tokenを追加します。このtokenは、scopeにread:packages権限を有効にしたものを[Developer settings](https://github.com/settings/apps)ページを通じて取得する必要があります。

```
@kazhashimoto:registry=https://npm.pkg.github.com/

//npm.pkg.github.com/:_authToken=ghp_<PERSONAL_ACCESS_TOKEN>
```

```
$ npm install -g @kazhashimoto/expand-abbr
```

How to uninstall this package:
```
$ npm uninstall -g @kazhashimoto/expand-abbr
```

## Usage
```
Usage: expand-abbr [options] abbreviation ...

Options:
  -V, --version          output the version number
  -h,--head              prepend html header
  -c,--css <stylesheet>  insert a link to an external stylesheet inside head
                         element (default: [])
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

出力されるコードのインデントはtabです。タブをスペースに置き換えるにはコードフォーマッターを使って整形することができます。次の例では、expand-abbrの出力を[js-beautify](https://github.com/beautify-web/js-beautify)の標準入力を通じてタブをスペース2個に置き換えています。
```
$ expand-abbr -h 'ul>(li>a)*5' | js-beautify --type html -s 2 -n
```

外部スタイルシートへのリンクをhead要素に挿入するには、-cオプションを指定します。コマンドラインに-cオプションを複数指定することができます。その場合、コマンドラインに指定した順序で、expand-abbrはlink要素を書き出します。
```
$ expand-abbr -h -c 'reset.css' -c "https://www.example.com/style.css" 'div>p'
```

```
<head>
	.....
	<link rel="stylesheet" href="reset.css">
	<link rel="stylesheet" href="https://www.example.com/style.css">
</head>
```

## Examples
デモのソースコードはこちら： https://github.com/kazhashimoto/expand-abbr-demo

次のシェルスクリプト```demo1.sh```は、5個のセクションとそれぞれの見出しへのナビゲーションリンクから成るページを出力します。
```
#!/bin/bash

header='header>h1{Title}+nav>ul.links>(li>a[href=#s$]{Section $})*5'
main='(section#s$>h2{Section $}+(p.text>lorem)*4+p.top>a[href=#]{Top})*5'
footer='footer>p{&copy; 2023 Example}'

css='style.css'

INDENT="js-beautify --type html -s 2 -n"

expand-abbr -h -c "$css" "$header" "$main" "$footer" | $INDENT
```

シェルの変数にemmet省略記法を値として設定するときは、```$```記号による変数展開を防ぐために、文字列全体をシングルクォート（'）で囲みます。また、これらの変数をexpand-abbrの引数に指定するときは、１つの省略記法として扱うために、ダブルクォート(")で囲みます（例：```"$footer"```）。

このスクリプトの出力をindex.htmlファイルに保存すれば、ブラウザーで開くことができます(macOSでの例)。
```
$ cd demo1
$ chmod +x demo1.sh
$ ./demo1.sh > index.html
$ open index.html
```
