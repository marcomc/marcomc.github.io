import { resolveTheme, sectionOrder, themeIds } from './theme.mjs?v=1c4cfcd5e39a9f0f';
const preferenceKey = 'marcomc-theme';
const assetQuery = new URL(import.meta.url).search;
const storage = {
  get() { try { return localStorage.getItem(preferenceKey); } catch { return null; } },
  set(value) { try { localStorage.setItem(preferenceKey, value); } catch { /* Preferences are optional when browser storage is unavailable. */ } }
};
async function init() {
  const response = await fetch(`/themes/manifest.json${assetQuery}`);
  if (!response.ok) return;
  const manifest = await response.json();
  if (!Array.isArray(manifest.themes) || !manifest.themes.length) return;
  const main = document.querySelector('main');
  const sections = [...main.querySelectorAll(':scope > [data-section]')];
  const existing = sections.map(s => s.dataset.section);
  const selector = document.getElementById('theme-select');
  let changeId = 0;
  async function apply(choice) {
    const currentId = ++changeId;
    const theme = resolveTheme({ requested:choice, saved:storage.get(), month:new Date().getMonth()+1, manifest });
    if (!themeIds.includes(theme)) return;
    const current = document.getElementById('theme-stylesheet');
    const stylesheetURL = `/themes/${theme}.css${assetQuery}`;
    if (current.href !== new URL(stylesheetURL, location.origin).href) {
      const sheet = document.createElement('link');
      sheet.rel = 'stylesheet';
      sheet.href = stylesheetURL;
      const loaded = new Promise(resolve => { sheet.onload = () => resolve(true); sheet.onerror = () => resolve(false); });
      document.head.append(sheet);
      if (!await loaded || currentId !== changeId) { sheet.remove(); return; }
      current.remove();
      sheet.id = 'theme-stylesheet';
    }
    document.body.dataset.theme = theme;
    for (const id of sectionOrder(manifest, theme, document.body.dataset.page, existing)) main.append(sections.find(s => s.dataset.section === id));
  }
  const requested = new URLSearchParams(location.search).get('theme');
  const saved = storage.get();
  const initial = themeIds.includes(requested) || requested === 'auto' ? requested
    : themeIds.includes(saved) || saved === 'auto' ? saved : manifest.default;
  selector.value = initial;
  await apply(initial);
  document.querySelector('.theme-control').hidden = false;
  selector.addEventListener('change', async () => {
    storage.set(selector.value);
    const cleanURL = new URL(location.href);
    cleanURL.searchParams.delete('theme');
    history.replaceState(null, '', cleanURL);
    for (const link of document.querySelectorAll('a[href]')) {
      const target = new URL(link.href);
      if (target.origin === location.origin) { target.searchParams.delete('theme'); link.href = target; }
    }
    await apply(selector.value);
  });
  if (themeIds.includes(requested) || requested === 'auto') {
    for (const link of document.querySelectorAll('.primary-nav a, .language-switch a')) {
      const target = new URL(link.href);
      if (target.origin === location.origin) { target.searchParams.set('theme', requested); link.href = target; }
    }
  }
}
init().catch(() => { /* Static content and the default stylesheet remain usable offline. */ });
