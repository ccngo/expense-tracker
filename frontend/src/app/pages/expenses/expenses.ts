import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ExpenseService } from '../../services/expense';
import { Expense, Category, PaymentMethod } from '../../models/expense';
import { EnumLabelPipe } from '../../pipes/enum-label-pipe';
import { CategoryLabelComponent } from '../../components/category-label';
import { HelpService } from '../../services/help';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-expenses',
  imports: [
    RouterLink, ReactiveFormsModule, CurrencyPipe, EnumLabelPipe, CategoryLabelComponent,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatPaginatorModule, MatSortModule,
  ],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss'
})
export class Expenses implements OnInit {
  help = inject(HelpService);
  private service = inject(ExpenseService);
  private fb = inject(FormBuilder);

  expenses = signal<Expense[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = signal(10);
  sortBy = signal('date');
  sortDir = signal('desc');

  columns = ['title', 'category', 'amount', 'date', 'paymentMethod', 'actions'];
  categories: Category[] = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Other'];
  paymentMethods: PaymentMethod[] = ['Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'EWallet'];

  filters = this.fb.group({
    search: [''],
    category: [''],
    paymentMethod: [''],
    from: [null as Date | null],
    to: [null as Date | null],
  });

  ngOnInit() {
    this.load();
    this.filters.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.page.set(1);
      this.load();
    });
  }

  load() {
    const v = this.filters.value;
    this.service.getAll({
      search: v.search ?? '',
      category: v.category ?? '',
      paymentMethod: v.paymentMethod ?? '',
      from: v.from ? this.toDateStr(v.from) : '',
      to: v.to ? this.toDateStr(v.to) : '',
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
      page: this.page(),
      pageSize: this.pageSize(),
    }).subscribe(result => {
      this.expenses.set(result.items);
      this.total.set(result.total);
    });
  }

  onSort(sort: Sort) {
    this.sortBy.set(sort.active || 'date');
    this.sortDir.set(sort.direction || 'desc');
    this.page.set(1);
    this.load();
  }

  onPage(event: PageEvent) {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  clearFilters() {
    this.filters.reset();
  }

  exportCsv() {
    const v = this.filters.value;
    this.service.export({
      search: v.search ?? '',
      category: v.category ?? '',
      paymentMethod: v.paymentMethod ?? '',
      from: v.from ? this.toDateStr(v.from) : '',
      to: v.to ? this.toDateStr(v.to) : '',
    }).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.buildExportFilename();
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  private buildExportFilename(): string {
    const v = this.filters.value;
    const parts: string[] = ['expenses'];

    if (v.search?.trim())    parts.push(v.search.trim().toLowerCase().replace(/\s+/g, '-'));
    if (v.category)          parts.push(v.category.toLowerCase());
    if (v.paymentMethod)     parts.push(v.paymentMethod.toLowerCase());

    const from = v.from ? this.toDateStr(v.from) : null;
    const to   = v.to   ? this.toDateStr(v.to)   : null;
    if (from && to)  parts.push(`${from}-to-${to}`);
    else if (from)   parts.push(`from-${from}`);
    else if (to)     parts.push(`to-${to}`);

    return `${parts.join('-')}.csv`;
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() => this.load());
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
