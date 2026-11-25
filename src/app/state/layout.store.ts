import { Injectable, computed, effect, signal } from '@angular/core';

import homepage from '../data/homepage.snapshot.json';
import productsData from '../data/products.json';
import webinarsData from '../data/webinars.snapshot.json';
import {
  GridLine,
  LineBasis,
  NewsItem,
  Product,
  ProductTileConfig,
  Tile,
  TileType,
  Webinar,
  WebinarTileConfig,
} from '../model/layout.model';
import { DAY, addMs, startOfHour } from './time';

const STORAGE_KEY = 'thebell-constructor-v3';
const BASES: readonly LineBasis[] = [25, 33, 50, 100];

let idCounter = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const emptyProduct = (): ProductTileConfig => ({ periods: [] });
const emptyWebinar = (): WebinarTileConfig => ({ webinarId: null, start: null, durationMin: 90 });

function toLineBasis(value: number): LineBasis {
  if (!BASES.includes(value as LineBasis)) throw new Error(`Unknown grid line basis: ${value}`);
  return value as LineBasis;
}

function editorialLines(): GridLine[] {
  return homepage.lines.map((line) => ({
    id: line.id,
    basis: toLineBasis(line.basis),
    minHeight: line.minHeight,
    tiles: line.slots.map((newsId, i) => ({
      id: `${line.id}-${i}`,
      type: 'news' as TileType,
      newsId,
      product: emptyProduct(),
      webinar: emptyWebinar(),
    })),
  }));
}

function seedLines(webinars: Webinar[]): GridLine[] {
  const lines = editorialLines();
  const now = Date.now();
  const start = addMs(startOfHour(now), -DAY);
  const firstEnd = addMs(start, 7 * DAY);

  const product = lines[1]?.tiles[1];
  if (product) {
    product.type = 'product';
    product.product = {
      periods: [
        { id: newId('period'), start, end: firstEnd, productId: 'unlimited' },
      ],
    };
  }

  const webinarTile = lines[2]?.tiles[1];
  const upcoming = webinars.find((w) => new Date(w.start).getTime() > now) ?? webinars.at(-1);
  if (webinarTile && upcoming) {
    webinarTile.type = 'webinar';
    webinarTile.webinar = { webinarId: upcoming.id, start: upcoming.start, durationMin: upcoming.durationMin };
  }
  return lines;
}

function loadLines(): GridLine[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const lines = JSON.parse(raw) as GridLine[];
    const sameShape =
      Array.isArray(lines) &&
      lines.length === homepage.lines.length &&
      lines.every((l, i) => l.tiles?.length === homepage.lines[i].slots.length);
    return sameShape ? lines : null;
  } catch {
    return null;
  }
}

export interface SelectedTile {
  tile: Tile;
  line: GridLine;
  lineIndex: number;
  slotIndex: number;
}

@Injectable({ providedIn: 'root' })
export class LayoutStore {
  readonly fetchedAt = homepage.fetchedAt;

  readonly news: Readonly<Record<string, NewsItem>> = Object.fromEntries(homepage.news.map((n) => [n.id, n]));
  readonly products = productsData.products as Product[];
  readonly showcaseProducts = this.products.filter((p) => p.showcase);
  readonly webinars = webinarsData.webinars as Webinar[];

  private readonly productMap = new Map(this.products.map((p) => [p.id, p]));
  private readonly webinarMap = new Map(this.webinars.map((w) => [w.id, w]));

  readonly now = signal(Date.now());

  private readonly linesState = signal<GridLine[]>(loadLines() ?? seedLines(this.webinars));
  readonly lines = this.linesState.asReadonly();

  readonly selectedTileId = signal<string | null>(null);

  readonly selected = computed<SelectedTile | null>(() => {
    const id = this.selectedTileId();
    if (!id) return null;
    const lines = this.linesState();
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const slotIndex = lines[lineIndex].tiles.findIndex((t) => t.id === id);
      if (slotIndex > -1) {
        return { tile: lines[lineIndex].tiles[slotIndex], line: lines[lineIndex], lineIndex, slotIndex };
      }
    }
    return null;
  });

  constructor() {
    setInterval(() => this.now.set(Date.now()), 30_000);
    effect(() => {
      const lines = this.linesState();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      } catch {
      }
    });
  }

  product(id: string | null | undefined): Product | null {
    return (id && this.productMap.get(id)) || null;
  }

  webinar(id: string | null | undefined): Webinar | null {
    return (id && this.webinarMap.get(id)) || null;
  }

  select(tileId: string | null): void {
    const previous = this.selectedTileId();
    if (previous && previous !== tileId) this.revertIfEmpty(previous);
    const tile = tileId ? this.findTile(tileId) : null;
    this.selectedTileId.set(tile && tile.type !== 'news' ? tile.id : null);
  }

  setTileType(tileId: string, type: TileType): void {
    this.updateTile(tileId, (t) => ({ ...t, type }));
    this.select(type === 'news' ? null : tileId);
  }

  updateProduct(tileId: string, fn: (config: ProductTileConfig) => ProductTileConfig): void {
    this.updateTile(tileId, (t) => ({ ...t, product: fn(t.product) }));
  }

  updateWebinar(tileId: string, patch: Partial<WebinarTileConfig>): void {
    this.updateTile(tileId, (t) => ({ ...t, webinar: { ...t.webinar, ...patch } }));
  }

  reset(): void {
    this.selectedTileId.set(null);
    this.linesState.set(seedLines(this.webinars));
  }

  private revertIfEmpty(tileId: string): void {
    const tile = this.findTile(tileId);
    if (!tile) return;
    const empty =
      (tile.type === 'product' && !tile.product.periods.length) || (tile.type === 'webinar' && !tile.webinar.webinarId);
    if (empty) this.updateTile(tileId, (t) => ({ ...t, type: 'news' }));
  }

  private findTile(tileId: string): Tile | null {
    for (const line of this.linesState()) {
      const tile = line.tiles.find((t) => t.id === tileId);
      if (tile) return tile;
    }
    return null;
  }

  private updateTile(tileId: string, fn: (tile: Tile) => Tile): void {
    this.linesState.update((lines) =>
      lines.map((line) =>
        line.tiles.some((t) => t.id === tileId)
          ? { ...line, tiles: line.tiles.map((t) => (t.id === tileId ? fn(t) : t)) }
          : line,
      ),
    );
  }
}
