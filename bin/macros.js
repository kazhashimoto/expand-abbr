
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
macroMap.set('p-hypertext', [
  '(p{__HYPERTEXT20X3__})%+3%',
])
macroMap.set('figure', [
  'figure>figcaption{__MESSAGE__}+img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'figure>img[src=photo4x3_$.jpg alt=__PHRASE__]+figcaption{__MESSAGE__}'
]);
macroMap.set('thumbnail', [
  'div>img[src=photo1x1_$.jpg alt=__PHRASE__]',
  'div>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div>img[src=photo16x9_$.jpg alt=__PHRASE__]',
]);
macroMap.set('anchor', [
  'div>a[href=page$.html]{__PHRASE__}',
  'div>a[href=page$.html]>span{__PHRASE__}',
  'div>(%link-icon%)'
]);
macroMap.set('list', [
  'ul>li%4,6%>(%link-icon%)',
  'ul>li%4,6%{__MESSAGE__}',
  'ol>li%4,6%{__MESSAGE__}',
  'dl>(dt>{__PHRASE__}^dd>{__HYPERTEXT12X3__})%3,6%'
]);
macroMap.set('section', [
  'section[id=s__SEQ_ID__]>(%section-inner%)',
  'section[id=s__SEQ_ID__]%>div{1}%(%section-inner%)',
]);
macroMap.set('section-inner', [
  '(%section-heading%)+(%section-body%)',
  '(%section-heading%)+(%section-body%)+div>(%list%)',
  '(%section-heading%)+(%section-body%)+div>(%table%)',
  '(%section-heading%)+(%section-body%)+(div>(%list%))+div>(%table%)',
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
  'div._x-float-img-right>(%photo%)+(%p-hypertext%)',
  'div._x-float-img-left>(%photo%)+(%p-hypertext%)',
  'div._x-float-img-right>(%photo%)+p{__HYPERTEXT12X3__}',
  'div._x-float-img-left>(%photo%)+p{__HYPERTEXT12X3__}'
]);
macroMap.set('ordered-block', [
  'div>(%p-hypertext%)+(%img-block%)',
  'div>(%p-hypertext%)+(%img-block%)',
  'div>(%img-block%)+(%p-hypertext%)',
  'div>((%img-block%)+div>(%p-hypertext%))'
]);
macroMap.set('img-block', [
  '%photo%',
  '%photo-column%',
  '%figure%',
]);
macroMap.set('photo', [
  'div>img[src=photo4x3_$.jpg alt=__PHRASE__]',
  'div>img[src=photo16x9_$.jpg alt=__PHRASE__]',
]);
macroMap.set('photo-column', [
  'div>(%photo%)*2'
]);
macroMap.set('blog-article', [
  'article>(%blog-header%)+(%blog-post%)+(%sns-button-list%)+(%blog-footer%)+(%blog-comment%)+'
]);
macroMap.set('blog-header', [
  'h3{__HEADING__}'
]);
macroMap.set('blog-post', [
  'section>h4{__HEADING__}+p{__MESSAGE__}+(%photo@0%)',
  'section>h4{__HEADING__}+p%2,4%{__MESSAGE__}+(%photo@0%)'
]);
macroMap.set('blog-comment', [
  'div>(%blog-comment-item%)%+2,5%'
]);
macroMap.set('blog-comment-item', [
  'article>h6{__DIGEST__}+p{__MESSAGE__}+(%blog-footer%)',
  'article>h6{__DIGEST__}+p%2,4%{__MESSAGE__}+(%blog-footer%)',
  'article>h6{__DIGEST__}+p{__MESSAGE__}+(%photo@0%)+(%blog-footer%)'
]);
macroMap.set('blog-footer', [
  'footer>p>{Posted on}+(%time%)+{by __NAME__}'
]);
macroMap.set('time', [
  'time[datetime=__DATETIME__]{__DATE__}',
]);
macroMap.set('table', [
  'table>(thead>tr>th*3{item$})+(tbody>tr%3,5%>td*3>{__PHRASE__})',
  'table>caption{__DIGEST__}+(thead>tr>th*4{item$})+(tbody>tr%3,5%>td*4>{__PHRASE__})'
]);
macroMap.set('grid', [
  'div._x-grid-3>(%card%)%4,8%',
  'div._x-grid-4>(%card%)%4,8%'
]);
macroMap.set('card', [
  'div>(%thumbnail%)+div>(h6{__PHRASE__}+p{__DIGEST__}+p{&dollar;99.99})',
  'div>(%thumbnail%)+div>(h5{__HEADING__}+p>lorem20^%anchor@0%)',
  'div>(%thumbnail%)+p>lorem10',
  'div>(%thumbnail%)+p>lorem20'
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
