(() => {
const themeIds = ["tide","fieldnotes","circuit","atelier"];
const manifest = {"default":"tide","themes":[{"id":"tide","label":"Tide","months":[6,7,8],"servicesOrder":["hero","proof","services","process","work","about","contact"],"bioOrder":["hero","proof","about","work","services","process","contact"]},{"id":"fieldnotes","label":"Fieldnotes","months":[3,4,5],"servicesOrder":["hero","services","about","proof","process","work","contact"],"bioOrder":["hero","about","work","proof","process","services","contact"]},{"id":"circuit","label":"Circuit","months":[12,1,2],"servicesOrder":["hero","services","process","proof","work","about","contact"],"bioOrder":["hero","work","about","services","proof","process","contact"]},{"id":"atelier","label":"Atelier","months":[9,10,11],"servicesOrder":["hero","about","services","work","process","proof","contact"],"bioOrder":["hero","about","process","work","services","proof","contact"]}]};
let saved;
try { saved = localStorage.getItem('marcomc-theme'); } catch {}
const requested = new URLSearchParams(location.search).get('theme');
const theme = (function resolveTheme({ requested, saved, month, manifest }) {
  if (themeIds.includes(requested)) return requested;
  if (requested !== 'auto' && themeIds.includes(saved)) return saved;
  if (requested === 'auto' || saved === 'auto') {
    return manifest.themes.find(t => t.months.includes(month))?.id ?? manifest.default;
  }
  return manifest.default;
})({requested, saved, month:new Date().getMonth()+1, manifest});
if (themeIds.includes(theme)) document.getElementById('theme-stylesheet').href = '/themes/' + theme + '.css?v=1c4cfcd5e39a9f0f';
})();
