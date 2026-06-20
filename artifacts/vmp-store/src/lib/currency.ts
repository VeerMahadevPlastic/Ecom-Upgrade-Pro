export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'TRY' | 'RUB';

export const CURRENCIES: Record<CurrencyCode, { symbol: string, rate: number, name: string }> = {
  INR: { symbol: '₹', rate: 1, name: 'Indian Rupee' },
  USD: { symbol: '$', rate: 0.012, name: 'US Dollar' },
  GBP: { symbol: '£', rate: 0.0095, name: 'British Pound' },
  TRY: { symbol: '₺', rate: 0.39, name: 'Turkish Lira' },
  RUB: { symbol: '₽', rate: 1.05, name: 'Russian Ruble' }
};

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const { symbol, rate } = CURRENCIES[currency];
  const converted = amount * rate;
  return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
