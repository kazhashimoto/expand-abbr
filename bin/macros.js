
const macroMap = new Map();
module.exports.macroMap = macroMap;

macroMap.set('root', [
  '(%pg-header%)+(%pg-main-content%)+(%pg-footer%)',
  '(%pg-header%)+(%pg-blog-content%)+(%pg-footer%)'
]);
macroMap.set('pg-main-content', [
  '(%section%)%+4,6%'
]);
macroMap.set('pg-blog-content', [
  '(%blog-article%)%+4,6%'
]);
macroMap.set('pg-header', [
  '%pg-header-content%',
  'div%>div{1}%(%pg-header-content%)'
]);
macroMap.set('pg-header-content', [
  'header%>div{1}%(%nav%)',
  'header%>div{1}%(h1{__HEADING_SHORT__}+(%nav%))',
  'header%>div{1}%div>(h1{__HEADING_SHORT__}+h2{__HEADING__})^(%nav%)',
  'header%>div{1}%h1{__HEADING_SHORT__}+div>(%nav%)',
]);
macroMap.set('pg-footer', [
  '%pg-footer-content%',
  'div%>div{1}%(%pg-footer-content%)'
]);
macroMap.set('pg-footer-content', [
  'footer%>div{1}%(%copyright%)',
  'footer%>div{1}%nav>p%3,5%>a[href=page$.html]{page$}',
  'footer%>div{1}%(nav>p%3,5%>a[href=page$.html]{page$})+(%copyright%)'
]);
macroMap.set('copyright', [
  'p.copyright{&copy;2023 Example}'
]);
macroMap.set('nav', [
  'nav>ul>li%3,6%>a[href=#s$]{$}'
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
  'div%2%>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div%2%>img[src=photo16x9_$.jpg alt=__PHRASE__]',
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
  'div>(%link-icon%)'
]);
macroMap.set('list', [
  // 'ul>li%2,5%>lorem4-8',
  // 'ul>li%2,5%>lorem8-16',
  // 'ul>li*4>a[href=page$.html]{__PHRASE__}',
  'ul>li*4>(%link-icon%)',
  // 'ul>li%2,5%>a[href=page$,html]>lorem4-8',
  // 'ol>li%4,6%{__PHRASE__}',
  // 'dl>(dt>{__PHRASE__}^dd>lorem8-16)%3,6%'
]);
macroMap.set('section', [
  'section[id=s__SEQ_ID__]>(%section-inner%)',
  'section[id=s__SEQ_ID__]%>div{1}%(%section-inner%)',
]);
macroMap.set('section-inner', [
  '(%section-heading%)+(%section-body%)',
  '(%section-heading%)+(%section-body%)+div>(%list%)',
  '(%section-heading%)+(%section-body%)+div>(%table%)',
  '(%section-heading%)+(%section-body%)+div>(%list%)^div>(%table%)',
  '(%section-heading%)+(%section-body%)+(%grid%)'
]);
macroMap.set('section-heading', [
  'h2{Section __SEQ_1__}',
  'div>h2{Section __SEQ_1__}'
]);
macroMap.set('section-body', [
  '(%ordered-block%)%+3%',
  '(%float-block%)%+3%',
  '(%ordered-block%)+(%float-block%)',
  '(%float-block%)+(%ordered-block%)',
  '(%ordered-block%)+(%float-block%)+(%ordered-block%)',
  '(%float-block%)+(%ordered-block%)+(%float-block%)'
]);
macroMap.set('float-block', [
  'div._x-float-img-right>(%img@0%)+(%p-long@1%)%3%',
  'div._x-float-img-left>(%img@0%)+(%p-long@1%)%3%',
  'div._x-float-img-right>(%img@0%)+(%p-long%)+(%p%)',
  'div._x-float-img-left>(%img@0%)+(%p-long%)+(%p%)',
  'div._x-float-img-right>(%img@0%)+p{__MESSAGE__}',
  'div._x-float-img-left>(%img@0%)+p{__MESSAGE__}'
]);
macroMap.set('ordered-block', [
  'div>(%p-long%)+(%img%)',
  'div>(%p-long%)^(%img%)',
  'div>(%img%)+(%p-long%)',
  'div>((%img%)+div>(%p-long%))'
]);
macroMap.set('article', [
  'article>h1{__HEADING__}+(%article-item%)%+3,5%'
]);
macroMap.set('article-item', [
  'article>h2{03 March 2023}+p{__PHRASE__}'
]);
macroMap.set('blog-article', [
  'article>(%blog-header%)+(%blog-post%)+(%sns-button-list%)+(%blog-footer%)+(%blog-comment%)+'
]);
macroMap.set('blog-header', [
  'h3{__HEADING__}'
]);
macroMap.set('blog-post', [
  'section>h4{__HEADING__}+p{__MESSAGE__}+(%img@0%)',
  'section>h4{__HEADING__}+p%2,4%{__MESSAGE__}+(%img@0%)'
]);
macroMap.set('blog-comment', [
  'div>(%blog-comment-item%)%+2,5%'
]);
macroMap.set('blog-comment-item', [
  'article>h6{__DIGEST__}+p{__MESSAGE__}+(%blog-footer%)',
  'article>h6{__DIGEST__}+p%2,4%{__MESSAGE__}+(%blog-footer%)',
  'article>h6{__DIGEST__}+p{__MESSAGE__}+(%img@0%)+(%blog-footer%)'
]);
macroMap.set('blog-footer', [
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
  'div>(%thumbnail@0%)+div>(h6{__PHRASE__}+p{__DIGEST__}+p{&dollar;99.99})',
  'div>(%thumbnail@1%)+div>(h5{__HEADING__}+p>lorem20^%anchor@0%)',
  'div>(%thumbnail@1%)+p>lorem10',
  'div>(%thumbnail@1%)+p>lorem20'
]);
macroMap.set('link-icon', [
  'a._x-link[href=page$.html]>{__PHRASE__}',
  'a._x-ext-link[href=page$.html]>{__PHRASE__}'
]);
macroMap.set('sns-button-list', [
  'div>(%sns-button@0%)+(%sns-button@1%)+(%sns-button@2%)'
]);
macroMap.set('sns-button', [
  'div>button[type=button]>i._x-like-icon+span{Like}',
  'div>button[type=button]>i._x-comment-icon+span{Comment}',
  'div>button[type=button]>i._x-share-icon+span{Share}'
]);
