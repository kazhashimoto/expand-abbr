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

## ダミーHTML文書の生成
引数にキーワード```%root%```を指定すると、expand-abbrはHTML要素のツリー構造をランダムに組み合わせた**ダミーHTML文書**を出力します。
```
% expand-abbr -h "%root%" > index.html            
% open index.html
```
デフォルトの場合、ダミーHTML文書に書き出される&lt;img>要素について、```src```属性の値は```photo```で始まるjpgファイル名、```alt```属性の値はダミーテキスト(Lorem Ipsum)が設定されます。

引数```--picsum```を指定してダミーHTML文書を生成すると、&lt;img>要素に[Lorem Picsum](https://picsum.photos/)からのランダムな画像を埋め込むことができます。
```
% expand-abbr -h --picsum "%root%"
```
例
```
<img src="https://picsum.photos/800/450?random=338" alt="Maxime voluptatem" width="800" height="450">
```

## Extended Syntax
ダミーHTML文書の生成を可能とするために、expand-abbrはEmmetの省略記法に対して独自に拡張した構文をサポートしています。

- ダミーテキストの表記調整: \_\_ _keyword_ \_\_
- グローバルなスコープをもつ順序番号: \_\_ SEQ \_\_
- picsumイメージの埋め込み: \_\_ _IMAGE_ \_\_
- ランダムな繰り返し回数の指定: %オペレーター

### ダミーテキストの表記調整: \_\_ _keyword_ \_\_
\_\_ _keyword_ \_\_変数は、EmmetのLorem Ipsumジェネレーターを使って取得したダミーテキストに対して、次の方法を組み合わせて表記を調整したテキストに置き換えます。これらの変数は、Emmetの構文で通常のテキストを埋め込める箇所で使用できます。（例: {...}の内側, タグの属性[attr]表記に指定する値）

- 単語の先頭を大文字にする(capitalize)
- 文字列からコンマ"."やピリオド"."を取り除く
- 書き出しが"lorem ipsum"以外の文字列も選ばれるようにする

これらの機能は、見出しやリンクの文字列など短いダミーテキストを埋め込むのに役立ちます。

**\_\_HEADING\_\_**  
```__HEADING__```変数は、見出しに適した長さのダミーテキストに置き換えます。返されるダミーテキストは単語の先頭が大文字で、文中にコンマ"."やピリオド"."を含みません。

例
```
$ expand-abbr "h1{__HEADING__}"
```
結果
```   
<h1>Sint Et Possimus Officia Magni Hic</h1>
```

**\_\_PHRASE\_\_**  
```__PHRASE__```変数は、リンクのテキストなどに適した２語からなるダミーテキストに置き換えます。返されるダミーテキストはコンマ"."やピリオド"."を含みません。

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

### グローバルなスコープをもつ順序番号: \_\_ SEQ \_\_  
```__SEQ__```変数は、1から始まる番号で置き換えます。Emmetの```$```オペレータとの違いは、```*```オペレーターによって要素が繰り返されたスコープ（親要素）を超えても、番号が1にリセットされない点です。つまり、異なるスコープに渡って通し番号を振ることができます。

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
% bin/expand-abbr.js "a[href=page__SEQ__.html]*3{click}"
```
結果
```
<a href="page1.html">click</a>
<a href="page2.html">click</a>
<a href="page3.html">click</a>
```
接頭辞```SEQ```の後に任意の名前を付けることにより、順序番号を"発生"させる"レジスター"を必要なだけ複数個定義することができます。名前に使用できる文字は、英大文字・数字・アンダースコアです。

次の例では、&lt;a>要素のテキストに現れる番号と、&lt;img>要素の画像ファイル名に含まれる番号とを異なる連番で割り当てています。

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

### picsumイメージの埋め込み: \_\_ _IMAGE_ \_\_
**\_\_IMAGE** _width_ **X** _height_ **\_\_**  
```__IMAGE__```変数は、[Lorem Picsum](https://picsum.photos/)が提供するランダム画像のURLに置き換えます。画像のサイズは、```IMAGE```の後ろに _width_ ```X``` _height_ で指定します。

例
```
$ expand-abbr "img[src=__IMAGE800X600__]"
```
結果
```
<img src="https://picsum.photos/800/600?random=230" alt="">
```

### ランダムな繰り返し回数の指定: %オペレーター  
```%```で囲んだ表記は、Emmetの省略記法の項目や式の後ろに付けると、直前の式に対するランダムな回数の繰り返しを表します。

**(** _expression_ **)%+** _max_ **%**  
**(** _expression_ **)%+** _min, max_ **%**  
式```(```_expression_```)```をEmmetの```+```オペレーターで最大 _max_ 個結合します。結合する式の個数は _min_ 〜 _max_ の乱数です。 _min_ の省略時の値は1です。

例
```
$ expand-abbr "(div>p)%+3%"
```
これは次の3通りのEmmet省略記法のいずれか1つに展開されます。
```
(div>p)
(div>p)+(div>p)
(div>p)+(div>p)+(div>p)
```
```
$ expand-abbr "(div>p)%+2,4%"
```
これは次の3通りのEmmet省略記法のいずれか1つに展開されます。
```
(div>p)+(div>p)
(div>p)+(div>p)+(div>p)
(div>p)+(div>p)+(div>p)+(div>p)
```

例
```
$ expand-abbr "(div>p)%+3%+(p>span)%+2,2%"
```
これは次の3通りのEmmet省略記法のいずれか1つに展開されます。
```
(div>p)+(p>span)+(p>span)
(div>p)+(div>p)+(p>span)+(p>span)
(div>p)+(div>p)+(div>p)+(p>span)+(p>span)
```

```%+```オペレーターが修飾する式の中にさらに```%+```を指定することもできます。

例
```
$ expand-abbr "((div>p)%+3%+(p>span))%+2,2%"
```
これは次に示した多数のバリエーションのうちいずれか1つに展開されます。
```
 ((div>p)+(p>span))+((div>p)+(p>span))
 ((div>p)+(p>span))+((div>p)+(div>p)+(p>span))
 ((div>p)+(div>p)+(div>p)+(p>span))+((div>p)+(p>span))
 ((div>p)+(div>p)+(div>p)+(p>span))+((div>p)+(div>p)+(p>span))
 ...
```

_element_ **%** _max_ **%**  
_element_ **%** _min, max_ **%**  
```%*```オペレーターは、Emmetの```*```オペレーターに変換され、要素 _element_ を最大 _max_ 個繰り返します。繰り返しの回数は _min_ 〜 _max_ 以下の乱数です。 _min_ 省略時の値は1です。

例
```
$ expand-abbr "p%3%>span{item $}"
```
これは次の3通りのEmmet省略記法のいずれか1つに展開されます。
```
p*1>span{item $}
p*2>span{item $}
p*3>span{item $}
```

例
```
$ expand-abbr "(p>span{item $})%3%"
```
これは次のいずれか1つに展開されます。
```
(p>span{item $})*1
(p>span{item $})*2
(p>span{item $})*3
```

例
```
$ expand-abbr "(p>span{item $})%2,4%"
```
これは次のいずれか1つに展開されます。
```
(p>span{item $})*2
(p>span{item $})*3
(p>span{item $})*4
```

_parentTag_ **%>** _tag_ **{** _maxDepth_ **}**  
```%>```オペレーターは、 _tag_ 要素を最大 _maxDepth_ 階層入れ子にした構造を、親要素 _parentTag_ の子として挿入します。挿入される階層の個数は、0〜 _maxDepth_ の乱数です。

例
```
$ expand-abbr "header%>div{3}%p"
```
これは次のいずれか1つに展開されます。
```
header>p
header>div>p
header>div>div>p
header>div>div>div>p
```
