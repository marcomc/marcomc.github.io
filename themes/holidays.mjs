// Festive themes can be selected manually; calendar overrides never change preferences.
export const holidayThemes = [
  {
    id: 'easter', label: 'Easter · Petal',
    names: { en: 'Easter', fr: 'Pâques', it: 'Pasqua', pt: 'Páscoa' },
    rule: { type: 'easter', offset: 0 },
    description: 'Ivory, botanical green and lilac; a rabbit, decorated eggs and botanical sprigs.'
  },
  {
    id: 'new-year', label: 'New Year · First Light',
    names: { en: 'New Year', fr: 'Nouvel An', it: 'Capodanno', pt: 'Ano Novo' },
    rule: { type: 'fixed', month: 1, days: [1] },
    description: 'Ink and champagne; a midnight clock, fireworks and geometric panels.'
  },
  {
    id: 'christmas', label: 'Christmas · Evergreen',
    names: { en: 'Christmas', fr: 'Noël', it: 'Natale', pt: 'Natal' },
    rule: { type: 'fixed', month: 12, days: [24, 25, 26] },
    description: 'Forest green and warm brass; a fir tree, gifts, baubles and a framed composition.'
  },
  {
    id: 'halloween', label: 'Halloween · Ember',
    names: { en: 'Halloween', fr: 'Halloween', it: 'Halloween', pt: 'Halloween' },
    rule: { type: 'fixed', month: 10, days: [31] },
    description: 'Aubergine and copper; a smiling pumpkin, ghost, bats and a moonlit arch.'
  },
  {
    id: 'carnival', label: 'Carnival · Chromatic',
    names: { en: 'Shrove Tuesday', fr: 'Mardi gras', it: 'Carnevale', pt: 'Carnaval' },
    rule: { type: 'easter', offset: -47 },
    description: 'Pale lilac, plum and teal; a mask, harlequin diamonds, ribbons and vivid edges.'
  },
  {
    id: 'epiphany', label: 'Epiphany · North Star',
    names: { en: 'Epiphany', fr: 'Épiphanie', it: 'Befana', pt: 'Dia de Reis' },
    rule: { type: 'fixed', month: 1, days: [6] },
    description: 'Midnight indigo and ice blue; Befana on her broom, a stocking and star trails.'
  }
];

export const holidayThemeIds = holidayThemes.map(theme => theme.id);

export const holidayNotices = {
  en: '{holiday} appearance today. Your chosen appearance returns afterwards.',
  fr: 'Apparence de fête : {holiday}. Votre choix habituel revient ensuite.',
  it: 'Oggi il tema è dedicato a {holiday}. Poi torna la tua scelta abituale.',
  pt: 'Hoje, o tema celebra {holiday}. Depois, regressa a sua escolha habitual.'
};
