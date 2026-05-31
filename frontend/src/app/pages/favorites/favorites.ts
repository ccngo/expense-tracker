import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { FavoriteService } from '../../services/favorite';
import { FavoriteExpense } from '../../models/favorite-expense';
import { Category, PaymentMethod } from '../../models/expense';
import { EnumLabelPipe } from '../../pipes/enum-label-pipe';
import { CategoryLabelComponent } from '../../components/category-label';
import { HelpService } from '../../services/help';

@Component({
  selector: 'app-favorites',
  imports: [
    ReactiveFormsModule, MatTableModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, CurrencyPipe, EnumLabelPipe, CategoryLabelComponent,
  ],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})
export class Favorites implements OnInit {
  help = inject(HelpService);
  private service = inject(FavoriteService);
  private fb = inject(FormBuilder);

  favorites = signal<FavoriteExpense[]>([]);
  columns = ['title', 'category', 'amount', 'paymentMethod', 'actions'];
  categories: Category[] = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Other'];
  paymentMethods: PaymentMethod[] = ['Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'EWallet'];

  form = this.fb.group({
    title: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    category: ['' as Category | '', Validators.required],
    paymentMethod: ['' as PaymentMethod | ''],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe(data => this.favorites.set(data));
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.service.create({
      title: v.title!,
      amount: v.amount!,
      category: v.category as Category,
      paymentMethod: (v.paymentMethod || undefined) as PaymentMethod | undefined,
    }).subscribe(() => {
      this.form.reset();
      this.load();
    });
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() => this.load());
  }
}
