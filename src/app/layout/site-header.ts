import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="row">
      <span class="icon burger-mobile" aria-hidden="true">
        <img src="snapshot/icons/menuline.svg" alt="" width="20" height="2" />
        <img src="snapshot/icons/menuline.svg" alt="" width="20" height="2" />
      </span>

      <span class="logo">
        <img src="snapshot/logo.svg" alt="The Bell" width="146" height="33" />
      </span>

      <nav class="tags" aria-label="Разделы">
        <span class="select">Главное</span>
        <span>Новости</span>
        <span>Экономика</span>
        <span>Технологии</span>
        <span>Бизнес</span>
        <span>Инвестиции</span>
      </nav>

      <div class="tools">
        <span class="unlimited">Unlimited</span>
        <span class="subscribe">Подписаться</span>
        <span class="lang"><span>en</span></span>
        <span class="icon search" aria-hidden="true">
          <img src="snapshot/icons/search.svg" alt="" width="21" height="22" />
        </span>
        <span class="icon burger" aria-hidden="true">
          <img src="snapshot/icons/menuline.svg" alt="" width="20" height="2" />
          <img src="snapshot/icons/menuline.svg" alt="" width="20" height="2" />
        </span>
        <span class="login">Войти</span>
      </div>

      <span class="icon account-mobile" aria-hidden="true">
        <img src="snapshot/icons/user.svg" alt="" width="21" height="20" />
      </span>
    </header>

    <div class="row-button-mobile">
      <span class="subscribe-mobile">Подписаться</span>
    </div>
  `,
  styleUrl: './site-header.scss',
})
export class SiteHeader {}
