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
  --picsum               embed a random image via picsum into the document
  -w,--wrapper <parent>  wrap expanded elements with parent
  -x                     add HTML comments to output
  -d                     debug random numbers generated
  --stat                 print counters
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

## Extended Syntax
expand-abbrは、Emmetの省略記法に加えて、組み込みのマクロを呼び出すための拡張構文をサポートします。


### 文字列置換マクロ
**\_\_HEADING\_\_**

例
```
$ expand-abbr "h1{__HEADING__}"
```
結果
```   
<h1>Sint Et Possimus Officia Magni Hic</h1>
```

**\_\_PHRASE\_\_**

例
```
$ expand-abbr "ul>li*3>a[href=#]{__PHRASE__}"
```
結果
```
<ul>
  <li><a href="#">Culpa amet</a></li>
  <li><a href="#">Laborum non</a></li>
  <li><a href="#">Enim obcaecati</a></li>
</ul>
```

**\_\_SEQ\_\_**

例
```
$ expand-abbr "ul>li*3>{item __SEQ__}" "ul>li*3>{item __SEQ__}"
```
結果
```
<ul>
  <li>item 1</li>
  <li>item 2</li>
  <li>item 3</li>
</ul>
<ul>
  <li>item 4</li>
  <li>item 5</li>
  <li>item 6</li>
</ul>
```

例
```
$ expand-abbr "a{page__SEQ1__}" "div*3>a{page__SEQ1__}+div*2>img[src=photo__SEQ2__.jpg]" "a{page__SEQ1__}"
```
結果
```
<a href="">page1</a>
<div>
  <a href="">page2</a>
  <div><img src="photo1.jpg" alt=""></div>
  <div><img src="photo2.jpg" alt=""></div>
</div>
<div>
  <a href="">page3</a>
  <div><img src="photo3.jpg" alt=""></div>
  <div><img src="photo4.jpg" alt=""></div>
</div>
<div>
  <a href="">page4</a>
  <div><img src="photo5.jpg" alt=""></div>
  <div><img src="photo6.jpg" alt=""></div>
</div>
<a href="">page5</a>
```

例
```
% bin/expand-abbr.js "a[href=page__SEQ__.html]*3{click}"
```
結果
```
<a href="page1.html">click</a>
<a href="page2.html">click</a>
<a href="page3.html">click</a>
```

**\_\_IMAGE** _width_ **X** _height_ **\_\_**

例
```
$ expand-abbr "img[src=__IMAGE800X600__]"
```
結果
```
<img src="https://picsum.photos/800/600?random=230" alt="">
```

### %オペレーター

例
```
$ expand-abbr "p%5%>span{item $}"
```
```
$ expand-abbr "(p>span{item $})%3%"
```

結果
```
<p><span>item 1</span></p>
<p><span>item 2</span></p>
<p><span>item 3</span></p>
```

例
```
$ expand-abbr "(p>span{item $})%4,6%"
```

**%>** _tag_ **{** _depth_ **}**

例
```
$ expand-abbr "header%>div{3}%p"
```

結果
```
<header>
  <p></p>
</header>
```
```
<header>
  <div>
    <div>
      <p></p>
    </div>
  </div>
</header>
```
