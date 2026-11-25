import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { Product } from '../model/layout.model';

@Component({
  selector: 'app-product-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './product-picker.html',
  styleUrl: './product-picker.scss',
  host: {
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class ProductPicker {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  readonly products = input.required<readonly Product[]>();
  readonly selected = input.required<Product>();
  readonly pick = output<string>();

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(0);
  protected readonly activeId = computed(() => `product-option-${this.products()[this.activeIndex()]?.id}`);

  protected toggle(): void {
    if (this.open()) return this.open.set(false);
    this.activeIndex.set(Math.max(0, this.products().indexOf(this.selected())));
    this.open.set(true);
    afterNextRender(() => this.list()?.nativeElement.focus(), { injector: this.injector });
  }

  protected choose(product: Product, trigger: HTMLElement): void {
    this.open.set(false);
    trigger.focus();
    if (product !== this.selected()) this.pick.emit(product.id);
  }

  protected onKeydown(event: KeyboardEvent, trigger: HTMLElement): void {
    const last = this.products().length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(last, this.activeIndex() + 1),
      ArrowUp: Math.max(0, this.activeIndex() - 1),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      this.activeIndex.set(moves[event.key]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      this.choose(this.products()[this.activeIndex()], trigger);
    } else if (event.key === 'Escape') {
      this.open.set(false);
      trigger.focus();
    } else if (event.key === 'Tab') {
      this.open.set(false);
      return;
    } else {
      return;
    }
    event.preventDefault();
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
