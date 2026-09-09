import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArrowRight, Eye, EyeOff, LucideAngularModule, ShieldCheck } from 'lucide-angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'nova-admin-login', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <main class="admin-login">
      <section class="admin-login__brand">
        <a routerLink="/" class="admin-wordmark">NOVA <span>ADMIN</span></a>
        <div><p>Merchant operations</p><h1>Clarity for every moving part.</h1><blockquote>Products, orders, inventory, customers, and insight—in one considered workspace.</blockquote></div>
        <small>Nova Supply · Local commerce studio</small>
      </section>
      <section class="admin-login__form-wrap">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="login-mark"><lucide-icon [img]="ShieldCheck" [size]="19" /></div>
          <p class="kicker">Protected workspace</p><h2>Sign in to Nova Admin</h2><p class="login-copy">Manage the store and understand what is moving.</p>
          <label>Email address<input type="email" formControlName="email" autocomplete="username" /></label>
          <label class="password-control">Password<input [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" /><button type="button" (click)="showPassword.set(!showPassword())" aria-label="Toggle password visibility"><lucide-icon [img]="showPassword() ? EyeOff : Eye" [size]="16" /></button></label>
          @if (error()) { <p class="login-error">{{ error() }}</p> }
          <button class="admin-primary login-submit" type="submit" [disabled]="form.invalid || busy()"><span>{{ busy() ? 'Checking access…' : 'Continue' }}</span><lucide-icon [img]="ArrowRight" [size]="16" /></button>
          <a class="storefront-link" href="http://127.0.0.1:5173">← Return to storefront</a>
        </form>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly ArrowRight = ArrowRight; readonly Eye = Eye; readonly EyeOff = EyeOff; readonly ShieldCheck = ShieldCheck;
  readonly auth = inject(AuthService); private readonly router = inject(Router); private readonly fb = inject(FormBuilder);
  readonly busy = signal(false); readonly error = signal(''); readonly showPassword = signal(false);
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]] });
  async submit() { if (this.form.invalid) return; this.busy.set(true); this.error.set(''); try { await this.auth.signIn(this.form.controls.email.value, this.form.controls.password.value); await this.router.navigateByUrl('/admin'); } catch (error) { this.error.set(error instanceof Error ? error.message : 'Sign in failed.'); } finally { this.busy.set(false); } }
}
