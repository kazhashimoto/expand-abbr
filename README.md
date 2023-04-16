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
  -V, --version              output the version number
  -h,--head                  prepend html header
  -w,--wrapper <parent>      wrap expanded elements with div.parent
  --local                    use local path for the src attribute of <img>
                             elements
  --path <prefix>            set the src attribute of img elements to a
                             pathname starting with prefix
  -c,--css <stylesheet>      insert a link to an external stylesheet inside
                             head element (default: [])
  -f,--load-macros <module>  load user defined macros from <module>
  -l,--list-macros           list Element macros
  -m,--macro <key_value>     add Element macro definition (default: [])
  -q,--query <key>           print Element macro that matches <key>
  --dark                     apply dark theme on the generated page
  -t,--tab                   use a tab character for indenting instead of
                             spaces. (default: 2 spaces)
  --without-style            If this option disabled, insert default styles by
                             using a <style> element in the <head> section
  -x                         add compiled abbreviation as HTML comment to
                             output
  --check                    check for inconsistency in macro definitions and
                             in style rules
  -d                         print debug info.
  --help                     display help for command
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

出力行のインデント１個の幅はスペース2個です。`-t`オプションを指定すると、タブ文字を使用してインデントします。

## Examples
デモのソースコードはこちら： https://github.com/kazhashimoto/expand-abbr-demo

次のシェルスクリプト`demo1.sh`は、5個のセクションとそれぞれの見出しへのナビゲーションリンクから成るHTMLページを出力します。
```
#!/bin/bash

header='header>h1{Title}+nav>ul.links>(li>a[href=#s$]{Section $})*5'
main='(section#s$>h2{Section $}+(p.text>lorem)*4+p.top>a[href=#]{Top})*5'
footer='footer>p{&copy; 2023 Example}'

css='style.css'

expand-abbr -h -c "$css" "$header" "$main" "$footer"
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
expand-abbrが生成するダミーHTML文書では、`<img>`要素の`src`属性に設定されるリソースは、デフォルトの場合、[Lorem Picsum](https://picsum.photos/)のランダムな画像へのURLです。
```
<img src="https://picsum.photos/800/450?random=338" alt="Maxime voluptatem" width="800" height="450">
```

`--local`オプションを指定すると、`<img>`要素の`src`属性の値は既定のファイル名が設定されます。
```
$ expand-abbr --local '%root%'
```
出力例（一部）
```
<img src="photo4x3_1.jpg" alt="Alias ducimus?" width="600" height="450">
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

### ダミーHTML文書のスタイルシート
`-h`オプションが与えられた場合、expand-abbrは出力されるHTML文書の`<head>`セクションに`<style>`要素を挿入し既定のスタイルシートを埋め込みます。
```
$ expand-abbr -h '%root%' | more
```
```
<style>
._x-pg-header-content_header {box-sizing: border-box; width: 100%; padding: 10px 4%}
._x-pg-footer-content_footer {box-sizing: border-box; width: 100%; padding: 20px 4%; margin-top: 50px}
....
</style>
```
このスタイリングのために、expand-abbrは主要なHTML要素に対してclass属性を設定します。設定されるクラスは名前に接頭辞`_x-`が付きます。

