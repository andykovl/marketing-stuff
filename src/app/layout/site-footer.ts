import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { LayoutStore } from '../state/layout.store';
import { ModeService } from '../state/mode.service';

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <footer [class.bar-only]="mode.mode() === 'constructor'">
      @if (mode.mode() === 'site') {
        <div class="inner cols">
          <div>
            <h4>Рассылки</h4>
            <span>Утренняя</span>
            <span>Вечерняя</span>
            <span>Итоги недели</span>
            <span>The Bell.Tech</span>
            <span>The Bell.Invest</span>
          </div>
          <div>
            <h4>Telegram</h4>
            <span>The Bell</span>
            <span>The Bell.Tech</span>
            <span>The Bell.Invest</span>
          </div>
          <div>
            <h4>О нас</h4>
            <span>Стать патроном</span>
            <span>О проекте</span>
            <span>Команда и контакты</span>
          </div>
          <div>
            <h4>Коммерция</h4>
            <span>Партнеры</span>
            <span>Рекламодателям</span>
          </div>
        </div>
      }

      <div class="bar">
        <div class="inner bar-inner">
          <p class="note">
            Прототип. Новости — снимок thebell.io от {{ store.fetchedAt | date: 'd.MM.yyyy' }}.
          </p>
          <button
            class="switch"
            type="button"
            role="switch"
            [attr.aria-checked]="mode.mode() === 'constructor'"
            (click)="mode.toggle()"
          >
            <span class="label" [class.on]="mode.mode() === 'site'">Сайт</span>
            <span class="track"><span class="thumb"></span></span>
            <span class="label" [class.on]="mode.mode() === 'constructor'">Конструктор</span>
          </button>
        </div>
      </div>
    </footer>
  `,
  styles: `
    footer {
      margin-top: 40px;
      padding-bottom: 53px;
      background: #000;
      color: #fff;
      cursor: default;
    }
    footer.bar-only {
      margin-top: 0;
    }
    .inner {
      max-width: var(--page-width);
      margin: 0 auto;
      padding: 0 var(--page-gutter);
    }
    .cols {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 24px;
      padding-top: 40px;
      padding-bottom: 32px;
    }
    h4 {
      margin: 0 0 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #9e9e9e;
    }
    .cols span {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .bar {
      position: fixed;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 20;
      background: #000;
      border-top: 1px solid #222;
    }
    .bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 52px;
    }
    .note {
      margin: 0;
      font-size: 12px;
      color: #9e9e9e;
    }
    .switch {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 4px;
      border: 0;
      background: none;
      color: #fff;
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }
    .label {
      color: #777;
      transition: color 0.15s;
    }
    .label.on {
      color: #fff;
      font-weight: 600;
    }
    .track {
      position: relative;
      width: 40px;
      height: 22px;
      border-radius: 11px;
      background: #333;
      transition: background 0.15s;
    }
    .thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s;
    }
    .switch[aria-checked='true'] .track {
      background: var(--accent);
    }
    .switch[aria-checked='true'] .thumb {
      transform: translateX(18px);
    }
    .switch:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
      border-radius: 8px;
    }
    @media (max-width: 767px) {
      .note {
        display: none;
      }
      .bar-inner {
        justify-content: center;
      }
    }
  `,
})
export class SiteFooter {
  protected readonly store = inject(LayoutStore);
  protected readonly mode = inject(ModeService);
}
