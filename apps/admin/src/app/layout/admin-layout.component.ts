import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BarChart3, Boxes, ChevronDown, CircleDollarSign, Command, ExternalLink, HelpCircle, LayoutDashboard, LogOut, LucideAngularModule, Menu, PackageSearch, PanelLeftClose, Search, Settings, ShoppingBag, Tag, Users, X } from 'lucide-angular';
import { AuthService } from '../core/services/auth.service';
import { AdminDataService } from '../core/services/admin-data.service';

interface CommandItem { id: string; label: string; description: string; route: string; group: string; }

@Component({
  selector: 'nova-admin-layout', standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, A11yModule, LucideAngularModule],
  template: `
    <div class="admin-shell" [class.admin-shell--collapsed]="collapsed()">
      <aside class="admin-sidebar" [class.admin-sidebar--open]="mobileOpen()">
        <div class="sidebar-brand"><a routerLink="/admin" class="admin-wordmark">NOVA <span>ADMIN</span></a><button (click)="collapsed.set(!collapsed())" aria-label="Toggle sidebar"><lucide-icon [img]="PanelLeftClose" [size]="17" /></button><button class="mobile-close" (click)="mobileOpen.set(false)" aria-label="Close navigation"><lucide-icon [img]="X" [size]="19" /></button></div>
        <nav class="sidebar-nav" aria-label="Administration">
          <p>Workspace</p>
          <a routerLink="/admin" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active" (click)="mobileOpen.set(false)"><lucide-icon [img]="LayoutDashboard" [size]="17" /><span>Overview</span></a>
          <a routerLink="/admin/orders" routerLinkActive="active" (click)="mobileOpen.set(false)"><lucide-icon [img]="ShoppingBag" [size]="17" /><span>Orders</span><small>{{ pendingOrders() }}</small></a>
          <a routerLink="/admin/products" routerLinkActive="active" (click)="mobileOpen.set(false)"><lucide-icon [img]="PackageSearch" [size]="17" /><span>Products</span></a>
          <a routerLink="/admin/inventory" routerLinkActive="active" (click)="mobileOpen.set(false)"><lucide-icon [img]="Boxes" [size]="17" /><span>Inventory</span>@if (data.lowStock()) { <small class="warning">{{ data.lowStock() }}</small> }</a>
          <a routerLink="/admin/customers" routerLinkActive="active" (click)="mobileOpen.set(false)"><lucide-icon [img]="Users" [size]="17" /><span>Customers</span></a>
          <p>Growth</p>
          <a routerLink="/admin/discounts" routerLinkActive="active" (click)="mobileOpen.set(false)"><lucide-icon [img]="Tag" [size]="17" /><span>Discounts</span></a>
          <a routerLink="/admin/analytics" routerLinkActive="active" (click)="mobileOpen.set(false)"><lucide-icon [img]="BarChart3" [size]="17" /><span>Analytics</span></a>
          <a routerLink="/admin/settings" routerLinkActive="active" (click)="mobileOpen.set(false)"><lucide-icon [img]="Settings" [size]="17" /><span>Settings</span></a>
        </nav>
        <div class="sidebar-foot"><a href="http://127.0.0.1:5173" target="_blank"><lucide-icon [img]="ExternalLink" [size]="16" /><span>View storefront</span></a><button><lucide-icon [img]="HelpCircle" [size]="16" /><span>Help center</span></button></div>
      </aside>
      <button class="mobile-backdrop" [class.open]="mobileOpen()" (click)="mobileOpen.set(false)" aria-label="Close navigation"></button>
      <div class="admin-main">
        <header class="admin-topbar"><button class="mobile-menu" (click)="mobileOpen.set(true)" aria-label="Open navigation"><lucide-icon [img]="Menu" [size]="19" /></button><div><p>{{ breadcrumb() }}</p><h1>{{ pageTitle() }}</h1></div><div class="topbar-actions"><button class="command-trigger" (click)="paletteOpen.set(true)"><lucide-icon [img]="Search" [size]="15" /><span>Search or jump to…</span><kbd>⌘ K</kbd></button><button class="merchant-menu"><span>MR</span><div><strong>{{ auth.user()?.fullName }}</strong><small>Administrator</small></div><lucide-icon [img]="ChevronDown" [size]="14" /></button></div></header>
        <div class="admin-content"><router-outlet /></div>
      </div>
    </div>
    @if (paletteOpen()) {
      <div class="palette-backdrop" (click)="paletteOpen.set(false)"></div>
      <section class="command-palette" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="palette-search"><lucide-icon [img]="Search" [size]="18" /><input [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Search products, orders, customers, or pages…" /><kbd>ESC</kbd></div>
        <div class="palette-results">
          @for (group of commandGroups(); track group.name) {
            <p>{{ group.name }}</p>
            @for (item of group.items; track item.id) { <button (click)="runCommand(item)"><span class="command-icon">{{ item.group[0] }}</span><span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span><em>↵</em></button> }
          } @empty { <div class="palette-empty"><lucide-icon [img]="Command" [size]="22" /><p>No results for “{{ query() }}”</p></div> }
        </div>
        <footer><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>ESC</kbd> Close</span></footer>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  readonly BarChart3 = BarChart3; readonly Boxes = Boxes; readonly ChevronDown = ChevronDown; readonly Command = Command; readonly ExternalLink = ExternalLink; readonly HelpCircle = HelpCircle; readonly LayoutDashboard = LayoutDashboard; readonly LogOut = LogOut; readonly Menu = Menu; readonly PackageSearch = PackageSearch; readonly PanelLeftClose = PanelLeftClose; readonly Search = Search; readonly Settings = Settings; readonly ShoppingBag = ShoppingBag; readonly Tag = Tag; readonly Users = Users; readonly X = X;
  readonly auth = inject(AuthService); readonly data = inject(AdminDataService); private readonly router = inject(Router); private readonly destroyRef = inject(DestroyRef);
  readonly collapsed = signal(false); readonly mobileOpen = signal(false); readonly paletteOpen = signal(false); readonly query = signal(''); readonly currentUrl = signal(this.router.url);
  readonly pendingOrders = computed(() => this.data.orders().filter((order) => ['pending','confirmed','processing'].includes(order.status)).length);
  readonly pageTitle = computed(() => { const path = this.currentUrl(); if (/products\/(new|[^/]+)$/.test(path)) return path.endsWith('/new') ? 'Add product' : 'Edit product'; if (/orders\/[^/]+$/.test(path)) return 'Order details'; if (/customers\/[^/]+$/.test(path)) return 'Customer profile'; return ({ '/admin': 'Overview', '/admin/products': 'Products', '/admin/orders': 'Orders', '/admin/customers': 'Customers', '/admin/inventory': 'Inventory', '/admin/discounts': 'Discounts', '/admin/analytics': 'Analytics', '/admin/settings': 'Settings' } as Record<string,string>)[path] ?? 'Nova Admin'; });
  readonly breadcrumb = computed(() => this.currentUrl() === '/admin' ? 'Nova Supply / Today' : `Nova Supply / ${this.pageTitle()}`);
  private readonly baseCommands: CommandItem[] = [
    { id: 'add-product', label: 'Add a product', description: 'Create a new product', route: '/admin/products/new', group: 'Actions' },
    { id: 'overview', label: 'Open overview', description: 'Return to the dashboard', route: '/admin', group: 'Navigation' },
    { id: 'analytics', label: 'View analytics', description: 'Open performance reports', route: '/admin/analytics', group: 'Navigation' },
    { id: 'inventory', label: 'Open inventory', description: 'Review stock and adjustments', route: '/admin/inventory', group: 'Navigation' },
  ];
  readonly commandResults = computed<CommandItem[]>(() => {
    const q = this.query().trim().toLowerCase();
    const products = this.data.products().map((p) => ({ id: `p-${p.id}`, label: p.name, description: `${p.sku} · ${p.inventory} available`, route: `/admin/products/${p.id}`, group: 'Products' }));
    const orders = this.data.orders().slice(0, 18).map((o) => ({ id: `o-${o.id}`, label: `${o.number} · ${o.customer}`, description: `${o.status} · $${o.total}`, route: `/admin/orders/${o.id}`, group: 'Orders' }));
    const customers = this.data.customers().slice(0, 15).map((c) => ({ id: `c-${c.id}`, label: c.name, description: c.email, route: `/admin/customers/${c.id}`, group: 'Customers' }));
    return [...this.baseCommands, ...products, ...orders, ...customers].filter((item) => !q || `${item.label} ${item.description} ${item.group}`.toLowerCase().includes(q)).slice(0, 14);
  });
  readonly commandGroups = computed(() => { const groups = new Map<string,CommandItem[]>(); for (const item of this.commandResults()) groups.set(item.group, [...(groups.get(item.group) ?? []), item]); return [...groups].map(([name, items]) => ({ name, items })); });

  constructor() { this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef)).subscribe((event) => this.currentUrl.set(event.urlAfterRedirects)); }
  @HostListener('document:keydown', ['$event']) onKey(event: KeyboardEvent) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); this.paletteOpen.set(!this.paletteOpen()); } if (event.key === 'Escape') this.paletteOpen.set(false); }
  async runCommand(item: CommandItem) { this.paletteOpen.set(false); this.query.set(''); await this.router.navigateByUrl(item.route); }
}
