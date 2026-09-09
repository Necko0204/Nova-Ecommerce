import { Injectable, signal } from '@angular/core';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface AdminIdentity { id: string; email: string; fullName: string; avatarUrl?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isConfigured = !environment.supabaseAnonKey.includes('placeholder');
  readonly user = signal<AdminIdentity | null>(null);
  readonly loading = signal(this.isConfigured);
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey, { auth: { persistSession: true } });

  constructor() {
    if (this.isConfigured) {
      void this.initialize();
      this.client.auth.onAuthStateChange((_event, session) => void this.acceptUser(session?.user ?? null));
    }
  }

  async initialize() {
    if (!this.isConfigured) { this.loading.set(false); return; }
    const { data } = await this.client.auth.getSession();
    await this.acceptUser(data.session?.user ?? null);
    this.loading.set(false);
  }

  private async acceptUser(user: User | null) {
    if (!user) { this.user.set(null); return; }
    const { data, error } = await this.client.from('profiles').select('full_name, avatar_url, roles!inner(name)').eq('id', user.id).single();
    const role = data?.roles as unknown as { name: string } | null;
    if (error || role?.name !== 'admin') { await this.client.auth.signOut(); this.user.set(null); return; }
    this.user.set({ id: user.id, email: user.email ?? '', fullName: data.full_name, avatarUrl: data.avatar_url ?? undefined });
  }

  async signIn(email: string, password: string) {
    if (!this.isConfigured) throw new Error('Admin authentication is not configured. Add the Supabase environment variables and redeploy.');
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.acceptUser(data.user);
    if (!this.user()) throw new Error('This account does not have merchant access.');
  }

  async signOut() {
    if (this.isConfigured) await this.client.auth.signOut();
    this.user.set(null);
  }
}
