import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { ExpenseService } from '../../services/expense';
import { FavoriteService } from '../../services/favorite';
import { FavoriteExpense } from '../../models/favorite-expense';
import { Category, PaymentMethod } from '../../models/expense';
import { EnumLabelPipe } from '../../pipes/enum-label-pipe';
import { CategoryLabelComponent } from '../../components/category-label';
import { HelpService } from '../../services/help';

@Component({
  selector: 'app-add-expense',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, MatMenuModule, MatSnackBarModule, CurrencyPipe, EnumLabelPipe, CategoryLabelComponent,
  ],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.scss'
})
export class AddExpense implements OnInit {
  help = inject(HelpService);
  private service = inject(ExpenseService);
  private favoriteService = inject(FavoriteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);
  editId = signal<number | null>(null);
  isEditMode = computed(() => this.editId() !== null);

  categories: Category[] = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Other'];
  paymentMethods: PaymentMethod[] = ['Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'EWallet'];
  favorites = signal<FavoriteExpense[]>([]);

  form = this.fb.group({
    title: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    category: ['' as Category | '', Validators.required],
    date: [new Date(), Validators.required],
    notes: [''],
    paymentMethod: ['' as PaymentMethod | ''],
  });

  ngOnInit() {
    this.favoriteService.getAll().subscribe(data => this.favorites.set(data));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editId.set(id);
      this.service.getById(id).subscribe(expense => {
        const [year, month, day] = expense.date.split('-').map(Number);
        this.form.patchValue({
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: new Date(year, month - 1, day),
          notes: expense.notes ?? '',
          paymentMethod: expense.paymentMethod ?? '',
        });
      });
    }
  }

  applyFavorite(fav: FavoriteExpense) {
    this.form.patchValue({
      title: fav.title,
      amount: fav.amount,
      category: fav.category,
      paymentMethod: fav.paymentMethod ?? '',
    });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const d = v.date as Date;
    const expense = {
      title: v.title!,
      amount: v.amount!,
      category: v.category! as Category,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      notes: v.notes ?? undefined,
      paymentMethod: v.paymentMethod ? (v.paymentMethod as PaymentMethod) : undefined,
    };
    const id = this.editId();
    const request: Observable<unknown> = id !== null
      ? this.service.update(id, { id, ...expense })
      : this.service.create(expense);
    request.subscribe(() => {
      const msg = id !== null ? 'Expense updated' : 'Expense added';
      this.snackbar.open(msg, 'OK', { duration: 3000 });
      this.router.navigate(['/expenses']);
    });
  }
}
