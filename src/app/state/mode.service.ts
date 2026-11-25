import { Injectable, signal } from '@angular/core';

export type AppMode = 'site' | 'constructor';

const HASH = '#constructor';

@Injectable({ providedIn: 'root' })
export class ModeService {
  private readonly modeState = signal<AppMode>(this.fromHash());
  readonly mode = this.modeState.asReadonly();

  constructor() {
    window.addEventListener('hashchange', () => this.modeState.set(this.fromHash()));
  }

  set(mode: AppMode): void {
    this.modeState.set(mode);
    const url = mode === 'constructor' ? HASH : location.pathname + location.search;
    history.replaceState(null, '', url);
    window.scrollTo({ top: 0 });
  }

  toggle(): void {
    this.set(this.modeState() === 'site' ? 'constructor' : 'site');
  }

  private fromHash(): AppMode {
    return location.hash === HASH ? 'constructor' : 'site';
  }
}
