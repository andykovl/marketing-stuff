import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { TILE_TYPES, Tile, TileType } from '../model/layout.model';
import { LayoutStore } from '../state/layout.store';
import { resolveProductId, webinarStatus } from '../state/schedule';
import { formatCet } from '../state/time';

interface CellSummary {
  title: string;
  meta: string;
  fallback: boolean;
}

@Component({
  selector: 'app-constructor-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (line of store.lines(); track line.id) {
      <div [class]="'line basis-' + line.basis">
        @for (tile of line.tiles; track tile.id) {
          @let s = summaries().get(tile.id);
          <div
            [class]="'cell type-' + tile.type"
            [class.selected]="store.selectedTileId() === tile.id"
            [class.fallback]="s?.fallback"
            [attr.tabindex]="tile.type === 'news' ? null : 0"
            [attr.role]="tile.type === 'news' ? null : 'button'"
            (click)="store.select(tile.id)"
            (keydown.enter)="store.select(tile.id)"
          >
            <select
              class="type"
              aria-label="Тип блока"
              (click)="$event.stopPropagation()"
              (change)="setType(tile, $event)"
            >
              @for (t of types; track t.value) {
                <option [value]="t.value" [selected]="t.value === tile.type">{{ t.label }}</option>
              }
            </select>
            @if (s) {
              <p class="title">{{ s.title }}</p>
              <p class="meta">{{ s.meta }}</p>
            }
          </div>
        }
      </div>
    }
  `,
  styleUrl: './constructor-grid.scss',
})
export class ConstructorGrid {
  protected readonly store = inject(LayoutStore);
  protected readonly types = TILE_TYPES;

  protected readonly summaries = computed(() => {
    const now = this.store.now();
    const map = new Map<string, CellSummary>();
    for (const line of this.store.lines()) {
      for (const tile of line.tiles) map.set(tile.id, this.summarize(tile, now));
    }
    return map;
  });

  protected setType(tile: Tile, event: Event): void {
    this.store.setTileType(tile.id, (event.target as HTMLSelectElement).value as TileType);
  }

  private summarize(tile: Tile, now: number): CellSummary {
    const newsTitle = this.store.news[tile.newsId]?.title ?? '';

    if (tile.type === 'product') {
      const count = tile.product.periods.length;
      const product = this.store.product(resolveProductId(tile.product, now));
      if (!product) {
        return {
          title: count ? 'Сейчас нет активного периода' : 'Расписание пустое',
          meta: 'Показывается новость редакции',
          fallback: true,
        };
      }
      return {
        title: product.name,
        meta: `${count} в очереди`,
        fallback: false,
      };
    }

    if (tile.type === 'webinar') {
      const webinar = this.store.webinar(tile.webinar.webinarId);
      if (!webinar || !tile.webinar.start) {
        return { title: 'Вебинар не выбран', meta: 'Показывается новость редакции', fallback: true };
      }
      const status = webinarStatus(tile.webinar, now);
      const meta = status === 'live' ? 'Онлайн' : status === 'recorded' ? 'Запись' : formatCet(tile.webinar.start);
      return { title: webinar.title, meta, fallback: false };
    }

    return { title: newsTitle, meta: this.store.news[tile.newsId]?.rubric?.title ?? '', fallback: false };
  }
}