```
$ expand-abbr -h '%root%' | grep class | more
```
```
<div class="_x-pg-header_div">
  <header class="_x-pg-header-content_header">
    <nav class="_x-nav_nav">
    ....
```
既定のスタイルには[Open Props](https://open-props.style/)のCSSカスタムプロパティが使用されるため、次の外部スタイルシートを参照する`<link>`要素が`<head>`セクションに挿入されます。
```
<link rel="stylesheet" href="https://unpkg.com/open-props">
<link rel="stylesheet" href="https://unpkg.com/open-props/normalize.min.css">
```

`--without-style`オプションを指定すると、expand-abbrは既定のスタイルシートの埋め込みを抑止し、要素にクラス属性も挿入しません。
```
$ expand-abbr -h --without-style '%root%'
```

## Extended Syntax
expand-abbrはダミーHTML文書の生成を可能とするために、Emmetの構文を独自に拡張した次の機能をサポートしています： Elementマクロ, Textマクロ、繰り返し(`%`)オペレーター。

### Elementマクロ
Elementマクロは`%`<em>name</em>`%`という書式の文字列であり、<em>name</em>は別のElementマクロおよびEmmet省略記法を含む式<em>expression</em>への参照です。expand-abbrはElementマクロを再起的に式に展開し、最終的に1つのEmmet構文に置き換えます。

組み込みのElementマクロ`%root%`は、展開されるとダミーHTML文書の`<body>`要素のコンテンツを表すEmmet構文に置き換わります。

`-l`オプションを指定すると、expand-abbrはElementマクロの一覧を表示します。
```
$ expand-abbr -l
```
組み込みElementマクロの一覧は[macros.js](https://github.com/kazhashimoto/expand-abbr/blob/main/bin/macros.js)で確認できます。

#### ユーザー定義のElementマクロ
ユーザー定義のElementマクロを追加できます。コマンドラインから指定する方法と、外部ファイルから読み込ませる方法があります。いずれの場合も、ユーザー定義のElementマクロは組み込みのElementマクロの一覧に追加されます。

`-m`オプションの引数に<em>key</em>と<em>value</em>のペアを指定することにより、`key`という名前のElementマクロを追加します。
```
$ expand-abbr -m 'foo:p>span' -m 'bar:div>%foo%' 'div>h3+(%bar%)'
```
```
<section>
  <h3></h3>
  <div>
    <p><span></span></p>
  </div>
</section>
```

`-m`オプションで指定した`key`に一致する名前を持つElementマクロがすでに存在する場合、そのマクロの値のリストに追加されます。
```
$ expand-abbr -m 'root:div>p' -q root
```
```    
[ '(%pg-header%)+(%pg-main-content%)+(%pg-footer%)', 'div>p' ]
```

ユーザー定義のElementマクロを記述したJavaScriptのモジュールを`-f`オプションまたは`--load-macro`オプションの引数に指定して、expand-abbrに読み込ませることができます。
読み込ませるファイルはCommonJSのモジュールとして記述し、`macroMap`オブジェクトをエクスポートするように設定します。
```
const macroMap = new Map();
module.exports.macroMap = macroMap;
```
そして、マクロ名を<em>key</em>として、`macroMap`オブジェクトの`set`メソッドで<em>value</em>の配列を値として登録します。
```
macroMap.set('key', [ value, ... ]);
```

例: my-macro.js
```
const macroMap = new Map();
module.exports.macroMap = macroMap;

macroMap.set('my-root', [
  'div>(%root%)',
  '(%my-header%)+(%my-content%)'
]);
macroMap.set('my-header', [
  'header>h1{__HEADING__}'
]);
macroMap.set('my-content', [
  'div*3>p>lorem10'
]);
```
オプションの引数に指定するモジュールのパス名は、カレントディレクトリからの相対もしくは絶対パスです。ファイルの検索順序に関して、Node.jsの`node_modules`ディレクトリは関係ありません。
```
$ expand-abbr -f my-macro.js -h '%my-root%'
```

#### マクロの値のインデックス指定
マクロ`%`<em>name</em>`%`が与えられた時、expand-abbrは、キー値<em>name</em>を持つ`macroMap`の値の配列の中から1個をランダムに選び、その文字列でマクロを置換します。
配列の中で、置換に使用される値を固定するには、書式`%`<em>name</em>`@`<em>index</em>`%`により配列のインデックスを指定します。
```
$ expand-abbr -m 'box:div{1}' -m 'box:div{2}' -m 'box:div{3}' -q box   
[ 'div{1}', 'div{2}', 'div{3}' ]
```
```
$ expand-abbr -m 'box:div{1}' -m 'box:div{2}' -m 'box:div{3}' '%box@2%'
<div>3</div>
```

### Textマクロ
Textマクロは`__`<em>keyword</em>`__`という書式の文字列であり、その文字列はEmmet省略記法の展開時もしくはHTML文書の出力時に別の文字列に置き換わります。Textマクロは、Emmetの構文において通常のテキストを埋め込める箇所で使用できます。（例: `{...}`の内側, タグの属性`[`<em>attr</em>`]`表記に指定する値など）

ダミーテキストを生成するTextマクロ。これらは、見出しやリンクの文字列など短いダミーテキストを埋め込むのに役立ちます。このマクロが返すダミーテキストはEmmetのLorem Ipsumジェネレーターを使って生成されますが、書き出しが"lorem ipsum"以外の文字列も返されるように調整されています。

| Textマクロ | 置換される内容 | ワード数 | コンマとピリオド | Capitalize |
|:--|:--|---|:--|:--|
| `__HEADING__` | 見出しに適した長さのダミーテキスト | 4〜8 | なし | 各単語 |
| `__HEADING_SHORT__` | 大見出しに適した短いダミーテキスト | 4〜6 | なし | 各単語 |
| `__PHRASE__` | リンクのテキストなどに適した２語からなるダミーテキスト | 2 | なし | 最初の語 |
| `__NAME__` | 人名のような２語からなるダミーテキスト | 2 | なし | 各単語 |
| `__DIGEST__` | 短い文のダミーテキスト | 4〜8 | あり | 最初の語 |
| `__MESSAGE__` | ブログの投稿のような短い文のダミーテキスト | 9〜15 | あり | 最初の語 |
| `__COMMENT__` | ブログのコメントのような短い文のダミーテキスト。絵文字を含む | 10〜30 | あり | 最初の語 |
| `__HYPERTEXT`<em>words</em>`X`<em>count</em>`__` | 文章中にハイパーリンクや数字、括弧などを含む、記事本文に適した長さのテキスト | `words` * `count` | 含む | 各文の最初の語 |

ダミーテキスト以外の文字列を生成するTextマクロには次のものがあります。

| Textマクロ | 置換される内容 |
|:--|:--|
| `__SEQ__`<br>`__SEQ`<em>id</em>`__` | 順序番号(1,2,...) |
| `__IMAGE`<em>width</em>`X`<em>height</em>`__` | [Lorem Picsum](https://picsum.photos/)が提供するランダム画像のURL |
| `__DATETIME__` | "YYYY-MM-DD HH:mm"形式の文字列で表されたランダムな日時 |
| `__DATE__` | `<time>`要素の`datetime`属性の値から日付表現に変換した文字列 |

#### Textマクロの使用例
例
```
$ expand-abbr 'h2{__HEADING__}'
```
```   
<h2>Eum Sed Quidem Voluptatem Facilis Nulla</h2>
```

例
```
$ expand-abbr 'h1{__HEADING_SHORT__}'
```
```
<h1>Unde Quo Blanditiis Rerum Beatae</h1>
```

例
```
$ expand-abbr 'ul>li*3>a[href=#]{__PHRASE__}'
```
```
<ul>
  <li><a href="#">Culpa amet</a></li>
  <li><a href="#">Laborum non</a></li>
  <li><a href="#">Enim obcaecati</a></li>
</ul>
```

例  
```
$ expand-abbr 'span{__NAME__}'
```
```
<span>Dolores Porro</span>
```

例
```
$ expand-abbr 'p{__DIGEST__}'
```
```
<p>Quis quidem nobis nisi hic aspernatur?</p>
```

例
```
$ expand-abbr 'p{__MESSAGE__}'
```
```
<p>Optio architecto nihil porro atque eius est animi quod ipsum.</p>
```

`__COMMENT__`マクロは文末に絵文字が0〜5個、ランダムに追加されたダミーテキストを生成します。

例
```
% expand-abbr 'p{__COMMENT__}'
```
```
<p>Provident voluptatibus maiores eveniet quia dicta vitae nesciunt repellendus vel aliquam enim cum distinctio quos, porro neque quasi optio!&#x1F44D;&#x1F600;&#x1F3B5;</p>
```

`__HYPERTEXT`<em>words</em>`X`<em>count</em>`__`マクロは、ワード数`words`個からなる文を`count`個連結した文章を生成します。Lorem ipsumのダミーテキストに加えて、次の要素がランダムに埋め込まれます（テキストの長さが短い場合、すべての要素が出現するとは限りません）。

- ハイパーリンク
- 数字
- 括弧"(", ")"

また、記事本文に使える「読みやすい」文章に見せるため、expand-abbrは、ダミーテキストに対して次の加工を施した文章を出力します。

- 過剰なコンマ","を取り除く
- 文末の"!"や"?"記号を高い確率でピリオド"."に置き換える
- 1語や2語だけの文を、前後の文いずれかと連結し、文の長さを調節する

例
```
$ bin/expand-abbr 'p{__HYPERTEXT10X2__}'
```
```
<p>Accusantium nam omnis ipsam nesciunt odit ea aperiam quos placeat. Odit voluptatum harum quisquam pariatur <a href="https://www.google.com/search?q=dolore">dolore</a> 1,167 aliquid explicabo iste nemo.</p>
```

`__SEQ__`マクロは、1から始まる番号で置き換えます。Emmetの`$`オペレータとの違いは、`*`オペレーターによって要素が繰り返されたスコープ（親要素）を超えても、番号が1にリセットされない点です。つまり、異なるスコープに渡って通し番号を振ることができます。

例
```
$ expand-abbr 'ul>li*3>{item __SEQ__}' 'ul>li*3>{item __SEQ__}'
```
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
```
<img src="https://picsum.photos/800/600?random=230" alt="">
```

`__DATETIME__`マクロは、ランダムな日時を"YYYY-MM-DD HH:mm"形式の文字列で置き換えます。値となる日時は、実行時に現在の日時を基点として約1年前までの期間の中からランダムに生成されます。`__DATETIME__`マクロは`<time>`要素の`datetime`属性の値として使用します。

`__DATE__`マクロは、`<time>`要素のコンテントとして使用し、`datetime`属性の値から日付表現に変換した文字列で置き換えます。日付の書式はen-USロケールで表記され、`datetime`属性の値をローカルタイムゾーンで解釈したものを表す文字列です。
```
$ expand-abbr 'time[datetime=__DATETIME__]{__DATE__}'
```
```
<time datetime="2022-03-15 12:52">Mar 15, 2022</time>
```

### 繰り返し(%)オペレーター
繰り返しオペレーターは、Emmet省略記法の構文の式や項の後ろに`%`<em>specifier</em>`%`の書式で指定される文字列です。<em>specifier</em>は、繰り返しの対象と回数を表します。

| 式 | 説明 |
|:-- |:--|
| `(`<em>expression</em>`)%+`<em>max</em>`%`<br>`(`<em>expression</em>`)%+`<em>min</em>`,` <em>max</em>`%` | 式<em>expression</em>を`+`オペレーターで<em>N</em>個結合した式に展開<br>_min_ &le; _N_ &le; _max_<br>default: _min_ = 1 |
| <em>element</em>`%*`<em>max</em>`%`<br><em>element</em>`%*`<em>min</em>`,`<em>max</em>`%` | 要素<em>element</em>を`*`オペレーターで<em>N</em>個繰り返した式に展開<br>_min_ &le; _N_ &le; _max_<br>default: _min_ = 1 |
| <em>parentTag</em>`%>`<em>tag</em>`{`<em>maxDepth</em>`}`| 親要素<em>parentTag</em>と子要素の間にタグ<em>tag</em>を<em>N</em>階層入れ子で挿入する式に展開<br>0 &le; _N_ &le; _maxDepth_ |


#### %オペレーターの使用例
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
