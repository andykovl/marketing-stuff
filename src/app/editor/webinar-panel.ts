import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { LayoutStore, SelectedTile } from '../state/layout.store';
import { WebinarStatus, webinarEnd, webinarStatus } from '../state/schedule';
import { MINUTE, addMs, formatCet, fromInputValue, toInputValue } from '../state/time';
import { WebinarCard } from '../tiles/webinar-card';

@Component({
  selector: 'app-webinar-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WebinarCard],
  templateUrl: './webinar-panel.html',
  styleUrls: ['./webinar-panel.scss'],
})
export class WebinarPanel {
  protected readonly store = inject(LayoutStore);

  readonly selected = input.required<SelectedTile>();

  protected readonly tile = computed(() => this.selected().tile);
  protected readonly config = computed(() => this.tile().webinar);
  protected readonly basis = computed(() => this.selected().line.basis);
  protected readonly webinar = computed(() => this.store.webinar(this.config().webinarId));
  protected readonly end = computed(() => webinarEnd(this.config()));
  protected readonly status = computed(() => webinarStatus(this.config(), this.store.now()));

  protected readonly states: readonly { value: WebinarStatus; label: string }[] = [
    { value: 'upcoming', label: 'Будет' },
    { value: 'live', label: 'Идёт' },
    { value: 'recorded', label: 'Был' },
  ];

  protected readonly toInput = toInputValue;
  protected readonly formatCet = formatCet;

  protected pick(event: Event): void {
    const webinar = this.store.webinar((event.target as HTMLSelectElement).value);
    if (!webinar) return;
    this.store.updateWebinar(this.tile().id, {
      webinarId: webinar.id,
      start: webinar.start,
      durationMin: webinar.durationMin,
    });
  }

  protected setStart(event: Event): void {
    const start = fromInputValue((event.target as HTMLInputElement).value);
    if (start) this.store.updateWebinar(this.tile().id, { start });
  }

  protected setEnd(event: Event): void {
    const end = fromInputValue((event.target as HTMLInputElement).value);
    const start = this.config().start;
    if (!end || !start) return;
    const minutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / MINUTE);
    if (minutes > 0) this.store.updateWebinar(this.tile().id, { durationMin: minutes });
  }

  protected setState(status: WebinarStatus): void {
    const now = new Date(this.store.now()).toISOString();
    const duration = this.config().durationMin;
    const start =
      status === 'upcoming'
        ? addMs(now, 60 * MINUTE)
        : status === 'live'
          ? addMs(now, -10 * MINUTE)
          : addMs(now, -(duration + 60) * MINUTE);
    this.store.updateWebinar(this.tile().id, { start });
  }
}
