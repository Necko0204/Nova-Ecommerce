import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArrowRight, Box, CalendarDays, ChevronDown, CircleDollarSign, Clock3, LucideAngularModule, PackageCheck, ShoppingBag, Users } from 'lucide-angular';
import { formatCurrency } from '@nova/shared-utils';
import { AdminDataService } from '../../core/services/admin-data.service';
import { AuthService } from '../../core/services/auth.service';
import { SalesChartComponent } from '../../shared/components/sales-chart.component';

@Component({
  selector: 'nova-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule, SalesChartComponent],
  template: `
    <div class="dashboard page-enter">
      <header class="dashboard-header"><div><p>Today</p><h2>{{ greeting() }}, {{ auth.user()?.fullName ?? 'there' }}.</h2><span>Here is the live state of your store.</span></div><button><lucide-icon [img]="CalendarDays" [size]="15" />{{ selectedPeriod() }}<lucide-icon [img]="ChevronDown" [size]="13" /></button></header>
      <section class="metric-grid">@for (metric of metrics(); track metric.label) {<article class="metric-card"><div><span>{{ metric.label }}</span><lucide-icon [img]="metric.icon" [size]="16" /></div><strong>{{ metric.value }}</strong><footer><small>{{ metric.note }}</small></footer></article>}</section>
      <section class="dashboard-grid dashboard-grid--chart">
        <article class="panel revenue-panel"><header class="panel-header"><div><p>Revenue performance</p><span>Net sales from completed orders</span></div></header><div class="chart-total"><strong>{{ formatCurrency(data.revenue()) }}</strong><span>Historical comparisons appear as orders accumulate.</span></div><nova-sales-chart /></article>
        <article class="panel pulse-panel"><header class="panel-header"><div><p>Live store pulse</p><span>Traffic reporting</span></div></header><div class="table-empty"><p>Connect analytics to show visitors, acquisition channels, and conversion data.</p></div></article>
      </section>
      <section class="dashboard-grid dashboard-grid--tables">
        <article class="panel recent-orders"><header class="panel-header"><div><p>Recent orders</p><span>Latest customer activity</span></div><a routerLink="/admin/orders">View all <lucide-icon [img]="ArrowRight" [size]="14" /></a></header><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Fulfillment</th><th>Payment</th><th>Total</th></tr></thead><tbody>@for (order of data.orders().slice(0, 6); track order.id) {<tr routerLink="/admin/orders/{{order.id}}"><td><strong>{{ order.number }}</strong><small>{{ order.items }} items</small></td><td><span class="table-person"><i>{{ initials(order.customer) }}</i><b>{{ order.customer }}</b></span></td><td>{{ order.date | date:'MMM d, h:mm a' }}</td><td><span class="table-status">{{ order.fulfillment }}</span></td><td>{{ order.payment }}</td><td><strong>{{ formatCurrency(order.total) }}</strong></td></tr>} @empty {<tr><td colspan="6"><div class="table-empty"><p>Your first order will appear here.</p></div></td></tr>}</tbody></table></div></article>
        <article class="panel top-products"><header class="panel-header"><div><p>Top products</p><span>By available inventory value</span></div></header><div class="top-product-list">@for (product of topProducts(); track product.id; let rank = $index) {<a routerLink="/admin/products/{{product.id}}"><span class="rank">0{{ rank + 1 }}</span><img [src]="product.imageUrl" alt="" /><div><strong>{{ product.name }}</strong><span>{{ product.inventory }} in stock</span></div><b>{{ formatCurrency(product.price * product.inventory) }}</b></a>} @empty {<div class="table-empty"><p>Add products to see catalog insights.</p></div>}</div></article>
      </section>
      <section class="dashboard-grid dashboard-grid--bottom">
        <article class="panel activity-panel"><header class="panel-header"><div><p>Activity feed</p><span>What changed across your store</span></div></header><div class="activity-list">@for (item of data.activity().slice(0, 6); track item.id) {<div><span class="activity-icon" [class]="item.kind"><lucide-icon [img]="activityIcon(item.kind)" [size]="14" /></span><p>{{ item.text }}<small>{{ item.date | date:'MMM d, h:mm a' }}</small></p></div>} @empty {<div class="table-empty"><p>Store activity will appear here.</p></div>}</div></article>
        <article class="panel stock-panel"><header class="panel-header"><div><p>Inventory attention</p><span>{{ data.lowStock() }} variants need review</span></div><a routerLink="/admin/inventory">Review inventory <lucide-icon [img]="ArrowRight" [size]="14" /></a></header><div class="stock-list">@for (product of lowStockProducts(); track product.id) {<a routerLink="/admin/inventory"><img [src]="product.imageUrl" alt="" /><div><strong>{{ product.name }}</strong><span>{{ product.sku }}</span></div><span class="stock-count" [class.out]="product.inventory === 0">{{ product.inventory === 0 ? 'Out of stock' : product.inventory + ' left' }}</span></a>} @empty {<div class="table-empty"><p>No low-stock products to review.</p></div>}</div></article>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly ArrowRight = ArrowRight;
  readonly Box = Box;
  readonly CalendarDays = CalendarDays;
  readonly ChevronDown = ChevronDown;
  readonly auth = inject(AuthService);
  readonly data = inject(AdminDataService);
  readonly selectedPeriod = signal('30 days');
  readonly formatCurrency = formatCurrency;
  readonly greeting = computed(() => new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening');
  readonly metrics = computed(() => {
    const orderCount = this.data.orders().length;
    return [
      { label: 'Net revenue', value: formatCurrency(this.data.revenue()), note: 'From paid orders', icon: CircleDollarSign },
      { label: 'Orders', value: orderCount.toLocaleString(), note: 'All orders', icon: ShoppingBag },
      { label: 'Average order', value: formatCurrency(orderCount ? this.data.revenue() / orderCount : 0), note: 'From paid orders', icon: PackageCheck },
      { label: 'Customers', value: this.data.customers().length.toLocaleString(), note: 'Registered customers', icon: Users },
      { label: 'Low stock', value: String(this.data.lowStock()), note: 'Needs review', icon: Box },
    ];
  });
  readonly topProducts = computed(() => [...this.data.products()].sort((a, b) => b.price * b.inventory - a.price * a.inventory).slice(0, 5));
  readonly lowStockProducts = computed(() => this.data.products().filter((product) => product.inventory <= 12).sort((a, b) => a.inventory - b.inventory).slice(0, 5));
  initials(name: string) { return name.split(' ').map((part) => part[0]).join(''); }
  activityIcon(kind: string) { return ({ order: ShoppingBag, inventory: Box, customer: Users, product: PackageCheck, discount: CircleDollarSign } as Record<string, typeof ShoppingBag>)[kind] ?? Clock3; }
}
