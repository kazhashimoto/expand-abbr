# expand-abbr
expand-abbrは、[Emmet](https://docs.emmet.io/)の構文で記述した省略記法の文字列をHTML要素に展開して標準出力に書き出すコマンドラインインターフェイスです。

## Installation
```
$ mkdir test-package
$ cd test-package/
$ npm init -y
$ echo "@kazhashimoto:registry=https://npm.pkg.github.com" > .npmrc
```

`.npmrc`に自分のPersonal access tokenを追加します。このtokenは、scopeにread:packages権限を有効にしたものを[Developer settings](https://github.com/settings/apps)ページを通じて取得する必要があります。

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
  --class                add class attribute to the primary elements
  --add-style            insert default styles by using a <style> element in
                         the <head> section
  --local                use local path for the src attribute of <img> elements
  --path <prefix>        set the src attribute of img elements to a pathname
                         starting with prefix
  -w,--wrapper <parent>  wrap expanded elements with parent
  -x                     add compiled abbreviation as HTML comment to output
  -d                     print debug info.
  --help                 display help for command
```

expand-abbrは、引数`abbreviation`ごとにHTML要素のツリーに展開し、展開した結果を順に連結して出力します。
```
$ expand-abbr 'ul>li>a'
$ expand-abbr 'header>div' 'dl>(dt+dd)*3' 'footer>p'
$ expand-abbr '(header>ul>li*2>a)+footer>p'
```

`-w`オプションを指定すると、展開した要素全体を`<div>`要素のラッパーで包んだ1つのツリーとして出力します。
```
$ expand-abbr -w .wrapper 'div>p' 'ul>li*2>a'
```
```
<div class="wrapper">
  <div>
    <p></p>
  </div>
  <ul>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
  </ul>
</div>
```

`-h`オプションを指定すると、出力は`<head>`セクションを含んだ1つのHTMLページ(HTML文書)になります。つまり、展開した要素全体は`<body>`タグと`<html>`で囲まれて出力されます。`<head>`セクションの内容は、emmetの省略記法`!`を使って生成したテンプレートが使用されます。
```
$ expand-abbr -h '(div>dl>(dt+dd)*3)+footer>p'
```

外部スタイルシートへのリンクを`<head>`セクションに挿入するには、`-c`オプションを指定します。`-c`オプションはコマンドラインで複数回指定できます。その場合、expand-abbrは、引数に現れた順序で`<link>`要素を追加します。
```
$ expand-abbr -h -c "reset.css" -c "https://www.example.com/style.css" ”div>p”
```
```
<head>
  .....
  <link rel="stylesheet" href="reset.css">
  <link rel="stylesheet" href="https://www.example.com/style.css">
</head>
```

出力される行のインデントはtabです。タブをスペースに置き換えるにはコードフォーマッターを使って整形することができます。次の例では、expand-abbrの出力を[js-beautify](https://github.com/beautify-web/js-beautify)の標準入力を通じてタブをスペース2個に置き換えています。
```
$ expand-abbr -h 'ul>(li>a)*5' | js-beautify --type html -s 2 -n
```

## Examples
デモのソースコードはこちら： https://github.com/kazhashimoto/expand-abbr-demo

次のシェルスクリプト`demo1.sh`は、5個のセクションとそれぞれの見出しへのナビゲーションリンクから成るHTMLページを出力します。
```
#!/bin/bash

header='header>h1{Title}+nav>ul.links>(li>a[href=#s$]{Section $})*5'
main='(section#s$>h2{Section $}+(p.text>lorem)*4+p.top>a[href=#]{Top})*5'
footer='footer>p{&copy; 2023 Example}'

css='style.css'

INDENT="js-beautify --type html -s 2 -n"

expand-abbr -h -c "$css" "$header" "$main" "$footer" | $INDENT
```
このスクリプトの出力をindex.htmlファイルに保存すれば、ブラウザーで開くことができます(macOSでの例)。
```
$ cd demo1
$ chmod +x demo1.sh
$ ./demo1.sh > index.html
$ open index.html
```

`demo1.sh`での変数`header`などのように、Emmetの構文で書かれた文字列をシェルの変数に代入するときは、文字列中の`$`記号をシェルが変数展開するのを防ぐため、文字列全体をシングルクォート（'）で囲みます。

変数をexpand-abbrの引数に指定するときは、ひとまとまりの省略記法として扱われるようにダブルクォート(")で囲みます（例：`"$footer"`）。これは、変数の値が空白を含む文字列の場合、コマンドラインに指定したダブルクォートなしの`$`変数の解釈がシェルによって異なるためです。

例:  
bashの場合、テキスト中の空白文字で2つの引数に分割されてしまい、Emmetが文法エラーになります。
```
bash$ foo='p{hello world}'
bash$ expand-abbr $foo
<p>hello</p>
...
Error: Unexpected character at 5
```

zshの場合、ダブルクォートがなくても1つの引数として解釈されます。
```
zsh% foo='p{hello world}'
zsh% expand-abbr $foo
<p>hello world</p>
```



## ダミーHTML文書の生成
expand-abbrを使って、ランダムなコンテンツを含んだ**ダミーHTML文書**を生成することができます。
引数にキーワード`%root%`を指定すると、expand-abbrはHTML要素をランダムに組み合わせたツリーを出力します。ランダムとはいえ、Emmetを使ってツリーに展開しているため、出力されるHTML文書は文法的に正しいものが得られます。
```
$ expand-abbr -h '%root%' > index.html            
$ open index.html
```

### img要素のsrc属性
expand-abbrが生成するダミーHTML文書では`<img>`要素の`src`属性に設定されるリソースは次の４種類があります。

| Type | URL | Options  |
|:--|:--|:--|
| image | photo*.jpg | `--local`, `--path` |
| image | `https://picsum.photos/`<em>width</em>`/`<em>height</em>`?random=`<em>num</em> | (default) |
| icon | <em>file</em>.svg | `--local`, `--path` |
| icon | `data:image/svg+xml;base64`... | (default) |

デフォルトの場合、imageタイプの`<img>`要素には[Lorem Picsum](https://picsum.photos/)のランダムな画像へのURLが設定されます。

出力例
```
<img src="https://picsum.photos/800/450?random=338" alt="Maxime voluptatem" width="800" height="450">
```
一方、iconタイプの`<img>`要素にはbase64エンコードされた組み込みのSVGデータが埋め込まれます([icons.js](https://github.com/kazhashimoto/expand-abbr/blob/main/bin/icons.js))。
```
<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj....jwvcGF0aD4KPC9zdmc+" alt="" width="24">
```

`--local`オプションを指定すると、`<img>`要素の`src`属性の値は既定のファイル名が設定されます。
```
$ expand-abbr --local '%root%'
```
出力例（一部）
```
<img src="photo4x3_1.jpg" alt="Alias ducimus?" width="600" height="450">
<img src="arrow-left.svg" alt="" width="24">
```

`src`属性の値を`/` を含んだパス名にするには、`--path`オプションの引数にディレクトリのパス名を指定します。
```
$ expand-abbr --path /path/to  "img[src=foo.jpg]"
<img src="/path/to/foo.jpg" alt="">
```
コマンドラインに`--path`が与えられた場合、`--local`オプションも暗黙に有効になります。
```
$ expand-abbr --path /path/to  '%root%' > index.html
$ grep "img src" index.html
<img src="/path/to/photo4x3_1.jpg" alt="Odit excepturi" width="240" height="180">
....
```

### class属性
`--class`オプションを指定すると、expand-abbrは主要なHTML要素に対してclass属性を設定します。設定されるクラスは名前に接頭辞`_x-`が付きます。
```
$ expand-abbr -h --class "%root%"
```
出力例（一部）
```
<header class="_x-header"> ...
<nav class="_x-nav"> ...
```

### ダミーHTML文書のスタイルシート
`--add-style`オプションを指定すると、expand-abbrは出力されるHTML文書の`<head>`セクションに`<style>`要素を挿入し既定のスタイルシートを埋め込みます。このオプションは`-h`オプションも指定しないと効果がありません。

```
$ expand-abbr --add-style -h '%root%'  
```
出力例（一部）
```
<style>
._x-header {width: 100%; background: #000; color: #fff}
._x-footer {box-sizing: border-box; width: 100%; padding: 20px 4%; margin-top: 50px; background: #000; color: #fff}
.......
</style>
```
既定のスタイルには[Open Props](https://open-props.style/)のCSSカスタムプロパティが使用されるため、次の外部スタイルシートを参照する`<link>`要素が`<head>`セクションに挿入されます。
```
<link rel="stylesheet" href="https://unpkg.com/open-props">
<link rel="stylesheet" href="https://unpkg.com/open-props/normalize.min.css">
```

コマンドラインに`--add-style`が与えられた場合、`--class`オプションも暗黙に有効になります。

## Extended Syntax
expand-abbrはダミーHTML文書の生成を可能とするために、Emmetの構文を独自に拡張した次の機能をサポートしています： Elementマクロ, Textマクロ、繰り返し(`%`)オペレーター。

### Elementマクロ
Elementマクロは`%`<em>name</em>`%`という書式の文字列であり、<em>name</em>は別のElementマクロおよびEmmet省略記法を含む式<em>expression</em>への参照です。expand-abbrはElementマクロを再起的に式に展開し、最終的に1つのEmmet構文に置き換えます。Elementマクロの一覧は(macros.js)[https://github.com/kazhashimoto/expand-abbr/blob/main/bin/macros.js]に記述されています。

Elementマクロ`%root%`は、展開されるとダミーHTML文書の`<body>`要素のコンテンツを表すEmmet構文に置き換わります。

### Textマクロ
Textマクロは`__`<em>keyword</em>`__`という書式の文字列であり、その文字列はEmmet省略記法の展開時もしくはHTML文書の出力時に別の文字列に置き換わります。Textマクロは、Emmetの構文において通常のテキストを埋め込める箇所で使用できます。（例: `{...}`の内側, タグの属性`[`<em>attr</em>`]`表記に指定する値など）

- 単語の先頭を大文字にする(capitalize)
- 文字列からコンマ"."やピリオド"."を取り除く

ダミーテキストを生成するTextマクロ。これらは、見出しやリンクの文字列など短いダミーテキストを埋め込むのに役立ちます。このマクロが返すダミーテキストはEmmetのLorem Ipsumジェネレーターを使って生成されますが、書き出しが"lorem ipsum"以外の文字列も返されるように調整されています。

| Textマクロ | 置換される内容 | ワード数 | コンマとピリオド | Capitalize |
|:--|:--|---|:--|:--|
| `__HEADING__` | 見出しに適した長さのダミーテキストで | 4〜8 | なし | 各単語 |
| `__PHRASE__` | リンクのテキストなどに適した２語からなるダミーテキスト | 2 | なし | 最初の語 |
| `__NAME__` | 人名のような２語からなるダミーテキスト | 2 | なし | 各単語 |
| `__DIGEST__` | 短い文のダミーテキスト | 4〜8 | あり | 最初の語 |
| `__MESSAGE__` | ブログのコメントのような短い文のダミーテキスト | 9〜15 | あり | 最初の語 |

ダミーテキスト以外の文字列を生成するTextマクロには次のものがあります。

| Textマクロ | 置換される内容 |
|:--|:--|
| `__SEQ__`<br>`__SEQ`<em>id</em>`__` | 順序番号(1,2,...) |
| `__IMAGE`<em>width</em>`X`<em>height</em>`__` | [Lorem Picsum](https://picsum.photos/)が提供するランダム画像のURL |
| `__DATETIME__` | "YYYY-MM-DD HH:mm"形式の文字列で表されたランダムな日時 |
| `__DATE__` | `<time>`要素の`datetime`属性の値から日付表現に変換した文字列 |

### 繰り返し(%)オペレーター

| 式 | 説明
|:-- |:--|
| `(`<em>expression</em>`)%+`<em>max</em>`%`<br>`(`<em>expression</em>`)%+`<em>min</em>`,` <em>max</em>`%` | 式を`+`オペレーターで<em>N</em>個結合<br>_min_ &le; _N_ &le; _max_ |
| <em>element</em>`%*`<em>max</em>`%`<br><em>element</em>`%*`<em>min</em>`,`<em>max</em>`%` | 要素を`*`オペレーターで<em>N</em>個繰り返し<br>_min_ &le; _N_ &le; _max_ |
| <em>parentTag</em>`%>`<em>tag</em>`{`<em>maxDepth</em>`}`| 親要素と子要素の間にタグを<em>N</em>階層繰り返し挿入<br>0 &le; _N_ &le; _maxDepth_ |


### マクロの使用例
`__HEADING__`マクロは、見出しに適した長さのダミーテキストに置き換えます。返されるダミーテキストは文中にコンマ"."やピリオド"."を含まず、単語の先頭が大文字になります。
```
$ expand-abbr 'h1{__HEADING__}'
```
出力例
```   
<h1>Sint Et Possimus Officia Magni Hic</h1>
```

`__PHRASE__`マクロは、リンクのテキストなどに適した２語からなるダミーテキストに置き換えます。返されるダミーテキストはコンマ"."やピリオド"."を含みません。
```
$ expand-abbr 'ul>li*3>a[href=#]{__PHRASE__}'
```
出力例
```
<ul>
  <li><a href="#">Culpa amet</a></li>
  <li><a href="#">Laborum non</a></li>
  <li><a href="#">Enim obcaecati</a></li>
</ul>
```

`__NAME__`マクロは、人名のような２語からなるダミーテキストに置き換えます。返されるダミーテキストは文中にコンマ"."やピリオド"."を含まず、単語の先頭が大文字になります。
```
$ expand-abbr 'span{__NAME__}'
```
出力例
```
<span>Dolores Porro</span>
```

`__DIGEST__`マクロは、短い文のダミーテキストに置き換えます。
```
$ expand-abbr 'p{__DIGEST__}'
```
出力例
```
<p>Quis quidem nobis nisi hic aspernatur?</p>
```

`__MESSAGE__`マクロは、ブログのコメントのような短い文のダミーテキストに置き換えます。
```
$ expand-abbr 'p{__MESSAGE__}'
```
出力例
```
<p>Optio architecto nihil porro atque eius est animi quod ipsum.</p>
```

`__SEQ__`マクロは、1から始まる番号で置き換えます。Emmetの`$`オペレータとの違いは、`*`オペレーターによって要素が繰り返されたスコープ（親要素）を超えても、番号が1にリセットされない点です。つまり、異なるスコープに渡って通し番号を振ることができます。
例
```
$ expand-abbr 'ul>li*3>{item __SEQ__}' 'ul>li*3>{item __SEQ__}'
```
出力
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
$ expand-abbr 'a[href=page__SEQ__.html]*3{click}'
```
出力
```
<a href="page1.html">click</a>
<a href="page2.html">click</a>
<a href="page3.html">click</a>
```
接頭辞`SEQ`の後に任意の名前を付けることにより、順序番号を発生させる"レジスター"を必要なだけ複数個定義することができます。名前に使用できる文字は、英大文字・数字・アンダースコアです。

次の例では、`<a>`要素のテキストに現れる番号と、`<img>`要素の画像ファイル名に含まれる番号とを異なる連番で割り当てています。
```
$ expand-abbr 'a{page__SEQ1__}' 'div*3>a{page__SEQ1__}+div*2>img[src=photo__SEQ2__.jpg]' 'a{page__SEQ1__}'
```
出力
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

`__IMAGE`<em>width</em>`X`<em>height</em>`__`マクロは、[Lorem Picsum](https://picsum.photos/)が提供するランダム画像のURLに置き換えます。画像の寸法は<em>width</em>と<em>height</em>で指定します。
```
$ expand-abbr 'img[src=__IMAGE800X600__]'
```
出力例
```
<img src="https://picsum.photos/800/600?random=230" alt="">
```

`__DATETIME__`マクロは、ランダムな日時を"YYYY-MM-DD HH:mm"形式の文字列で置き換えます。値となる日時は、実行時に現在の日時を基点として約1年前までの期間の中からランダムに生成されます。`__DATETIME__`マクロは`<time>`要素の`datetime`属性の値として使用します。

`__DATE__`マクロは、`<time>`要素のコンテントとして使用し、`datetime`属性の値から日付表現に変換した文字列で置き換えます。日付の書式はen-USロケールで表記され、`datetime`属性の値をローカルタイムゾーンで解釈したものを表す文字列です。
```
$ expand-abbr 'time[datetime=__DATETIME__]{__DATE__}'
```
出力例
```
<time datetime="2022-03-15 12:52">Mar 15, 2022</time>
```

### %オペレーターの使用例
`%`で囲んだ表記は、Emmetの省略記法の項目や式の後ろに付けると、直前の式に対するランダムな回数の繰り返しを表します。

**(** _expression_ **)%+** _max_ **%**  
**(** _expression_ **)%+** _min, max_ **%**  
式```(```_expression_```)```をEmmetの```+```オペレーターで最大 _max_ 個結合します。結合する式の個数は _min_ 〜 _max_ の乱数です。 _min_ の省略時の値は1です。

例
```
$ expand-abbr '(div>p)%+3%'
```
これは次の3通りのEmmet省略記法のいずれか1つに展開されます。
```
(div>p)
(div>p)+(div>p)
(div>p)+(div>p)+(div>p)
```
例
```
$ expand-abbr '(div>p)%+2,4%'
```
これは次の3通りの記法のいずれか1つに展開されます。
```
(div>p)+(div>p)
(div>p)+(div>p)+(div>p)
(div>p)+(div>p)+(div>p)+(div>p)
```

例
```
$ expand-abbr '(div>p)%+3%+(p>span)%+2,2%'
```
これは次の3通りの記法のいずれか1つに展開されます。
```
(div>p)+(p>span)+(p>span)
(div>p)+(div>p)+(p>span)+(p>span)
(div>p)+(div>p)+(div>p)+(p>span)+(p>span)
```

`%+`オペレーターが修飾する式の中にさらに`%+`を指定することもできます。

例
```
$ expand-abbr '((div>p)%+3%+(p>span))%+2,2%'
```
これは次に示した多数のバリエーションのうちいずれか1つに展開されます。
```
 ((div>p)+(p>span))+((div>p)+(p>span))
 ((div>p)+(p>span))+((div>p)+(div>p)+(p>span))
 ((div>p)+(div>p)+(div>p)+(p>span))+((div>p)+(p>span))
 ((div>p)+(div>p)+(div>p)+(p>span))+((div>p)+(div>p)+(p>span))
 ...
```

_element_ **%\*** _max_ **%**  
_element_ **%\*** _min, max_ **%**  
`%*`オペレーターは、Emmetの`*`オペレーターに変換され、要素<em>element</em>を最大<em>max</em>個繰り返します。繰り返しの回数は<em>min</em>〜<em>max</em>以下の乱数です。<em>min</em>省略時の値は1です。

例
```
$ expand-abbr 'p%3%>span{item $}'
```
これは次の3通りのEmmet省略記法のいずれか1つに展開されます。
```
p*1>span{item $}
p*2>span{item $}
p*3>span{item $}
```

例
```
$ expand-abbr '(p>span{item $})%3%'
```
これは次のいずれか1つに展開されます。
```
(p>span{item $})*1
(p>span{item $})*2
(p>span{item $})*3
```

例
```
$ expand-abbr '(p>span{item $})%2,4%'
```
これは次のいずれか1つに展開されます。
```
(p>span{item $})*2
(p>span{item $})*3
(p>span{item $})*4
```

_parentTag_ **%>** _tag_ **{** _maxDepth_ **}**  
`%>`オペレーターは、 <em>tag</em>要素を最大<em>maxDepth</em>階層入れ子にした構造を、親要素<em>parentTag</em>の子として挿入します。挿入される階層の個数は、0〜<em>maxDepth<//em>の乱数です。

例
```
$ expand-abbr 'header%>div{3}%p'
```
これは次のいずれか1つに展開されます。
```
header>p
header>div>p
header>div>div>p
header>div>div>div>p
```
