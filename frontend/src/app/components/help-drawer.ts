import { Component, inject, effect, viewChildren, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { HelpService, HELP_CONTENT, HelpTab } from '../services/help';

@Component({
  selector: 'app-help-drawer',
  imports: [MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './help-drawer.html',
  styleUrl: './help-drawer.scss'
})
export class HelpDrawerComponent {
  help = inject(HelpService);
  tabs = Object.entries(HELP_CONTENT) as [HelpTab, typeof HELP_CONTENT[HelpTab]][];
  sections = viewChildren<ElementRef>('section');

  constructor() {
    effect(() => {
      const active = this.help.activeTab();
      if (!this.help.isOpen()) return;
      setTimeout(() => {
        const idx = this.tabs.findIndex(([key]) => key === active);
        this.sections()[idx]?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  }

  isActive(tab: HelpTab) {
    return this.help.activeTab() === tab;
  }
}
