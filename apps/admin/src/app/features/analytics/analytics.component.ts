import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArrowRight, Download, LucideAngularModule } from 'lucide-angular';
import { formatCurrency } from '@nova/shared-utils';
import { AdminDataService } from '../../core/services/admin-data.service';
import { SalesChartComponent } from '../../shared/components/sales-chart.component';

@Component({
  selector: 'nova-analytics',
  standalone: true,
  imports: [SalesChartComponent, LucideAngularModule],
  template: `
    <div class="feature-page analytics-page page-enter">
      <header class="feature-header"><div><h2>Analytics</h2><p>Track store performance as your business grows.</p></div><button class="admin-secondary"><lucide-icon [img]="Download" [size]="15" />Export report</button></header>
      <section class="analytics-kpis">@for (metric of metrics(); track metric.label) {<article><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.note }}</small></article>}</section>
      <section class="analytics-grid"><article class="panel analytics-revenue"><header class="panel-header"><div><p>Revenue</p><span>Net sales from paid orders</span></div></header><div class="analytics-chart-total"><strong>{{ formatCurrency(data.revenue()) }}</strong><span>Comparison data will appear over time.</span></div><nova-sales-chart /></article><article class="panel sales-funnel"><header class="panel-header"><div><p>Conversion funnel</p><span>From session to purchase</span></div></header><div class="table-empty"><p>Connect web analytics to populate your conversion funnel.</p></div></article></section>
      <section class="analytics-grid analytics-grid--split"><article class="panel"><header class="panel-header"><div><p>Sales by category</p><span>Share of net revenue</span></div></header><div class="table-empty"><p>Category sales will appear after orders are placed.</p></div></article><article class="panel"><header class="panel-header"><div><p>Customer growth</p><span>New registered customers</span></div></header><div class="growth-summary"><div><span>Customers</span><strong>{{ data.customers().length }}</strong><small>Registered customer accounts</small></div></div></article></section>
      <section class="analytics-grid analytics-grid--split"><article class="panel"><header class="panel-header"><div><p>Acquisition channels</p><span>Revenue attributed by first touch</span></div><a>Connect analytics <lucide-icon [img]="ArrowRight" [size]="13" /></a></header><div class="table-empty"><p>No attribution data is available yet.</p></div></article><article class="panel"><header class="panel-header"><div><p>Order status</p><span>Current fulfillment distribution</span></div></header><div class="status-distribution">@for (item of orderStatuses(); track item.name) {<div><span>{{ item.name }}</span><strong>{{ item.value }}</strong><b><i [style.width.%]="item.percent"></i></b><small>{{ item.percent }}%</small></div>}</div></article></section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent {
  readonly ArrowRight = ArrowRight;
  readonly Download = Download;
  readonly data = inject(AdminDataService);
  readonly formatCurrency = formatCurrency;
  readonly metrics = computed(() => {
    const orders = this.data.orders().length;
    return [
      { label: 'Net sales', value: formatCurrency(this.data.revenue()), note: 'From paid orders' },
      { label: 'Orders', value: String(orders), note: 'Across all sales channels' },
      { label: 'Average order', value: formatCurrency(orders ? this.data.revenue() / orders : 0), note: 'From paid orders' },
      { label: 'Customers', value: String(this.data.customers().length), note: 'Registered customer accounts' },
      { label: 'Low stock', value: String(this.data.lowStock()), note: 'Variants needing review' },
    ];
  });
  readonly orderStatuses = computed(() => {
    const orders = this.data.orders();
    return [
      { name: 'Delivered', value: orders.filter((order) => order.status === 'delivered').length },
      { name: 'Shipped', value: orders.filter((order) => order.status === 'shipped').length },
      { name: 'Processing', value: orders.filter((order) => order.status === 'processing').length },
      { name: 'Cancelled', value: orders.filter((order) => order.status === 'cancelled').length },
    ].map((item) => ({ ...item, percent: orders.length ? Math.round(item.value / orders.length * 100) : 0 }));
  });
}
