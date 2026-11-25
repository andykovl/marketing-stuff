import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { CheckoutService } from '../checkout/checkout.service';

import { LineBasis, Product } from '../model/layout.model';
import { priceFrom } from '../model/price';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card" [style.--accent]="product().accent">
      @if (basis() !== 25) {
        <div class="card-rubric">
          <span class="chip">от {{ priceFrom() }}</span>
        </div>
      }
      @if (product().image && basis() !== 25) {
        <img class="art" [class.bleed]="product().imageBleed" [src]="product().image" alt="" />
      }
      <div class="body">
        <h3 class="card-title">{{ product().name }}</h3>
        <p class="tagline">{{ product().tagline }}</p>
      </div>
      @if (basis() !== 25) {
        <ul class="includes">
          @for (item of product().includes; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      }
      <div class="footer">
        @if (basis() === 25) {
          <span class="price">от {{ priceFrom() }}</span>
        }
        <button class="cta" type="button" (click)="checkout.open(product().id)">Подписаться</button>
      </div>
    </article>
  `,
  styleUrls: ['./product-card.scss', './product-card-variants.scss'],
  host: {
    '[class]': '"size-" + basis()',
    '[class.theme-light]': 'product().theme === "light"',
  },
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly basis = input.required<LineBasis>();

  protected readonly checkout = inject(CheckoutService);
  protected readonly priceFrom = computed(() => priceFrom(this.product()));
}
