import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-top-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="banner">
      <picture>
        <source media="(max-width: 767px)" srcset="snapshot/banner/unlimited-mobile-640.webp" />
        <img
          src="snapshot/banner/unlimited-1234.webp"
          srcset="snapshot/banner/unlimited-1234.webp 1234w, snapshot/banner/unlimited-2468.webp 2468w"
          sizes="(max-width: 1274px) 100vw, 1234px"
          width="1234"
          height="250"
          alt="Подписка The Bell.Unlimited"
          fetchpriority="high"
        />
      </picture>
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin-top: 10px;
    }
    img {
      display: block;
      width: 100%;
      height: auto;
    }
    @media (max-width: 767px) {
      :host {
        margin-top: 4px;
      }
      .banner {
        max-width: 300px;
        margin: 0 auto;
      }
    }
  `,
})
export class TopBanner {}
