import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrivacyService {
  readonly privacyMode = signal<boolean>(
    sessionStorage.getItem('privacy_mode') !== 'false'
  );

  toggle() {
    const next = !this.privacyMode();
    this.privacyMode.set(next);
    sessionStorage.setItem('privacy_mode', String(next));
  }
}
