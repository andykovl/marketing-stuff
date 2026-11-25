import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { LineBasis } from '../model/layout.model';
import { LayoutStore } from '../state/layout.store';

@Component({
  selector: 'app-news-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-card.html',
  styleUrl: './news-card.scss',
  host: {
    '[class]': '"size-" + basis()',
    '[class.with-image]': 'withImage()',
  },
})
export class NewsCard {
  private readonly store = inject(LayoutStore);

  readonly newsId = input.required<string>();
  readonly basis = input.required<LineBasis>();

  protected readonly news = computed(() => this.store.news[this.newsId()]);
  protected readonly withImage = computed(() => this.basis() !== 25 && !!this.news()?.image);
}
