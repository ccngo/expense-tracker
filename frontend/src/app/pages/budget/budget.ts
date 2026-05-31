import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { BudgetService } from '../../services/budget';
import { BudgetSummary, BudgetType, BudgetPeriod } from '../../models/budget-plan';
import { EnumLabelPipe } from '../../pipes/enum-label-pipe';
import { HelpService } from '../../services/help';

@Component({
  selector: 'app-budget',
  imports: [
    ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatButtonModule, MatIconModule, CurrencyPipe, EnumLabelPipe, MatSnackBarModule,
  ],
  templateUrl: './budget.html',
  styleUrl: './budget.scss'
})
export class Budget implements OnInit {
  help = inject(HelpService);
  private service = inject(BudgetService);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);

  summaries = signal<BudgetSummary[]>([]);
  typeGroups: { label: string; types: BudgetType[] }[] = [
    { label: 'General', types: ['Overall', 'CreditCard'] },
    { label: 'By Category', types: ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Other'] },
  ];
  periods: BudgetPeriod[] = ['Weekly', 'Monthly'];

  form = this.fb.group({
    type: ['' as BudgetType | '', Validators.required],
    period: ['' as BudgetPeriod | '', Validators.required],
    limit: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getSummary().subscribe(data => this.summaries.set(data));
  }

  progressClass(percentage: number): string {
    if (percentage >= 100) return 'over';
    if (percentage >= 80) return 'warning';
    return 'ok';
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.service.create({
      type: v.type as BudgetType,
      period: v.period as BudgetPeriod,
      limit: v.limit!,
    }).subscribe(result => {
      const msg = result.replaced
        ? `${v.type} ${v.period} budget updated to ${v.limit}`
        : `${v.type} ${v.period} budget added`;
      this.snackbar.open(msg, 'OK', { duration: 3000 });
      this.form.reset();
      this.load();
    });
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() => this.load());
  }
}
