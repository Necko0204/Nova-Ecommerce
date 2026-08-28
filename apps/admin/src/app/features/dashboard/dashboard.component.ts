import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Box, CalendarDays, ChevronDown, CircleDollarSign, Clock3, LucideAngularModule, PackageCheck, ShoppingBag, UserPlus, Users } from 'lucide-angular';
import { formatCurrency } from '@nova/shared-utils';
import { AdminDataService } from '../../core/services/admin-data.service';
import { SalesChartComponent } from '../../shared/components/sales-chart.component';

@Component({
  selector: 'nova-dashboard', standalone: true,
  imports: [DatePipe, RouterLink, SalesChartComponent, LucideAngularModule],
  template: `
    <div class="dashboard page-enter">
      <section class="dashboard-welcome"><div><p>{{ greeting() }}, Mara.</p><span>Here’s what’s moving at Nova Supply today.</span></div><div class="period-picker"><lucide-icon [img]="CalendarDays" [size]="15" />@for (period of periods; track period) { <button [class.active]="selectedPeriod() === period" (click)="selectedPeriod.set(period)">{{ period }}</button> }</div></section>
      <section class="metric-grid">
        @for (metric of metrics(); track metric.label) {
          <article class="metric-card"><div><span>{{ metric.label }}</span><lucide-icon [img]="metric.icon" [size]="16" /></div><strong>{{ metric.value }}</strong><footer><span [class.negative]="metric.change < 0"><lucide-icon [img]="metric.change >= 0 ? ArrowUpRight : ArrowDownRight" [size]="12" />{{ metric.change >= 0 ? '+' : '' }}{{ metric.change }}%</span><small>vs previous period</small></footer></article>
        }
      </section>
      <section class="dashboard-grid dashboard-grid--chart">
        <article class="panel revenue-panel"><header class="panel-header"><div><p>Revenue performance</p><span>Net sales over the selected period</span></div><div class="chart-legend"><span><i></i>Current period</span><span><i></i>Previous</span></div></header><div class="chart-total"><strong>{{ formatCurrency(data.revenue()) }}</strong><span><lucide-icon [img]="ArrowUpRight" [size]="12" /> 18.4%</span></div><nova-sales-chart /></article>
        <article class="panel pulse-panel"><header class="panel-header"><div><p>Live store pulse</p><span>Activity in the last 24 hours</span></div><span class="live-dot">Live</span></header><div class="pulse-metrics"><div><span>Visitors right now</span><strong>28</strong><small>12 mobile · 16 desktop</small></div><div><span>Conversion rate</span><strong>3.84%</strong><small class="positive">+0.42% this week</small></div></div><div class="traffic-bars"><div><span>Direct</span><i><b style="width: 78%"></b></i><em>38%</em></div><div><span>Organic</span><i><b style="width: 62%"></b></i><em>31%</em></div><div><span>Social</span><i><b style="width: 39%"></b></i><em>19%</em></div><div><span>Email</span><i><b style="width: 24%"></b></i><em>12%</em></div></div><a routerLink="/admin/analytics">Open live view <lucide-icon [img]="ArrowRight" [size]="14" /></a></article>
      </section>
      <section class="dashboard-grid dashboard-grid--tables">
        <article class="panel recent-orders"><header class="panel-header"><div><p>Recent orders</p><span>Latest customer activity</span></div><a routerLink="/admin/orders">View all <lucide-icon [img]="ArrowRight" [size]="14" /></a></header><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Fulfillment</th><th>Payment</th><th>Total</th></tr></thead><tbody>@for (order of data.orders().slice(0,6); track order.id) { <tr routerLink="/admin/orders/{{order.id}}"><td><strong>{{ order.number }}</strong><small>{{ order.items }} items</small></td><td><span class="table-person"><i>{{ initials(order.customer) }}</i><b>{{ order.customer }}</b></span></td><td>{{ order.date | date:'MMM d, h:mm a' }}</td><td><span class="table-status" [class.processing]="order.status === 'processing'" [class.shipped]="order.status === 'shipped'">{{ order.fulfillment }}</span></td><td><span class="payment-dot"></span>{{ order.payment }}</td><td><strong>{{ formatCurrency(order.total) }}</strong></td></tr> }</tbody></table></div></article>
        <article class="panel top-products"><header class="panel-header"><div><p>Top products</p><span>By net revenue</span></div><button>30 days <lucide-icon [img]="ChevronDown" [size]="13" /></button></header><div class="top-product-list">@for (product of topProducts(); track product.id; let rank = $index) { <a routerLink="/admin/products/{{ product.id }}"><span class="rank">0{{ rank + 1 }}</span><img [src]="product.imageUrl" alt="" /><div><strong>{{ product.name }}</strong><span>{{ product.inventory + rank * 17 }} sold</span></div><b>{{ formatCurrency(product.price * (product.inventory + rank * 17)) }}</b></a> }</div></article>
      </section>
      <section class="dashboard-grid dashboard-grid--bottom">
        <article class="panel activity-panel"><header class="panel-header"><div><p>Activity feed</p><span>What changed across your store</span></div><button>All activity</button></header><div class="activity-list">@for (item of data.activity().slice(0,6); track item.id) { <div><span class="activity-icon" [class]="item.kind"><lucide-icon [img]="activityIcon(item.kind)" [size]="14" /></span><p>{{ item.text }}<small>{{ item.date | date:'MMM d, h:mm a' }}</small></p></div> }</div></article>
        <article class="panel stock-panel"><header class="panel-header"><div><p>Inventory attention</p><span>{{ data.lowStock() }} variants need review</span></div><a routerLink="/admin/inventory">Review inventory <lucide-icon [img]="ArrowRight" [size]="14" /></a></header><div class="stock-list">@for (product of lowStockProducts(); track product.id) { <a routerLink="/admin/inventory"><img [src]="product.imageUrl" alt="" /><div><strong>{{ product.name }}</strong><span>{{ product.sku }}</span></div><span class="stock-count" [class.out]="product.inventory === 0">{{ product.inventory === 0 ? 'Out of stock' : product.inventory + ' left' }}</span></a> }</div></article>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly ArrowDownRight = ArrowDownRight; readonly ArrowRight = ArrowRight; readonly ArrowUpRight = ArrowUpRight; readonly CalendarDays = CalendarDays; readonly ChevronDown = ChevronDown;
  readonly data = inject(AdminDataService); readonly selectedPeriod = signal('30 Days'); readonly periods = ['Today','7 Days','30 Days','90 Days']; readonly formatCurrency = formatCurrency;
  readonly greeting = computed(() => new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening');
  readonly metrics = computed(() => [{ label: 'Net revenue', value: formatCurrency(this.data.revenue()), change: 18.4, icon: CircleDollarSign },{ label: 'Orders', value: this.data.orders().length.toLocaleString(), change: 12.6, icon: ShoppingBag },{ label: 'Average order', value: formatCurrency(this.data.revenue()/this.data.orders().length), change: 5.1, icon: PackageCheck },{ label: 'Customers', value: this.data.customers().length.toLocaleString(), change: 8.2, icon: Users },{ label: 'Conversion', value: '3.84%', change: .42, icon: UserPlus },{ label: 'Low stock', value: String(this.data.lowStock()), change: -7.4, icon: Box }]);
  readonly topProducts = computed(() => [...this.data.products()].sort((a,b) => b.price*b.inventory-a.price*a.inventory).slice(0,5));
  readonly lowStockProducts = computed(() => this.data.products().filter((product) => product.inventory <= 12).sort((a,b) => a.inventory-b.inventory).slice(0,5));
  initials(name: string) { return name.split(' ').map((part) => part[0]).join(''); }
  activityIcon(kind: string) { return ({ order: ShoppingBag, inventory: Box, customer: UserPlus, product: PackageCheck, discount: CircleDollarSign } as Record<string, typeof ShoppingBag>)[kind] ?? Clock3; }
}
