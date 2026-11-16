export const countryCodes = [
  ['+972', 'Israel'],
  ['+1', 'United States / Canada'],
  ['+44', 'United Kingdom'],
  ['+33', 'France'],
  ['+49', 'Germany'],
  ['+31', 'Netherlands'],
  ['+32', 'Belgium'],
  ['+41', 'Switzerland'],
  ['+43', 'Austria'],
  ['+34', 'Spain'],
  ['+39', 'Italy'],
  ['+351', 'Portugal'],
  ['+30', 'Greece'],
  ['+45', 'Denmark'],
  ['+46', 'Sweden'],
  ['+47', 'Norway'],
  ['+48', 'Poland'],
  ['+420', 'Czechia'],
  ['+380', 'Ukraine'],
  ['+7', 'Russia / Kazakhstan'],
  ['+61', 'Australia'],
  ['+64', 'New Zealand'],
  ['+27', 'South Africa'],
  ['+54', 'Argentina'],
  ['+55', 'Brazil'],
  ['+52', 'Mexico'],
  ['+91', 'India'],
  ['+81', 'Japan'],
  ['+82', 'South Korea'],
  ['+65', 'Singapore'],
];

export function splitPhone(phone = '') {
  const formatted = phone.trim().match(/^(\+[1-9]\d{0,2})\s+(.+)$/);
  if (formatted) return { countryCode: formatted[1], number: formatted[2] };
  const countryCode = countryCodes.map(([code]) => code).sort((a, b) => b.length - a.length).find(code => phone.startsWith(code));
  if (countryCode) return { countryCode, number: phone.slice(countryCode.length).trim() };
  return { countryCode: '+972', number: phone.trim() };
}

export function internationalPhone(countryCode, number) {
  return `${countryCode.trim()} ${number.trim()}`;
}
