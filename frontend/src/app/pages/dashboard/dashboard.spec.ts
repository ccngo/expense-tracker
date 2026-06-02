import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { ExpenseService } from '../../services/expense';
import { BudgetService } from '../../services/budget';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let expenseService: { getAll: ReturnType<typeof vi.fn> };
  let budgetService: { getSummary: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    expenseService = {
      getAll: vi.fn().mockReturnValue(of({ items: [], total: 0, page: 1, pageSize: 100 })),
    };
    budgetService = {
      getSummary: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: ExpenseService, useValue: expenseService },
        { provide: BudgetService, useValue: budgetService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads expenses and budget summaries on init', () => {
    expect(expenseService.getAll).toHaveBeenCalled();
    expect(budgetService.getSummary).toHaveBeenCalled();
  });

  it('computes total and count from loaded expenses', async () => {
    expenseService.getAll.mockReturnValue(
      of({ items: [
        { id: 1, title: 'A', amount: 30, category: 'Food', date: '2024-01-01' },
        { id: 2, title: 'B', amount: 20, category: 'Transport', date: '2024-01-02' },
      ], total: 2, page: 1, pageSize: 100 })
    );
    component.setPreset('month');
    await fixture.whenStable();
    expect(component.total()).toBe(50);
    expect(component.count()).toBe(2);
  });
});
