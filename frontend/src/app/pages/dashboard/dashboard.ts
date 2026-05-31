import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController, CategoryScale, LinearScale, BarElement, BarController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ExpenseService } from '../../services/expense';
import { BudgetService } from '../../services/budget';
import { Expense } from '../../models/expense';
import { BudgetSummary } from '../../models/budget-plan';
import { LABELS } from '../../pipes/enum-label-pipe';
import { CategoryLabelComponent } from '../../components/category-label';
import { HelpService } from '../../services/help';

const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍽️',
  Transport: '🚗',
  Housing: '🏠',
  Health: '❤️',
  Entertainment: '🎬',
  Other: '📦',
};

Chart.register(ArcElement, Tooltip, Legend, DoughnutController, CategoryScale, LinearScale, BarElement, BarController, ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatButtonToggleModule, CurrencyPipe, BaseChartDirective, CategoryLabelComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  help = inject(HelpService);
  private expenseService = inject(ExpenseService);
  private budgetService = inject(BudgetService);

  activePreset = signal<'month' | '3months' | 'year' | 'all'>('month');

  expenses = signal<Expense[]>([]);
  budgetSummaries = signal<BudgetSummary[]>([]);

  total = computed(() => this.expenses().reduce((sum, e) => sum + e.amount, 0));
  count = computed(() => this.expenses().length);
  topCategory = computed(() => {
    const map = new Map<string, number>();
    this.expenses().forEach(e => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  });

  warnings = computed(() => this.budgetSummaries().filter(s => s.percentage >= 80));

  categoryChartData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  trendChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });

  categoryChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: ctx => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(2);
            return ` ${pct}%`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 12 },
        formatter: (value, ctx) => {
          const total = (ctx.dataset.data as number[]).reduce((a: number, b) => a + (b as number), 0);
          const pct = ((value / total) * 100);
          return pct < 5 ? '' : `${pct.toFixed(2)}%`;
        }
      }
    },
  };

  trendChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
    },
    scales: { y: { beginAtZero: true } },
  };

  ngOnInit() {
    this.loadExpenses();
    this.budgetService.getSummary().subscribe(data => this.budgetSummaries.set(data));
  }

  setPreset(preset: 'month' | '3months' | 'year' | 'all') {
    this.activePreset.set(preset);
    this.loadExpenses();
  }

  private loadExpenses() {
    const today = new Date();
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let from: string | undefined;
    switch (this.activePreset()) {
      case 'month':
        from = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
        break;
      case '3months':
        from = fmt(new Date(today.getFullYear(), today.getMonth() - 2, 1));
        break;
      case 'year':
        from = fmt(new Date(today.getFullYear(), 0, 1));
        break;
      case 'all':
        from = undefined;
        break;
    }

    this.expenseService.getAll({ pageSize: 10000, from, to: from ? fmt(today) : undefined })
      .subscribe(data => {
        this.expenses.set(data.items);
        this.buildCategoryChart(data.items);
        this.buildTrendChart(data.items);
      });
  }

  private buildCategoryChart(expenses: Expense[]) {
    const map = new Map<string, number>();
    expenses.forEach(e => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
    this.categoryChartData.set({
      labels: sorted.map(([cat]) => `${CATEGORY_EMOJI[cat] ?? ''} ${LABELS[cat] ?? cat}`),
      datasets: [{
        data: sorted.map(([, amt]) => amt),
        backgroundColor: ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6'],
      }]
    });
  }

  private buildTrendChart(expenses: Expense[]) {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const month = e.date.slice(0, 7);
      map.set(month, (map.get(month) ?? 0) + e.amount);
    });
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    this.trendChartData.set({
      labels: sorted.map(([month]) => month),
      datasets: [{
        data: sorted.map(([, amt]) => amt),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      }]
    });
  }

  warningIcon(percentage: number): string {
    return percentage >= 100 ? 'error' : 'warning';
  }

  warningMessage(percentage: number, type: string, period: string): string {
    const label = `${LABELS[type] ?? type} ${LABELS[period] ?? period}`.toLowerCase();
    if (percentage >= 100)
      return `You've blown your ${label} budget. Time to pump the brakes.`;
    return `Your ${label} budget is running low — ${percentage}% used.`;
  }
}
