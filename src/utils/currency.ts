export function getExchangeRate(curr: string): number {
  switch (curr) {
    case 'EUR': return 0.92;
    case 'GBP': return 0.78;
    case 'MXN': return 18;
    case 'USD':
    default: return 1.0;
  }
}

export function convertUSDToCurrency(amountInUSD: number, currency: string): number {
  const num = typeof amountInUSD === 'number' && !isNaN(amountInUSD) ? amountInUSD : 0;
  const rate = getExchangeRate(currency);
  return Math.round(num * rate);
}

export function convertCurrencyToUSD(amountInCurrency: number, currency: string): number {
  const num = typeof amountInCurrency === 'number' && !isNaN(amountInCurrency) ? amountInCurrency : 0;
  const rate = getExchangeRate(currency);
  return num / rate;
}

export function formatPrice(amountInUSD: number, currency: string): string {
  const num = typeof amountInUSD === 'number' && !isNaN(amountInUSD) ? amountInUSD : 0;
  const rate = getExchangeRate(currency);
  const converted = Math.round(num * rate);
  switch (currency) {
    case 'EUR':
      return `€ ${converted.toLocaleString()} EUR`;
    case 'GBP':
      return `£ ${converted.toLocaleString()} GBP`;
    case 'MXN':
      return `$ ${converted.toLocaleString()} MXN`;
    case 'USD':
    default:
      return `$ ${converted.toLocaleString()} USD`;
  }
}

export function getCurrencySymbol(curr: string): string {
  switch (curr) {
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'MXN':
      return '$';
    case 'USD':
    default:
      return '$';
  }
}
