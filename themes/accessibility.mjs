export const accessibilityThemes = [
  {
    id: 'high-contrast',
    names: { en: 'High contrast', fr: 'Contraste élevé', it: 'Alto contrasto', pt: 'Alto contraste' }
  },
  {
    id: 'grayscale',
    names: { en: 'Grayscale', fr: 'Niveaux de gris', it: 'Scala di grigi', pt: 'Escala de cinzentos' }
  }
];

export const accessibilityThemeIds = accessibilityThemes.map(theme => theme.id);
