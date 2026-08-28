import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const demoUser = (email: string, fullName = 'Nova Customer') => ({
  id: 'demo-customer', email, user_metadata: { full_name: fullName }, app_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString(),
}) as User;

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState<User | null>(() => {
    if (isSupabaseConfigured) return null;
    const saved = localStorage.getItem('nova-demo-user');
    return saved ? demoUser(JSON.parse(saved).email, JSON.parse(saved).fullName) : null;
  });
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? demo,
    session,
    loading,
    isDemo: !isSupabaseConfigured,
    signIn: async (email, password) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (password.length < 8) throw new Error('Use at least 8 characters.');
        localStorage.setItem('nova-demo-user', JSON.stringify({ email, fullName: 'Nova Customer' }));
        setDemo(demoUser(email));
      }
    },
    signUp: async (fullName, email, password) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
      } else {
        localStorage.setItem('nova-demo-user', JSON.stringify({ email, fullName }));
        setDemo(demoUser(email, fullName));
      }
    },
    signOut: async () => {
      if (isSupabaseConfigured) await supabase.auth.signOut();
      localStorage.removeItem('nova-demo-user');
      setDemo(null);
    },
    resetPassword: async (email) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account/profile` });
        if (error) throw error;
      } else await new Promise((resolve) => setTimeout(resolve, 500));
    },
  }), [demo, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// AuthProvider and its hook intentionally share a module so their contract stays private.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
