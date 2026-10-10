export const themeIds = ['tide', 'fieldnotes', 'circuit', 'atelier'];
export function resolveTheme({ requested, saved, month, manifest }) {
  if (themeIds.includes(requested)) return requested;
  if (requested !== 'auto' && themeIds.includes(saved)) return saved;
  if (requested === 'auto' || saved === 'auto') {
    return manifest.themes.find(t => t.months.includes(month))?.id ?? manifest.default;
  }
  return manifest.default;
}
export function sectionOrder(manifest, theme, page, existing) {
  const layout = manifest.themes.find(t => t.id === theme);
  const order = layout?.[`${page}Order`] ?? existing;
  return [...new Set([...order, ...existing])].filter(s => existing.includes(s));
}
