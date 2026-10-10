import { holidayThemes } from '../themes/holidays.mjs?v=6d3597b5f50e693d';
import { accessibilityThemeIds } from '../themes/accessibility.mjs?v=6d3597b5f50e693d';

// Gregorian computus (Meeus/Jones/Butcher). Return a local civil date at noon,
// avoiding UTC conversion and daylight-saving transitions around midnight.
export function gregorianEaster(year) {
  if (!Number.isInteger(year) || year < 1583 || year > 9999) {
    throw new RangeError('Gregorian Easter requires a year from 1583 to 9999.');
  }
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const value = h + l - 7 * m + 114;
  return new Date(year, Math.floor(value / 31) - 1, value % 31 + 1, 12);
}

// A Date is an instant; its local getters determine the visitor's calendar day.
// No URL date overrides, storage access, DOM changes or network calls belong here.
export function holidayForDate(date = new Date()) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return null;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let easter;
  for (const theme of holidayThemes) {
    const rule = theme.rule;
    if (rule.type === 'fixed') {
      if (rule.month === month && rule.days.includes(day)) return theme;
    } else if (year >= 1583 && year <= 9999) {
      easter ??= gregorianEaster(year);
      const target = new Date(easter);
      target.setDate(target.getDate() + rule.offset);
      if (target.getMonth() + 1 === month && target.getDate() === day) return theme;
    }
  }
  return null;
}

// Apply this after resolving the ordinary preference, including URL previews.
// Keep ordinaryTheme and the saved preference unchanged so they resume afterwards.
export function withHolidayTheme(ordinaryTheme, date = new Date()) {
  if (accessibilityThemeIds.includes(ordinaryTheme)) return ordinaryTheme;
  return holidayForDate(date)?.id ?? ordinaryTheme;
}
