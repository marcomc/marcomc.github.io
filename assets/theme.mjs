import { holidayForDate } from './holiday-calendar.mjs?v=bf5dc55ff94c33f5';
import { holidayThemeIds } from '../themes/holidays.mjs?v=bf5dc55ff94c33f5';

export const themeIds = ['tide', 'fieldnotes', 'circuit', 'atelier'];
export const allThemeIds = [...themeIds, ...holidayThemeIds];
export function resolveTheme({ requested, saved, date = new Date(), month = date.getMonth() + 1, manifest }) {
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
  const layout = manifest.themes.find(t => t.id === (holidayThemeIds.includes(theme) ? manifest.default : theme));
  const order = layout?.[`${page}Order`] ?? existing;
  return [...new Set([...order, ...existing])].filter(s => existing.includes(s));
}
