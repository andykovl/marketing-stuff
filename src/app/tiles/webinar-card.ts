import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { LineBasis, Webinar } from '../model/layout.model';
import { WebinarStatus } from '../state/schedule';
import { formatCet } from '../state/time';

@Component({
  selector: 'app-webinar-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card">
      @if (withImage()) {
        <img
          class="card-image"
          [src]="webinar().image"
          [style.--focus-x]="focusX()"
          alt=""
          loading="lazy"
        />
      }
      <div class="card-rubric">
        <span class="chip kind">Вебинар</span>
        @if (status() !== 'recorded') {
          <span [class]="'chip status ' + status()">
            @if (status() === 'live') {
              <i class="dot"></i> Онлайн
            } @else {
              {{ startLabel() }}
            }
          </span>
        }
      </div>
      <div class="body">
        <h3 class="card-title">{{ webinar().title }}</h3>
        @if (basis() !== 25) {
          <p class="speaker">{{ webinar().speaker }}</p>
        }
      </div>
      <div class="footer">
        <button class="cta" type="button">{{ ctaLabel() }}</button>
      </div>
    </article>
  `,
  styleUrl: './webinar-card.scss',
  host: {
    '[class]': '"size-" + basis()',
    '[class.with-image]': 'withImage()',
  },
})
export class WebinarCard {
  readonly webinar = input.required<Webinar>();
  readonly start = input.required<string>();
  readonly status = input.required<WebinarStatus>();
  readonly basis = input.required<LineBasis>();

  protected readonly withImage = computed(() => this.basis() !== 25 && !!this.webinar().image);
  protected readonly startLabel = computed(() => formatCet(this.start()));
  protected readonly focusX = computed(() => this.webinar().imageFocus?.split(' ')[0] ?? '50%');
  protected readonly ctaLabel = computed(() => {
    switch (this.status()) {
      case 'live':
        return 'Смотреть';
      case 'recorded':
        return 'Смотреть запись';
      default:
        return 'Записаться';
    }
  });
}
