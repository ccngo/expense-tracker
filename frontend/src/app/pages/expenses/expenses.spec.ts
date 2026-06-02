import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Expenses } from './expenses';
import { ExpenseService } from '../../services/expense';
import { Expense } from '../../models/expense';

describe('Expenses', () => {
  let component: Expenses;
  let fixture: ComponentFixture<Expenses>;
  let expenseService: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; export: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    expenseService = {
      getAll: vi.fn().mockReturnValue(of({ items: [], total: 0, page: 1, pageSize: 10 })),
      delete: vi.fn().mockReturnValue(of(void 0)),
      export: vi.fn().mockReturnValue(of(new Blob())),
    };

    await TestBed.configureTestingModule({
      imports: [Expenses],
      providers: [
        { provide: ExpenseService, useValue: expenseService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Expenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls getAll on init', () => {
    expect(expenseService.getAll).toHaveBeenCalled();
  });

  it('populates expenses signal from service response', async () => {
    const items: Expense[] = [{ id: 1, title: 'Lunch', amount: 12, category: 'Food', date: '2024-01-01' }];
    expenseService.getAll.mockReturnValue(of({ items, total: 1, page: 1, pageSize: 10 }));
    component.load();
    await fixture.whenStable();
    expect(component.expenses()).toEqual(items);
    expect(component.total()).toBe(1);
  });

  it('resets filters on clearFilters()', () => {
    component.clearFilters();
    expect(component.filters.value.search).toBeNull();
  });

  it('calls delete service on delete()', () => {
    component.delete(5);
    expect(expenseService.delete).toHaveBeenCalledWith(5);
  });

  it('updates sort state on onSort()', () => {
    component.onSort({ active: 'amount', direction: 'asc' });
    expect(component.sortBy()).toBe('amount');
    expect(component.sortDir()).toBe('asc');
    expect(component.page()).toBe(1);
  });

  it('updates page state on onPage()', () => {
    component.onPage({ pageIndex: 1, pageSize: 20, length: 100 });
    expect(component.page()).toBe(2);
    expect(component.pageSize()).toBe(20);
  });
});
