import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CheckoutDialog } from './checkout/checkout-dialog';
import { ConstructorPage } from './editor/constructor-page';
import { HomeGrid } from './home/home-grid';
import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';
import { TopBanner } from './layout/top-banner';
import { ModeService } from './state/mode.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TopBanner, SiteHeader, HomeGrid, SiteFooter, ConstructorPage, CheckoutDialog],
  template: `
    @if (mode.mode() === 'site') {
      <div class="page">
        <app-top-banner />
        <app-site-header />
        <main>
          <app-home-grid />
        </main>
      </div>
      <app-checkout-dialog />
    } @else {
      <app-constructor-page />
    }
    <app-site-footer />
  `,
  styles: `
    .page {
      max-width: var(--page-width);
      margin: 0 auto;
      padding: 0 var(--page-gutter);
    }
    main {
      padding-top: 10px;
    }
  `,
})
export class App {
  protected readonly mode = inject(ModeService);
}
