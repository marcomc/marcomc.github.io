import { holidayForDate } from './holiday-calendar.mjs?v=6d3597b5f50e693d';
import { holidayThemeIds } from '../themes/holidays.mjs?v=6d3597b5f50e693d';
import { accessibilityThemeIds } from '../themes/accessibility.mjs?v=6d3597b5f50e693d';

export const themeIds = ['tide', 'fieldnotes', 'circuit', 'atelier'];
export const allThemeIds = [...themeIds, ...holidayThemeIds, ...accessibilityThemeIds];
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
