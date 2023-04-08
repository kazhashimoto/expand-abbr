let iconNames = [];
const aliasMap = new Map();
aliasMap
  .set('CHAT', 'chat-bubble-left')
  .set('LIKE', 'hand-thumb-up')
  .set('XLINK', 'arrow-top-right-on-square')
  .set('LINK', 'chevron-double-right');

module.exports.getIconURL = function(arg, encode) {
  let key;
  let url;
  if (!iconNames.length) {
    iconNames = [...iconMap.keys()];
  }
  if (typeof arg == 'function') {
    const random = arg;
    let idx = random() % iconNames.length;
    key = iconNames[idx];
  } else if (typeof arg == 'string') {
    let name = aliasMap.get(arg);
    key = name? name: arg;
    if (!iconMap.has(key)) {
      return '';
    }
  } else {
    key = iconNames[0];
  }
  if (encode) {
    const value = iconMap.get(key);
    let [svg, base64] = value;
    const header = 'data:image/svg+xml;base64';
    if (!base64) {
      base64 = btoa(svg);
      value.push(base64);
    }
    url = `${header},${base64}`;
  } else {
    url = `${key}.svg`;
  }
  return url;
}

const iconMap = new Map();
/**
 * SVG data are taken from https://heroicons.dev/
 */
iconMap.set('arrow-left', [
  `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
]);

iconMap.set('arrow-right', [
  `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
]);

iconMap.set('arrow-up', [
  `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
]);

iconMap.set('arrow-down', [
  `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
]);

iconMap.set('chevron-double-right', [
  `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
]);

iconMap.set('arrow-top-right-on-square', [
  `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
]);

iconMap.set('chat-bubble-left', [
  `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
]);

iconMap.set('hand-thumb-up', [
  `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
])
