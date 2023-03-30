
const macroMap = new Map();
module.exports.macroMap = macroMap;

macroMap.set('root', [
  '(%pg-header%)+(%pg-main-content%)+(%pg-footer%)'
]);
macroMap.set('pg-main-content', [
  '(%section%)%+4,6%',
  '(%blog-post%)%+4,6%'
]);
macroMap.set('pg-header', [
  '%pg-header-content%',
  'div%>div{1}%(%pg-header-content%)'
]);
macroMap.set('pg-header-content', [
  'header%>div{1}%(%nav%)',
  'header%>div{1}%(h1{__HEADING__}+(%nav%))',
  'header%>div{1}%div>(h1{__HEADING__}+h2{__HEADING__})^(%nav%)',
  'header%>div{1}%h1{__HEADING__}+div>(%nav%)',
]);
macroMap.set('pg-footer', [
  '%pg-footer-content%',
  'div%>div{1}%(%pg-footer-content%)'
]);
macroMap.set('pg-footer-content', [
  'footer%>div{1}%(%copyright%)',
  'footer%>div{1}%nav>p%3,5%>a[href=page$.html]{page$}',
  'footer%>div{1}%(nav>p%3,5%>a[href=page$.html]{page$})+(%copyright%)',
  'footer%>div{1}%(nav>p%3,5%>a[href=page$.html]{page$})+(%icon-list%)+(%copyright%)'
]);
macroMap.set('copyright', [
  'p{&copy;2023 Example}'
]);
macroMap.set('nav', [
  'nav>ul>li%3,6%>a[href=#s$]{Section $}'
]);
macroMap.set('block-content', [
  '%p%',
  'div>(%p%)^(div>(%p%))',
  'div>(%p%)+div>(%p%)',
  'div>(%p%)^(%anchor%)',
  'div>(%p%)+(%anchor%)',
  'div>(%p%)^(%img%)',
  'div>(%p%)+(%img%)',
  '(%img%)+(div>(%p%))',
  '%img%+(div>(%p%))',
  'div>(%p%)^(%img%)^(%anchor%)',
  '(div>(%p%)+(%img%))^(%anchor%)',
  'div>(%p%)^(%img%+%anchor%)',
  'div>((%p%)+%img%+%anchor%)',
  '(%img%)+(div>(%p%))+(%anchor%)',
  '(%img%+(div>(%p%))+(%anchor%)',
  '%img%+(div>(%p%)+(%anchor%))',
  '(div>(%p%))+(%anchor%)+(%img%)',
  'div>(%p%)+(%anchor%)+(%img%)'
]);
macroMap.set('p', [
  'p%2,5%>lorem10',
  'p%5%>span>lorem2^lorem8',
  'p%5%>lorem8+span>lorem2',
  'p%5%>a[href=page$.html]{__PHRASE__}+lorem8',
  'p%5%>a[href=page$.html]>{__PHRASE__}+span>{__PHRASE__}',
  'p%5%>lorem8+a[href=page$.html]{__PHRASE__}',
  "p%5%>lorem6+a[href=page$.html]>{__PHRASE__}+span{__PHRASE__}"
]);
macroMap.set('p-long', [
  'p>lorem100',
  'p*2>lorem50',
  'p*3>lorem33',
  'p*4>lorem25',
  'p*5>lorem20'
]);
macroMap.set('img', [
  'div>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div>img[src=photo16x9_$.jpg alt=__PHRASE__]',
  'div%3%>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div%3%>img[src=photo16x9_$.jpg alt=__PHRASE__]',
  '(%figure%)'
]);
macroMap.set('figure', [
  'figure>figcaption>lorem8^img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'figure>img[src=photo4x3_$.jpg alt=__PHRASE__]+figcaption>lorem8'
]);
macroMap.set('thumbnail', [
  'div>img[src=photo1x1_$.jpg alt=__PHRASE__]',
  'div>img[src=photo2x2_$.jpg alt=__PHRASE__]',
  'div>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div>img[src=photo16x9_$.jpg alt=__PHRASE__]',
]);
macroMap.set('anchor', [
  'div>a[href=page$.html]{__PHRASE__}',
  'div>a[href=page$.html]>span{__PHRASE__}',
  'div>a[href=page$.html]>(%icon%)'
]);
macroMap.set('list', [
  'ul>li%2,5%>lorem4-8',
  'ul>li%2,5%>lorem8-16',
  'ul>li*4>a[href=page$.html]{__PHRASE__}',
  'ul>li*4>a[href=page$.html]>{__PHRASE__}+(%icon%)',
  'ul>li*4>a[href=page$.html]>(%icon%)+{__PHRASE__}',
  'ul>li%2,5%>a[href=page$,html]>lorem4-8',
  'ol>li%4,6%{__PHRASE__}',
  'dl>(dt>{__PHRASE__}^dd>lorem8-16)%3,6%'
]);
macroMap.set('section', [
  '%section-content%',
  'div%>div{1}%(%section-content%)'
]);
macroMap.set('section-content', [
  'section[id=s__SEQ_ID__]>(%section-inner%)',
  'section[id=s__SEQ_ID__]%>div{1}%(%section-inner%)',
]);
macroMap.set('section-inner', [
  '(%section-heading%)+(%section-body%)',
  '(%section-heading%)+(%section-body%)+div>(%list%)',
  '(%section-heading%)+(%section-body%)+div>(%table%)',
  '(%section-heading%)+(%section-body%)+div>(%list%)^div>(%table%)',
  '(%section-heading%)+(%section-body%)+(%grid%)',
]);
macroMap.set('section-heading', [
  'h2{Section __SEQ_1__}',
  'div>h2{Section __SEQ_1__}'
]);
macroMap.set('section-body', [
  '(%section-body-content%)%3%',
  '((%section-body-content%)+(%block-content%))%3%'
]);
macroMap.set('section-body-content', [
  'div>(%p-long%)+(%img%)',
  'div>(%p-long%)^(%img%)',
  'div>(%p-long%)+(%thumbnail%)',
  'div>(%p-long%)^(%thumbnail%)',
  '%img%+div>(%p-long%)',
  '%img%^div>(%p-long%)',
  '%thumbnail%+div>(%p-long%)',
  '%thumbnail%^div>(%p-long%)',
]);
macroMap.set('article', [
  'article>h1{__HEADING__}+(%article-item%)%+3,5%'
]);
macroMap.set('article-item', [
  'article>h2{03 March 2023}+p{__PHRASE__}'
]);
macroMap.set('blog-post', [
  'article>(%blog-post-header%)+(%blog-post-main%)+(%blog-post-comment%)+(%blog-post-footer%)'
]);
macroMap.set('blog-post-header', [
  'h2{__HEADING__}'
]);
macroMap.set('blog-post-main', [
  'section>h3{__HEADING__}+p{__MESSAGE__}',
  'section>h3{__HEADING__}+p{__MESSAGE__}+(%img@0%)'
]);
macroMap.set('blog-post-comment', [
  'section>h3{__HEADING__}+(%blog-post-comment-body%)%2,5%'
]);
macroMap.set('blog-post-comment-body', [
  'article>h4{__DIGEST__}+p{__MESSAGE__}+(%blog-post-footer%)'
]);
macroMap.set('blog-post-footer', [
  'footer>p>{Posted on}+(%time%)+{by __NAME__}'
]);
macroMap.set('time', [
  'time[datetime=__DATETIME__]{__DATE__}',
]);
macroMap.set('table', [
  'table>thead>tr>th*3{item$}^^tbody>tr%3,5%>td*3>{__PHRASE__}',
  'table>caption>lorem4^thead>tr>th*4{item$}^^tbody>tr%3,5%>td*4>{__PHRASE__}'
]);
macroMap.set('grid', [
  'div>(%card%)%4,8%'
]);
macroMap.set('card', [
  'div>(%thumbnail@0%)+div>(h5{__PHRASE__}+h6{99.99})',
  'div>(%thumbnail@1%)+div>(h3{__HEADING__}+p>lorem20^%anchor@0%)',
  'div>(%thumbnail@1%)+p>lorem10',
  'div>(%thumbnail@1%)+p>lorem20'
]);
macroMap.set('icon-list', [
  'div>(%icon@0%)%+4%',
  'div>(%icon@1%)%+3%'
]);
macroMap.set('icon', [
  'span>img[src=__ICON__ width=20]',
  'span>img[src=__ICON__ width=24]'
]);
