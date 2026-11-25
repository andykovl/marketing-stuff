import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LayoutStore } from '../state/layout.store';
import { TileComponent } from '../tiles/tile';

@Component({
  selector: 'app-home-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TileComponent],
  template: `
    <h1 class="visually-hidden">The Bell — деловые новости и аналитика</h1>
    @for (line of store.lines(); track line.id) {
      <section [class]="'line basis-' + line.basis" [style.min-height.px]="line.minHeight" [attr.data-line]="line.id">
        @for (tile of line.tiles; track tile.id) {
          <app-tile [tile]="tile" [basis]="line.basis" />
        }
      </section>
    }
  `,
  styleUrl: './home-grid.scss',
})
export class HomeGrid {
  protected readonly store = inject(LayoutStore);
}
