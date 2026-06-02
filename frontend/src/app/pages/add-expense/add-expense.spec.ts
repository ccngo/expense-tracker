import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AddExpense } from './add-expense';
import { ExpenseService } from '../../services/expense';
import { FavoriteService } from '../../services/favorite';

describe('AddExpense', () => {
  let component: AddExpense;
  let fixture: ComponentFixture<AddExpense>;
  let expenseService: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; getById: ReturnType<typeof vi.fn> };
  let favoriteService: { getAll: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    expenseService = {
      create: vi.fn().mockReturnValue(of({ id: 1 })),
      update: vi.fn().mockReturnValue(of(void 0)),
      getById: vi.fn().mockReturnValue(of({ id: 1, title: 'Test', amount: 10, category: 'Food', date: '2024-01-01' })),
    };
    favoriteService = { getAll: vi.fn().mockReturnValue(of([])) };
    mockRouter = { navigate: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [AddExpense],
      providers: [
        { provide: ExpenseService, useValue: expenseService },
        { provide: FavoriteService, useValue: favoriteService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads favorites on init', () => {
    expect(favoriteService.getAll).toHaveBeenCalled();
  });

  it('is in add mode by default (no edit id)', () => {
    expect(component.editId()).toBeNull();
    expect(component.isEditMode()).toBe(false);
  });

  it('does not call create when form is invalid', () => {
    component.form.reset();
    component.submit();
    expect(expenseService.create).not.toHaveBeenCalled();
  });

  it('calls create with correct payload on valid form submit', () => {
    component.form.patchValue({
      title: 'Coffee',
      amount: 5,
      category: 'Food',
      date: new Date('2024-01-15'),
    });
    component.submit();
    expect(expenseService.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Coffee', amount: 5, category: 'Food' })
    );
  });

  it('navigates to /expenses after successful create', async () => {
    component.form.patchValue({ title: 'Coffee', amount: 5, category: 'Food', date: new Date() });
    component.submit();
    await fixture.whenStable();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/expenses']);
  });

  it('applies favorite fields to form', () => {
    component.applyFavorite({ id: 1, title: 'Fav', amount: 20, category: 'Food' });
    expect(component.form.value.title).toBe('Fav');
    expect(component.form.value.amount).toBe(20);
    expect(component.form.value.category).toBe('Food');
  });
});
