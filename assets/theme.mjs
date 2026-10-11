import { holidayForDate } from './holiday-calendar.mjs?v=97ecaa8a68b5da6b';
import { holidayThemeIds } from '../themes/holidays.mjs?v=97ecaa8a68b5da6b';
import { accessibilityThemeIds } from '../themes/accessibility.mjs?v=97ecaa8a68b5da6b';

export const themeIds = ['tide', 'fieldnotes', 'circuit', 'atelier'];
export const allThemeIds = [...themeIds, ...holidayThemeIds, ...accessibilityThemeIds];
export const themeLoadErrors = {
  en: 'This appearance could not load. The page remains available. Try again.',
  fr: 'Cette apparence n’a pas pu être chargée. La page reste accessible. Réessayez.',
  it: 'Impossibile caricare il tema. La pagina resta disponibile. Riprova.',
  pt: 'Não foi possível carregar esta aparência. A página continua disponível. Tente novamente.'
};
export function isThemeStylesheetLoaded(link) {
  // Failed requests can leave a sheet whose cssRules getter throws SecurityError.
  try { return Boolean(link.sheet?.cssRules.length); } catch { return false; }
}
export function resolveTheme({ requested, saved, date = new Date(), month = date.getMonth() + 1, manifest }) {
  const choice = allThemeIds.includes(requested) || requested === 'auto' ? requested : saved;
  // A calendar event must never displace an explicit readability preference.
  if (accessibilityThemeIds.includes(choice)) return choice;
  const holiday = holidayForDate(date);
  if (holiday) return holiday.id;
  if (allThemeIds.includes(requested)) return requested;
  if (requested !== 'auto' && allThemeIds.includes(saved)) return saved;
  if (requested === 'auto' || saved === 'auto') {
    return manifest.themes.find(t => t.months.includes(month))?.id ?? manifest.default;
  }
  return manifest.default;
}
export function sectionOrder(manifest, theme, page, existing) {
  const layout = manifest.themes.find(t => t.id === (themeIds.includes(theme) ? theme : manifest.default));
  const order = layout?.[`${page}Order`] ?? existing;
  return [...new Set([...order, ...existing])].filter(s => existing.includes(s));
}
