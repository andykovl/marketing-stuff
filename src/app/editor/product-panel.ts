import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';

import { ProductPeriod, ProductTileConfig } from '../model/layout.model';
import { LayoutStore, SelectedTile, newId } from '../state/layout.store';
import { isValidPeriod, resolveProductId } from '../state/schedule';
import { DAY, addMs, formatLocal, fromInputValue, startOfHour, toInputValue } from '../state/time';
import { ProductCard } from '../tiles/product-card';

@Component({
  selector: 'app-product-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCard],
  templateUrl: './product-panel.html',
  styleUrls: ['./product-panel.scss'],
  host: {
    '(document:click)': 'menuFor.set(null)',
  },
})
export class ProductPanel {
  protected readonly store = inject(LayoutStore);

  readonly selected = input.required<SelectedTile>();

  protected readonly tile = computed(() => this.selected().tile);
  protected readonly periods = computed(() => this.tile().product.periods);
  protected readonly basis = computed(() => this.selected().line.basis);

  protected readonly focusedId = linkedSignal<string, string | null>({
    source: () => this.tile().id,
    computation: () => null,
  });

  protected readonly menuFor = signal<string | null>(null);

  protected readonly previewProduct = computed(() => {
    const focused = this.periods().find((p) => p.id === this.focusedId());
    if (focused) return this.store.product(focused.productId);
    return this.store.product(resolveProductId(this.tile().product, this.store.now()));
  });

  protected readonly toInput = toInputValue;
  protected readonly formatLocal = formatLocal;
  protected readonly isValid = isValidPeriod;

  protected toggleMenu(periodId: string, event: Event): void {
    event.stopPropagation();
    this.menuFor.update((id) => (id === periodId ? null : periodId));
    this.focusedId.set(periodId);
  }

  protected addNext(): void {
    const last = this.periods().at(-1);
    const start = last ? last.end : startOfHour(this.store.now());
    const lastLength = last ? new Date(last.end).getTime() - new Date(last.start).getTime() : 0;
    const next =
      this.store.showcaseProducts.find((p) => p.id !== last?.productId) ?? this.store.showcaseProducts[0];
    const period: ProductPeriod = {
      id: newId('period'),
      start,
      end: addMs(start, lastLength > 0 ? lastLength : 7 * DAY),
      productId: next.id,
    };
    this.update((c) => ({ ...c, periods: [...c.periods, period] }));
    this.focusedId.set(period.id);
  }

  protected remove(periodId: string): void {
    this.update((c) => ({ ...c, periods: c.periods.filter((p) => p.id !== periodId) }));
    this.menuFor.set(null);
    if (this.focusedId() === periodId) this.focusedId.set(null);
  }

  protected setProduct(periodId: string, event: Event): void {
    const productId = (event.target as HTMLSelectElement).value;
    this.patch(periodId, { productId });
    this.focusedId.set(periodId);
  }

  protected setDate(periodId: string, field: 'start' | 'end', event: Event): void {
    const iso = fromInputValue((event.target as HTMLInputElement).value);
    if (iso) this.patch(periodId, { [field]: iso });
  }

  private patch(periodId: string, patch: Partial<ProductPeriod>): void {
    this.update((c) => ({ ...c, periods: c.periods.map((p) => (p.id === periodId ? { ...p, ...patch } : p)) }));
  }

  private update(fn: (c: ProductTileConfig) => ProductTileConfig): void {
    this.store.updateProduct(this.tile().id, fn);
  }
}
