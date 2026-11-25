import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LayoutStore } from '../state/layout.store';
import { ConstructorGrid } from './constructor-grid';
import { ProductPanel } from './product-panel';
import { WebinarPanel } from './webinar-panel';

@Component({
  selector: 'app-constructor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConstructorGrid, ProductPanel, WebinarPanel],
  template: `
    @let selected = store.selected();
    <div class="layout">
      <section class="grid-side">
        <header class="head">
          <h1>Конструктор главной</h1>
          <button class="reset" type="button" (click)="store.reset()">Сбросить демо</button>
        </header>
        <app-constructor-grid />
      </section>

      <aside class="panel" [class.open]="selected" aria-label="Настройки блока">
        @if (selected) {
          <button class="close-mobile" type="button" aria-label="Закрыть" (click)="store.select(null)">×</button>
        }
        @switch (selected?.tile?.type) {
          @case ('product') {
            <app-product-panel [selected]="selected!" />
          }
          @case ('webinar') {
            <app-webinar-panel [selected]="selected!" />
          }
          @default {
            <p class="empty">Выберите продукт или вебинар в сетке</p>
          }
        }
      </aside>
    </div>
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      height: calc(100dvh - 53px);
    }
    .grid-side {
      box-sizing: border-box;
      padding: 24px;
      overflow-y: auto;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    .reset {
      flex: none;
      padding: 8px 14px;
      border: 1px solid #d4d4d4;
      border-radius: 8px;
      background: #fff;
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }
    .panel {
      overflow-y: auto;
      border-left: 1px solid #e3e3e3;
      background: #fff;
    }
    .empty {
      display: grid;
      place-items: center;
      height: 100%;
      margin: 0;
      font-size: 14px;
      color: #8a8a8a;
    }
    .close-mobile {
      display: none;
    }
    @media (max-width: 900px) {
      .close-mobile {
        display: block;
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 2;
        width: 32px;
        height: 32px;
        border: 1px solid #e3e3e3;
        border-radius: 8px;
        background: #fff;
        font-size: 18px;
        cursor: pointer;
      }
      .layout {
        grid-template-columns: minmax(0, 1fr);
        height: auto;
      }
      .grid-side {
        overflow: visible;
      }
      .grid-side {
        padding: 16px;
      }
      .panel {
        display: none;
      }
      .panel.open {
        display: block;
        position: fixed;
        inset: 0 0 53px;
        z-index: 30;
        height: auto;
        border-left: 0;
      }
    }
  `,
})
export class ConstructorPage {
  protected readonly store = inject(LayoutStore);
}
