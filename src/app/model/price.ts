import { Price, Product } from './layout.model';

export function formatMoney(minorUnits: number, currency: string): string {
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    trailingZeroDisplay: 'stripIfInteger',
  });
  const digits = format.resolvedOptions().maximumFractionDigits ?? 2;
  return format.format(minorUnits / 10 ** digits);
}

export function formatPrice(price: Price): string {
  return (price.amountIsFrom ? 'от ' : '') + formatMoney(price.unitAmount, price.currency);
}

export function periodLabel(price: Price): string {
  if (price.trial) return 'первый месяц';
  const months = periodMonths(price);
  if (months === 1) return 'в месяц';
  if (months === 6) return 'раз в полгода';
  if (months === 12) return 'раз в год';
  return `раз в ${months} мес.`;
}

export function periodMonths(price: Price): number {
  const { interval, intervalCount } = price.recurring;
  return interval === 'year' ? intervalCount * 12 : intervalCount;
}

export function perMonth(price: Price): number {
  return Math.round(price.unitAmount / periodMonths(price));
}

export function compareAt(price: Price, product: Product): number | undefined {
  if (price.compareAtAmount !== undefined) return price.compareAtAmount;
  const monthly = monthlyPrice(product);
  if (price.trial || !monthly || monthly === price) return undefined;
  return monthly.unitAmount * periodMonths(price);
}

export function savings(price: Price, product: Product): number {
  const base = compareAt(price, product);
  return base === undefined ? 0 : Math.max(0, base - price.unitAmount);
}

export function discountPercent(price: Price, product: Product): number {
  const base = compareAt(price, product);
  return base ? Math.round((savings(price, product) / base) * 100) : 0;
}

export function monthlyPrice(product: Product): Price | undefined {
  return product.prices.find((p) => !p.trial && periodMonths(p) === 1);
}

export function priceFrom(product: Product): string {
  const regular = product.prices.filter((p) => !p.trial);
  const base =
    monthlyPrice(product) ?? regular.reduce((a, b) => (perMonth(b) < perMonth(a) ? b : a));
  return formatMoney(perMonth(base), base.currency) + '/мес';
}
