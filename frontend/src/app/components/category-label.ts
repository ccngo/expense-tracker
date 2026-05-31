import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EnumLabelPipe, CategoryIconPipe } from '../pipes/enum-label-pipe';

@Component({
  selector: 'app-category-label',
  imports: [MatIconModule, EnumLabelPipe, CategoryIconPipe],
  template: `
    <span class="category-label">
      <mat-icon>{{ value() | categoryIcon }}</mat-icon>
      {{ value() | enumLabel }}
    </span>
  `,
  styles: [`
    .category-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `]
})
export class CategoryLabelComponent {
  value = input<string | null | undefined>();
}
