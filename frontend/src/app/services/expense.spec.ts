import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ExpenseService } from './expense';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpenseService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExpenseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll sends GET to /api/expenses', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/expenses');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], total: 0, page: 1, pageSize: 10 });
  });

  it('getAll with query builds correct params', () => {
    service.getAll({ search: 'coffee', category: 'Food', page: 2 }).subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/expenses');
    expect(req.request.params.get('search')).toBe('coffee');
    expect(req.request.params.get('category')).toBe('Food');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ items: [], total: 0, page: 2, pageSize: 10 });
  });

  it('getAll omits undefined and empty params', () => {
    service.getAll({ search: '', category: undefined, page: 1 }).subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/expenses');
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('category')).toBe(false);
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ items: [], total: 0, page: 1, pageSize: 10 });
  });

  it('create sends POST to /api/expenses with body', () => {
    const payload = { title: 'Lunch', amount: 12, category: 'Food' as const, date: '2024-01-01' };
    service.create(payload).subscribe();
    const req = httpMock.expectOne('/api/expenses');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, ...payload });
  });

  it('update sends PUT to /api/expenses/:id with body', () => {
    const expense = { id: 1, title: 'Updated', amount: 20, category: 'Food' as const, date: '2024-01-01' };
    service.update(1, expense).subscribe();
    const req = httpMock.expectOne('/api/expenses/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(expense);
    req.flush(null);
  });

  it('delete sends DELETE to /api/expenses/:id', () => {
    service.delete(42).subscribe();
    const req = httpMock.expectOne('/api/expenses/42');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getById sends GET to /api/expenses/:id', () => {
    service.getById(7).subscribe();
    const req = httpMock.expectOne('/api/expenses/7');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 7, title: 'Test', amount: 10, category: 'Food', date: '2024-01-01' });
  });

  it('export sends GET to /api/expenses/export with params', () => {
    service.export({ search: 'test', category: 'Food' }).subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/expenses/export');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('test');
    expect(req.request.params.get('category')).toBe('Food');
    req.flush(new Blob());
  });
});
