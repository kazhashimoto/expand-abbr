const styleMap = new Map();
module.exports = {
  styleMap: styleMap,
  styleMapOptions: {}
};

styleMap.set('pg-header', {
  accept: ['header'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'box-sizing: border-box',
      'width: 100%',
      'padding: 10px 4%'
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
      'list-style: none',
      'justify-content: flex-end',
      'gap: 1rem'
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
      'margin-top: 50px'
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
      'margin: 50px auto 0'
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
styleMap.set('icon', {
  accept: ['span'],
  getStyleRule: (cls, dark) => {
    const key = `.${cls}`;
    const map = new Map();
    const props = [ 'display: inline' ];
    if (dark) {
      props.push('filter: brightness(0) invert(1)');
    }
    map.set(`${key} img`, props);
    return map;
  }
});
styleMap.set('bg-icon', {
  accept: ['span'],
  getStyleRule: (cls, dark) => {
    const key = `.${cls}`;
    const map = new Map();
    const { getIconURL } = module.exports.styleMapOptions;
    const props = [
      'display: inline-block',
      'content: ""',
      'width: 1em',
      'height: 1em'
    ];
    if (dark) {
      props.push('filter: brightness(0) invert(1)');
    }
    let url = getIconURL('LINK', true);
    map.set(`${key}._x-before-icon1::before`, [
      ...props,
      `background: url(${url})`,
      'margin-right: 0.25em'
    ]);
    url = getIconURL('XLINK', true);
    map.set(`${key}._x-after-icon1::after`, [
      ...props,
      `background: url(${url})`,
      'margin-left: 0.25em'
    ]);
    return map;
  }
});
styleMap.set('sns-icon-list', {
  accept: ['div'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'display: flex',
      'gap: 10px',
      'margin-top: 10px'
    ]);
    return map;
  }
});
styleMap.set('sns-icon', {
  accept: ['div'],
  getStyleRule: (cls, dark) => {
    const key = `.${cls}`;
    const map = new Map();
    if (dark) {
      map.set(key, [
        'filter: brightness(0) invert(1)'
      ]);
    }
    return map;
  }
});
styleMap.set('table', {
  accept: ['table'],
  getStyleRule: (cls) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(key, [
      'border-collapse: collapse',
      'margin-top: 30px',
    ]);
    map.set(`${key} th`, [
      'background: var(--surface-3)',
      'border: 1px solid var(--surface-4)',
      'padding: 10px'
    ]);
    map.set(`${key} td`, [
      'border: 1px solid var(--surface-4)',
      'padding: 10px'
    ]);
    return map;
  }

});
