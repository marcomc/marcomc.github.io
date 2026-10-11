export const accessibilityThemes = [
  {
    id: 'high-contrast',
    names: { es: 'Alto contraste', en: 'High contrast', fr: 'Contraste élevé', it: 'Alto contrasto', pt: 'Alto contraste' }
  },
  {
    id: 'grayscale',
    names: { es: 'Escala de grises', en: 'Grayscale', fr: 'Niveaux de gris', it: 'Scala di grigi', pt: 'Escala de cinzentos' }
  }
];

export const accessibilityThemeIds = accessibilityThemes.map(theme => theme.id);
