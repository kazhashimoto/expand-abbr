const styleMap = new Map();

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

const elements = [
  /* sections */
  'article', 'section', 'nav', 'aside', 'header', 'footer',
  /* grouping content */
  'ol', 'ul', 'dl', 'figure', 'figcaption', 'main', 'div',
  /* tabular data */
  'table'
];

module.exports.getPresetStyles = function(cls) {
  let tag;
  let str = cls;
  let re = /_([a-z]+)$/;
  let found = cls.match(re);
  if (found) {
    tag = found[1];
    str = cls.replace(re, '');
  }
  const words = str.split('-');
  return bestMatch(words, tag);
};

function bestMatch(words, tag) {
  let matches;
  let best = undefined;
  for (const [key, obj] of styleMap) {
    if (obj.accept.includes(tag)) {
      if (!obj._key_words) {
        obj._key_words = key.split('-');
      }
      matches = true;
      for (const w of obj._key_words) {
        if (!words.includes(w)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        if (!best ||(obj._key_words.length > best._key_words.length)) {
          best = obj;
        }
      }
    }
  }
  return best;
}
