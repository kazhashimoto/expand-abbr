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
styleMap.set('section-content', {
  accept: ['section'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'width: 92%',
      'max-width: 960px',
      'margin: 0 auto'
    ]);
    map.set(`${key} + ${key}`, [
      'margin-top: 50px'
    ]);
    return map;
  }
});
styleMap.set('img', {
  accept: ['div'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'margin-top: 10px'
    ]);
    return map;
  }
});
styleMap.set('blog-article', {
  accept: ['article'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'width: 92%',
      'max-width: 960px',
      'margin: 0 auto',
      'padding: 20px',
      'box-shadow: var(--shadow-4)'
    ]);
    map.set(`${key} + ${key}`, [
      'margin-top: 10px'
    ]);
    return map;
  }
});
styleMap.set('blog-comment', {
  accept: ['div'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'margin-top: 50px'
    ]);
    return map;
  }
});
styleMap.set('blog-comment-item', {
  accept: ['article'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'margin-top: 20px'
    ]);
    return map;
  }
});
styleMap.set('blog-footer', {
  accept: ['footer'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'display: flex',
      'justify-content: flex-end'
    ]);
    map.set(`${key} p`, [
      'font-size: var(--font-size-0)'
    ]);
    return map;
  }
});
styleMap.set('grid', {
  accept: ['div'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'display: grid',
      'grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))',
      'gap: 10px'
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
