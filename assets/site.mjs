import { resolveTheme, sectionOrder, allThemeIds, themeLoadErrors, isThemeStylesheetLoaded } from './theme.mjs?v=4b854213ccd33ef4';
import { holidayForDate } from './holiday-calendar.mjs?v=4b854213ccd33ef4';
import { holidayNotices } from '../themes/holidays.mjs?v=4b854213ccd33ef4';
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
  // Cached HTML from an earlier deployment may not contain the status element.
  const errorNote = document.getElementById('theme-error') ?? document.createElement('small');
  errorNote.id = 'theme-error';
  errorNote.setAttribute('role', 'status');
  errorNote.textContent = themeLoadErrors[document.documentElement.lang] ?? themeLoadErrors.en;
  errorNote.hidden = true;
  document.querySelector('.theme-control').append(errorNote);
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
    if (current.href !== new URL(stylesheetURL, location.origin).href || !isThemeStylesheetLoaded(current)) {
      const sheet = document.createElement('link');
      sheet.rel = 'stylesheet';
      sheet.href = stylesheetURL;
      const loaded = new Promise(resolve => { sheet.onload = () => resolve(true); sheet.onerror = () => resolve(false); });
      document.head.append(sheet);
      const success = await loaded;
      if (currentId !== changeId) { sheet.remove(); return null; }
      if (!success) { sheet.remove(); errorNote.hidden = false; return false; }
      current.remove();
      sheet.id = 'theme-stylesheet';
    }
    document.body.dataset.theme = theme;
    const focused = document.activeElement;
    let next = main.firstElementChild;
    for (const id of sectionOrder(manifest, theme, document.body.dataset.page, existing)) {
      const section = sections.find(s => s.dataset.section === id);
      if (section === next) next = next.nextElementSibling;
      else main.insertBefore(section, next);
    }
    if (main.contains(focused) && document.activeElement !== focused) focused.focus({preventScroll:true});
    errorNote.hidden = true;
    const today = holidayForDate(date);
    const holiday = today?.id === theme ? today : null;
    const lang = document.documentElement.lang;
    holidayNote.textContent = holiday ? (holidayNotices[lang] ?? holidayNotices.en)
      .replace('{holiday}', holiday.names[lang] ?? holiday.names.en) : '';
    holidayNote.hidden = !holiday;
    return true;
  }
  const requested = new URLSearchParams(location.search).get('theme');
  const saved = storage.get();
  const initial = allThemeIds.includes(requested) || requested === 'auto' ? requested
    : allThemeIds.includes(saved) || saved === 'auto' ? saved : manifest.default;
  let choice = initial;
  let displayedChoice = initial;
  let pendingSelection = false;
  let calendarDay = new Date().toDateString();
  selector.value = initial;
  if (await apply(initial) === false) {
    displayedChoice = manifest.default;
    selector.value = displayedChoice;
  }
  document.querySelector('.theme-control').hidden = false;
  selector.addEventListener('change', async () => {
    const selected = selector.value;
    pendingSelection = true;
    const applied = await apply(selected);
    if (applied === null) return;
    pendingSelection = false;
    if (applied === false) { selector.value = displayedChoice; refreshCalendar(); return; }
    if (applied !== true) return;
    choice = selected;
    displayedChoice = selected;
    storage.set(selected);
    const cleanURL = new URL(location.href);
    cleanURL.searchParams.delete('theme');
    history.replaceState(null, '', cleanURL);
    for (const link of document.querySelectorAll('a[href]')) {
      const target = new URL(link.href);
      if (target.origin === location.origin) { target.searchParams.delete('theme'); link.href = target; }
    }
    refreshCalendar();
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
    if (!pendingSelection && now.toDateString() !== calendarDay) {
      calendarDay = now.toDateString();
      const calendarChoice = choice;
      apply(calendarChoice).then(applied => {
        if (applied === true) {
          displayedChoice = calendarChoice;
          selector.value = calendarChoice;
        }
      });
    }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCalendar(); });
  window.addEventListener('pageshow', refreshCalendar);
  refreshCalendar();
}
init().catch(() => { /* Static content and the default stylesheet remain usable offline. */ });
