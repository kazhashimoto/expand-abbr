const styleMap = new Map();
module.exports.getPresetStyles = function() {
  let text = '\n';
  for (const [selector, value] of styleMap) {
    const decl = value.join('; ');
    const rules = `${selector} {${decl}}\n`;
    text += rules;
  }
  return text;
};

styleMap.set('._x-header', [
  'width: 100%',
  'background: #000',
  'color: #fff'
]);

styleMap.set('._x-footer', [
  'box-sizing: border-box',
  'width: 100%',
  'padding: 20px 4%',
  'margin-top: 50px',
  'background: #000',
  'color: #fff'
]);
styleMap.set('._x-nav ul', [
  'display: flex',
  'list-style: none'
]);
styleMap.set('._x-footer nav', [
  'display: flex',
  'gap: 10px',
  'font-size: var(--font-size-0)'
]);
styleMap.set('._x-copyright', [
  'font-size: var(--font-size-1)'
]);
