import { Injectable, computed, inject, signal } from '@angular/core';

import { Price, Product } from '../model/layout.model';
import { monthlyPrice, periodMonths } from '../model/price';
import { LayoutStore } from '../state/layout.store';

const PRODUCT_KEY = 'checkout';
const PRICE_KEY = 'price';

export function plans(product: Product): Price[] {
  return product.prices.filter((p) => !p.intro);
}

export function introPrice(plan: Price, product: Product): Price | null {
  return plan === monthlyPrice(product) ? (product.prices.find((p) => p.intro) ?? null) : null;
}

function defaultPlan(product: Product): Price {
  return plans(product).find((p) => periodMonths(p) === 12) ?? plans(product)[0];
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly store = inject(LayoutStore);

  readonly products = this.store.showcaseProducts;

  private readonly productId = signal<string | null>(null);
  private readonly priceId = signal<string | null>(null);

  readonly product = computed(() => this.products.find((p) => p.id === this.productId()) ?? null);
  readonly price = computed(() => {
    const product = this.product();
    if (!product) return null;
    const id = this.priceId();
    const plan = plans(product).find((p) => p.id === id);
    const intro = product.prices.find((p) => p.intro && p.id === id);
    return plan ?? (intro && monthlyPrice(product)) ?? defaultPlan(product);
  });
  readonly isOpen = computed(() => this.product() !== null);

  constructor() {
    const params = new URLSearchParams(location.search);
    this.productId.set(params.get(PRODUCT_KEY));
    this.priceId.set(params.get(PRICE_KEY));
    if (params.has(PRODUCT_KEY) || params.has(PRICE_KEY)) this.writeUrl();
  }

  open(productId: string): void {
    this.productId.set(productId);
    this.priceId.set(null);
    this.writeUrl();
  }

  selectProduct(productId: string): void {
    this.productId.set(productId);
    this.writeUrl();
  }

  selectPrice(priceId: string): void {
    this.priceId.set(priceId);
    this.writeUrl();
  }

  close(): void {
    this.productId.set(null);
    this.priceId.set(null);
    this.writeUrl();
  }

  private writeUrl(): void {
    const params = new URLSearchParams(location.search);
    const product = this.product();
    const price = this.price();
    if (product && price) {
      params.set(PRODUCT_KEY, product.id);
      params.set(PRICE_KEY, price.id);
    } else {
      params.delete(PRODUCT_KEY);
      params.delete(PRICE_KEY);
    }
    this.priceId.set(price?.id ?? null);
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? `?${query}` : '') + location.hash);
  }
}
