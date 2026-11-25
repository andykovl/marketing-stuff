import { ProductPeriod, ProductTileConfig, WebinarTileConfig } from '../model/layout.model';
import { MINUTE } from './time';


const ms = (iso: string) => new Date(iso).getTime();

export function isValidPeriod(p: ProductPeriod): boolean {
  return ms(p.end) > ms(p.start) && !!p.productId;
}

export function isLive(p: ProductPeriod, now: number): boolean {
  return isValidPeriod(p) && ms(p.start) <= now && now < ms(p.end);
}

export function activePeriod(config: ProductTileConfig, now: number): ProductPeriod | null {
  return config.periods.find((p) => isLive(p, now)) ?? null;
}

export function resolveProductId(config: ProductTileConfig, now: number): string | null {
  return activePeriod(config, now)?.productId ?? null;
}

export type WebinarStatus = 'upcoming' | 'live' | 'recorded';

export function webinarEnd(config: WebinarTileConfig): string | null {
  if (!config.start) return null;
  return new Date(ms(config.start) + config.durationMin * MINUTE).toISOString();
}

export function webinarStatus(config: WebinarTileConfig, now: number): WebinarStatus {
  const end = webinarEnd(config);
  if (!config.start || !end) return 'upcoming';
  if (now < ms(config.start)) return 'upcoming';
  if (now < ms(end)) return 'live';
  return 'recorded';
}
