import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'nova-sales-chart',
  standalone: true,
  template: '<div class="sales-chart-empty">Revenue history will appear here as orders are completed.</div>',
  styles: [':host{display:block;height:280px;min-width:0}.sales-chart-empty{height:100%;display:grid;place-items:center;color:var(--muted);font-size:.85rem;text-align:center;border-top:1px solid var(--line)}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesChartComponent {}
