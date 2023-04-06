const styleMap = new Map();
module.exports.styleMap = styleMap;

styleMap.set('pg-header', {
  accept: ['header'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'width: 100%',
      'background: #000',
      'color: #fff'
    ]);
    return map;
  }
});
styleMap.set('nav', {
  accept: ['nav'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(`${key} ul`, [
      'display: flex',
      'list-style: none'
    ]);
    return map;
  }
});

styleMap.set('pg-footer', {
  accept: ['footer'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'box-sizing: border-box',
      'width: 100%',
      'padding: 20px 4%',
      'margin-top: 50px',
      'background: #000',
      'color: #fff'
    ]);
    map.set(`${key} nav`, [
      'display: flex',
      'gap: 10px',
    ]);
    map.set(`${key} nav p`, [
      'font-size: var(--font-size-1)'
    ]);
    map.set(`${key} .copyright`, [
      'font-size: var(--font-size-0)'
    ]);
    return map;
  }
});
styleMap.set('card', {
  accept: ['div'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'padding: 10px',
      'box-shadow: var(--shadow-2)'
    ]);
    map.set(`${key} p`, [
      'font-size: var(--font-size-1)'
    ]);
    return map;
  }
});

const elements = [
  /* sections */
  'article', 'section', 'nav', 'aside', 'header', 'footer',
  /* grouping content */
  'ol', 'ul', 'dl', 'figure', 'figcaption', 'main', 'div',
  /* tabular data */
  'table'
];
