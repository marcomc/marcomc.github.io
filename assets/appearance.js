(() => {
const themeIds = ["tide","fieldnotes","circuit","atelier"];
const allThemeIds = ["tide","fieldnotes","circuit","atelier","easter","new-year","christmas","halloween","carnival","epiphany"];
const holidayThemes = [{"id":"easter","label":"Easter · Petal","names":{"en":"Easter","fr":"Pâques","it":"Pasqua","pt":"Páscoa"},"rule":{"type":"easter","offset":0},"description":"Ivory, botanical green and lilac; an oval portrait and open editorial rows."},{"id":"new-year","label":"New Year · First Light","names":{"en":"New Year","fr":"Nouvel An","it":"Capodanno","pt":"Ano Novo"},"rule":{"type":"fixed","month":1,"days":[1]},"description":"Ink and champagne; a radial sunrise, fine rules and geometric panels."},{"id":"christmas","label":"Christmas · Evergreen","names":{"en":"Christmas","fr":"Noël","it":"Natale","pt":"Natal"},"rule":{"type":"fixed","month":12,"days":[24,25,26]},"description":"Forest green and warm brass; evergreen branches and a framed, book-like composition."},{"id":"halloween","label":"Halloween · Ember","names":{"en":"Halloween","fr":"Halloween","it":"Halloween","pt":"Halloween"},"rule":{"type":"fixed","month":10,"days":[31]},"description":"Aubergine and copper; a moonlit arch, bold headings and asymmetric outlines."},{"id":"carnival","label":"Carnival · Chromatic","names":{"en":"Shrove Tuesday","fr":"Mardi gras","it":"Carnevale","pt":"Carnaval"},"rule":{"type":"easter","offset":-47},"description":"Pale lilac, plum and teal; a folded fan, vivid edges and playful geometric framing."},{"id":"epiphany","label":"Epiphany · North Star","names":{"en":"Epiphany","fr":"Épiphanie","it":"Befana","pt":"Dia de Reis"},"rule":{"type":"fixed","month":1,"days":[6]},"description":"Midnight indigo and ice blue; a guiding star, constellation lines and quiet rounded panels."}];
const gregorianEaster = function gregorianEaster(year) {
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
};
const holidayForDate = function holidayForDate(date = new Date()) {
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
};
const manifest = {"default":"tide","themes":[{"id":"tide","label":"Tide","months":[6,7,8],"servicesOrder":["hero","proof","services","process","work","about","contact"],"bioOrder":["hero","proof","about","work","services","process","contact"]},{"id":"fieldnotes","label":"Fieldnotes","months":[3,4,5],"servicesOrder":["hero","services","about","proof","process","work","contact"],"bioOrder":["hero","about","work","proof","process","services","contact"]},{"id":"circuit","label":"Circuit","months":[12,1,2],"servicesOrder":["hero","services","process","proof","work","about","contact"],"bioOrder":["hero","work","about","services","proof","process","contact"]},{"id":"atelier","label":"Atelier","months":[9,10,11],"servicesOrder":["hero","about","services","work","process","proof","contact"],"bioOrder":["hero","about","process","work","services","proof","contact"]}]};
let saved;
try { saved = localStorage.getItem('marcomc-theme'); } catch {}
const requested = new URLSearchParams(location.search).get('theme');
const theme = (function resolveTheme({ requested, saved, date = new Date(), month = date.getMonth() + 1, manifest }) {
  const holiday = holidayForDate(date);
  if (holiday) return holiday.id;
  if (allThemeIds.includes(requested)) return requested;
  if (requested !== 'auto' && themeIds.includes(saved)) return saved;
  if (requested === 'auto' || saved === 'auto') {
    return manifest.themes.find(t => t.months.includes(month))?.id ?? manifest.default;
  }
  return manifest.default;
})({requested, saved, date:new Date(), manifest});
if (allThemeIds.includes(theme)) document.getElementById('theme-stylesheet').href = '/themes/' + theme + '.css?v=c263b7c3bc10b25e';
})();
