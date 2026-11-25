import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { LineBasis, Product, Tile, Webinar } from '../model/layout.model';
import { LayoutStore } from '../state/layout.store';
import { WebinarStatus, resolveProductId, webinarStatus } from '../state/schedule';
import { NewsCard } from './news-card';
import { ProductCard } from './product-card';
import { WebinarCard } from './webinar-card';

type TileView =
  | { kind: 'news'; newsId: string }
  | { kind: 'product'; product: Product }
  | { kind: 'webinar'; webinar: Webinar; start: string; status: WebinarStatus };

@Component({
  selector: 'app-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NewsCard, ProductCard, WebinarCard],
  template: `
    @let v = view();
    @switch (v.kind) {
      @case ('product') {
        <app-product-card [product]="v.product" [basis]="basis()" />
      }
      @case ('webinar') {
        <app-webinar-card
          [webinar]="v.webinar"
          [start]="v.start"
          [status]="v.status"
          [basis]="basis()"
        />
      }
      @default {
        <app-news-card [newsId]="v.newsId" [basis]="basis()" />
      }
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
  host: {
    '[attr.data-tile]': 'tile().id',
    '[attr.data-kind]': 'view().kind',
  },
})
export class TileComponent {
  private readonly store = inject(LayoutStore);

  readonly tile = input.required<Tile>();
  readonly basis = input.required<LineBasis>();

  protected readonly view = computed<TileView>(() => {
    const tile = this.tile();
    const now = this.store.now();

    if (tile.type === 'product') {
      const product = this.store.product(resolveProductId(tile.product, now));
      if (product) return { kind: 'product', product };
    }

    if (tile.type === 'webinar') {
      const webinar = this.store.webinar(tile.webinar.webinarId);
      if (webinar && tile.webinar.start) {
        return {
          kind: 'webinar',
          webinar,
          start: tile.webinar.start,
          status: webinarStatus(tile.webinar, now),
        };
      }
    }

    return { kind: 'news', newsId: tile.newsId };
  });
}
