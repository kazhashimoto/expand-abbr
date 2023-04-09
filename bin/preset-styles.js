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
styleMap.set('link-icon', {
  accept: ['a'],
  getStyleRule: (cls, dark) => {
    const key = `.${cls}`;
    const map = new Map();
    const { getIconURL } = module.exports.styleMapOptions;
    const props = [
      'display: inline-block',
      'content: ""',
      'width: 1em',
      'height: 1em',
      'margin-left: 0.25em'
    ];
    if (dark) {
      props.push('filter: brightness(0) invert(1)');
    }
    let url = getIconURL('LINK', true);
    map.set(`${key}._x-link::after`, [
      ...props,
      `background: url(${url})`
    ]);
    url = getIconURL('XLINK', true);
    map.set(`${key}._x-ext-link::after`, [
      ...props,
      `background: url(${url})`
    ]);
    return map;
  }
});
styleMap.set('sns-button-list', {
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
styleMap.set('sns-button', {
  accept: ['div'],
  getStyleRule: (cls, dark) => {
    const key = `.${cls}`;
    const map = new Map();
    map.set(`${key} button`, [
      `background-color: transparent`,
      'display: flex',
      'align-items: center'
    ]);
    map.set(`${key} button i`, [
      `display: flex`
    ]);

    const { getIconURL } = module.exports.styleMapOptions;
    const props = [
      'display: inline-block',
      'content: ""',
      'width: 1em',
      'height: 1em',
      'margin-right: 0.5em'
    ];
    if (dark) {
      props.push('filter: brightness(0) invert(1)');
    }
    let url = getIconURL('LIKE', true);
    map.set(`._x-like-icon::before`, [
      ...props,
      `background: url(${url})`
    ]);
    url = getIconURL('CHAT', true);
    map.set(`._x-comment-icon::before`, [
      ...props,
      `background: url(${url})`
    ]);
    url = getIconURL('SHARE', true);
    map.set(`._x-share-icon::before`, [
      ...props,
      `background: url(${url})`
    ]);
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
