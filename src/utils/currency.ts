interface CurrencyInfo {
  symbol: string;
  code: string;
  locale: string;
}

const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  India:                   { symbol: '₹',   code: 'INR', locale: 'en-IN' },
  'United States':         { symbol: '$',   code: 'USD', locale: 'en-US' },
  'United Kingdom':        { symbol: '£',   code: 'GBP', locale: 'en-GB' },
  'United Arab Emirates':  { symbol: 'AED', code: 'AED', locale: 'ar-AE' },
  Australia:               { symbol: 'A$',  code: 'AUD', locale: 'en-AU' },
  Canada:                  { symbol: 'C$',  code: 'CAD', locale: 'en-CA' },
  Singapore:               { symbol: 'S$',  code: 'SGD', locale: 'en-SG' },
  Germany:                 { symbol: '€',   code: 'EUR', locale: 'de-DE' },
  France:                  { symbol: '€',   code: 'EUR', locale: 'fr-FR' },
  Japan:                   { symbol: '¥',   code: 'JPY', locale: 'ja-JP' },
  China:                   { symbol: '¥',   code: 'CNY', locale: 'zh-CN' },
  'South Korea':           { symbol: '₩',   code: 'KRW', locale: 'ko-KR' },
  Brazil:                  { symbol: 'R$',  code: 'BRL', locale: 'pt-BR' },
  Mexico:                  { symbol: 'Mex$',code: 'MXN', locale: 'es-MX' },
  'South Africa':          { symbol: 'R',   code: 'ZAR', locale: 'en-ZA' },
  Nigeria:                 { symbol: '₦',   code: 'NGN', locale: 'en-NG' },
  Pakistan:                { symbol: '₨',   code: 'PKR', locale: 'ur-PK' },
  Bangladesh:              { symbol: '৳',   code: 'BDT', locale: 'bn-BD' },
  Indonesia:               { symbol: 'Rp',  code: 'IDR', locale: 'id-ID' },
  Malaysia:                { symbol: 'RM',  code: 'MYR', locale: 'ms-MY' },
  Thailand:                { symbol: '฿',   code: 'THB', locale: 'th-TH' },
  Philippines:             { symbol: '₱',   code: 'PHP', locale: 'fil-PH' },
  Turkey:                  { symbol: '₺',   code: 'TRY', locale: 'tr-TR' },
  Russia:                  { symbol: '₽',   code: 'RUB', locale: 'ru-RU' },
  'Saudi Arabia':          { symbol: 'SR',  code: 'SAR', locale: 'ar-SA' },
  Egypt:                   { symbol: 'E£',  code: 'EGP', locale: 'ar-EG' },
  'Sri Lanka':             { symbol: '₨',   code: 'LKR', locale: 'si-LK' },
  Nepal:                   { symbol: '₨',   code: 'NPR', locale: 'ne-NP' },
  'Hong Kong':             { symbol: 'HK$', code: 'HKD', locale: 'zh-HK' },
  Taiwan:                  { symbol: 'NT$', code: 'TWD', locale: 'zh-TW' },
  Vietnam:                 { symbol: '₫',   code: 'VND', locale: 'vi-VN' },
};

/* Countries ordered by relevance for Indian users (NRI + domestic) */
export const PRIORITY_COUNTRIES = [
  'India',
  'United Arab Emirates',
  'United States',
  'United Kingdom',
  'Singapore',
  'Canada',
  'Australia',
  'Saudi Arabia',
  'Germany',
  'France',
  'Hong Kong',
  'Japan',
  'Malaysia',
  'Sri Lanka',
  'Nepal',
  'Bangladesh',
];

export function getCurrencyForCountry(country: string): CurrencyInfo {
  return COUNTRY_CURRENCY_MAP[country] ?? { symbol: '₹', code: 'INR', locale: 'en-IN' };
}

export function formatAmount(amount: number, country: string): string {
  const { symbol } = getCurrencyForCountry(country);
  return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
}

/** Returns display label like "India (₹ INR)" for use in dropdowns */
export function countryLabel(country: string): string {
  const info = COUNTRY_CURRENCY_MAP[country];
  if (!info) return country;
  return `${country}  ${info.symbol}  ${info.code}`;
}

/** Sort a countries array: priority ones first, then rest alphabetically */
export function sortCountriesForIndia(countries: string[]): string[] {
  const priority = PRIORITY_COUNTRIES.filter((c) => countries.includes(c));
  const rest = countries
    .filter((c) => !PRIORITY_COUNTRIES.includes(c))
    .sort((a, b) => a.localeCompare(b));
  return [...priority, ...rest];
}
