import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin' },
  { path: 'login', loadComponent: () => import('./core/auth/login.component').then((m) => m.LoginComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent), title: 'Overview · Nova Admin' },
      { path: 'products', loadComponent: () => import('./features/products/products.component').then((m) => m.ProductsComponent), title: 'Products · Nova Admin' },
      { path: 'products/new', loadComponent: () => import('./features/products/product-editor.component').then((m) => m.ProductEditorComponent), title: 'New product · Nova Admin' },
      { path: 'products/:id', loadComponent: () => import('./features/products/product-editor.component').then((m) => m.ProductEditorComponent), title: 'Edit product · Nova Admin' },
      { path: 'orders', loadComponent: () => import('./features/orders/orders.component').then((m) => m.OrdersComponent), title: 'Orders · Nova Admin' },
      { path: 'orders/:id', loadComponent: () => import('./features/orders/order-detail.component').then((m) => m.OrderDetailComponent), title: 'Order · Nova Admin' },
      { path: 'customers', loadComponent: () => import('./features/customers/customers.component').then((m) => m.CustomersComponent), title: 'Customers · Nova Admin' },
      { path: 'customers/:id', loadComponent: () => import('./features/customers/customer-detail.component').then((m) => m.CustomerDetailComponent), title: 'Customer · Nova Admin' },
      { path: 'inventory', loadComponent: () => import('./features/inventory/inventory.component').then((m) => m.InventoryComponent), title: 'Inventory · Nova Admin' },
      { path: 'discounts', loadComponent: () => import('./features/discounts/discounts.component').then((m) => m.DiscountsComponent), title: 'Discounts · Nova Admin' },
      { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent), title: 'Analytics · Nova Admin' },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent), title: 'Settings · Nova Admin' },
    ],
  },
  { path: '**', redirectTo: 'admin' },
];
