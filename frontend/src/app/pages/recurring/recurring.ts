import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecurringService } from '../../services/recurring';
import { RecurringExpense, RecurringFrequency } from '../../models/recurring-expense';
import { Category, PaymentMethod } from '../../models/expense';
import { EnumLabelPipe } from '../../pipes/enum-label-pipe';
import { CategoryLabelComponent } from '../../components/category-label';
import { HelpService } from '../../services/help';
import { PrivacyService } from '../../services/privacy';

@Component({
  selector: 'app-recurring',
  imports: [
    ReactiveFormsModule, MatTableModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, CurrencyPipe, EnumLabelPipe,
    CategoryLabelComponent, MatSnackBarModule,
  ],
  templateUrl: './recurring.html',
  styleUrl: './recurring.scss'
})
export class Recurring implements OnInit {
  help = inject(HelpService);
  privacy = inject(PrivacyService);
  private service = inject(RecurringService);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);

  recurring = signal<RecurringExpense[]>([]);
  columns = ['title', 'amount', 'category', 'frequency', 'startDate', 'lastExecutedDate', 'actions'];
  categories: Category[] = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Other'];
  paymentMethods: PaymentMethod[] = ['Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'EWallet'];
  frequencies: RecurringFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  form = this.fb.group({
    title: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    category: ['' as Category | '', Validators.required],
    paymentMethod: ['' as PaymentMethod | ''],
    frequency: ['' as RecurringFrequency | '', Validators.required],
    startDate: [new Date(), Validators.required],
    endDate: [null as Date | null],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe(data => this.recurring.set(data));
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const d = (v.startDate as unknown as Date);
    const endD = (v.endDate as unknown as Date | null);
    this.service.create({
      title: v.title!,
      amount: v.amount!,
      category: v.category! as Category,
      paymentMethod: v.paymentMethod ? (v.paymentMethod as PaymentMethod) : null,
      frequency: v.frequency! as RecurringFrequency,
      startDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      endDate: endD ? `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}` : null,
    }).subscribe(() => {
      this.snackbar.open(`${v.title} added to recurring`, 'OK', { duration: 3000 });
      this.form.reset({ startDate: new Date() });
      this.load();
    });
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() => this.load());
  }

  nextRunDate(r: RecurringExpense): string {
    if (!r.lastExecutedDate) return r.startDate;
    const last = new Date(r.lastExecutedDate);
    const next = new Date(last);
    switch (r.frequency) {
      case 'Daily': next.setDate(next.getDate() + 1); break;
      case 'Weekly': next.setDate(next.getDate() + 7); break;
      case 'Monthly': next.setMonth(next.getMonth() + 1); break;
      case 'Yearly': next.setFullYear(next.getFullYear() + 1); break;
    }
    return next.toISOString().split('T')[0];
  }
}
