export type LineBasis = 25 | 33 | 50 | 100;

export type TileType = 'news' | 'product' | 'webinar';

export const TILE_TYPES: readonly { value: TileType; label: string }[] = [
  { value: 'news', label: 'Новость' },
  { value: 'product', label: 'Продукт' },
  { value: 'webinar', label: 'Вебинар' },
];

export interface Rubric {
  title: string;
  exclusive: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  rubric: Rubric | null;
  date: string;
  image: string | null;
}

export interface Price {
  id: string;
  title: string;
  unitAmount: number;
  currency: string;
  compareAtAmount?: number;
  recurring: { interval: 'month' | 'year'; intervalCount: number };
  trial?: boolean;
  intro?: boolean;
  amountIsFrom?: boolean;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  includes: string[];
  prices: Price[];
  accent: string;
  theme?: 'light';
  image?: string;
  imageBleed?: boolean;
  showcase: boolean;
}

export interface Webinar {
  id: string;
  title: string;
  speaker: string;
  start: string;
  durationMin: number;
  image: string | null;
  imageFocus?: string;
  productId: string;
}

export interface ProductPeriod {
  id: string;
  start: string;
  end: string;
  productId: string;
}

export interface ProductTileConfig {
  periods: ProductPeriod[];
}

export interface WebinarTileConfig {
  webinarId: string | null;
  start: string | null;
  durationMin: number;
}

export interface Tile {
  id: string;
  type: TileType;
  newsId: string;
  product: ProductTileConfig;
  webinar: WebinarTileConfig;
}

export interface GridLine {
  id: string;
  basis: LineBasis;
  minHeight: number;
  tiles: Tile[];
}
