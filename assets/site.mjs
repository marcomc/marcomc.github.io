import { resolveTheme, sectionOrder, allThemeIds } from './theme.mjs?v=6d3597b5f50e693d';
import { holidayForDate } from './holiday-calendar.mjs?v=6d3597b5f50e693d';
import { holidayNotices } from '../themes/holidays.mjs?v=6d3597b5f50e693d';
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
  const holidayNote = document.createElement('small');
  holidayNote.id = 'holiday-note';
  holidayNote.setAttribute('role', 'status');
  holidayNote.hidden = true;
  document.querySelector('.theme-control').append(holidayNote);
  let changeId = 0;
  async function apply(choice) {
    const currentId = ++changeId;
    const date = new Date();
    const theme = resolveTheme({ requested:choice, saved:storage.get(), date, manifest });
    if (!allThemeIds.includes(theme)) return;
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
    const today = holidayForDate(date);
    const holiday = today?.id === theme ? today : null;
    const lang = document.documentElement.lang;
    holidayNote.textContent = holiday ? (holidayNotices[lang] ?? holidayNotices.en)
      .replace('{holiday}', holiday.names[lang] ?? holiday.names.en) : '';
    holidayNote.hidden = !holiday;
  }
  const requested = new URLSearchParams(location.search).get('theme');
  const saved = storage.get();
  const initial = allThemeIds.includes(requested) || requested === 'auto' ? requested
    : allThemeIds.includes(saved) || saved === 'auto' ? saved : manifest.default;
  let choice = initial;
  let calendarDay = new Date().toDateString();
  selector.value = initial;
  await apply(initial);
  document.querySelector('.theme-control').hidden = false;
  selector.addEventListener('change', async () => {
    choice = selector.value;
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
  if (allThemeIds.includes(requested) || requested === 'auto') {
    for (const link of document.querySelectorAll('.primary-nav a, .language-switch a')) {
      const target = new URL(link.href);
      if (target.origin === location.origin) { target.searchParams.set('theme', requested); link.href = target; }
    }
  }
  // Re-evaluate civil dates after midnight, suspension or a time-zone change.
  let midnightTimer;
  function refreshCalendar() {
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 0, 0);
    clearTimeout(midnightTimer);
    midnightTimer = setTimeout(refreshCalendar, nextDay.getTime() - now.getTime() + 50);
    if (now.toDateString() !== calendarDay) {
      calendarDay = now.toDateString();
      apply(choice);
    }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCalendar(); });
  window.addEventListener('pageshow', refreshCalendar);
  refreshCalendar();
}
init().catch(() => { /* Static content and the default stylesheet remain usable offline. */ });
