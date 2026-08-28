import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema, loginSchema, registerSchema } from '@nova/validation';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const auth = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [show, setShow] = useState(false); const [serverError, setServerError] = useState('');
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { email: auth.isDemo ? 'olivia.chen@example.local' : '', password: auth.isDemo ? 'NovaDemo!2026' : '' } });
  if (auth.user) return <Navigate to="/account" replace />;
  return <AuthLayout eyebrow="Welcome back" title="Your Nova account." copy="Track orders, save objects, and keep your details close at hand."><form onSubmit={form.handleSubmit(async (values) => { try { await auth.signIn(values.email, values.password); navigate((location.state as { from?: string })?.from ?? '/account'); } catch (error) { setServerError(error instanceof Error ? error.message : 'Sign in failed'); } })} className="auth-form"><FormInput label="Email address" type="email" register={form.register('email')} error={form.formState.errors.email?.message} /><div className="password-field"><FormInput label="Password" type={show ? 'text' : 'password'} register={form.register('password')} error={form.formState.errors.password?.message} /><button type="button" onClick={() => setShow(!show)} aria-label="Toggle password visibility">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><div className="auth-form__meta"><label><input type="checkbox" /> Keep me signed in</label><Link to="/forgot-password">Forgot password?</Link></div>{serverError && <p className="form-error">{serverError}</p>}<button className="auth-submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} /></button><p className="auth-switch">New to Nova Supply? <Link to="/register">Create an account</Link></p>{auth.isDemo && <p className="demo-hint">Local demo mode is active. The prefilled credentials work without Supabase running.</p>}</form></AuthLayout>;
}

export function RegisterPage() {
  const auth = useAuth(); const navigate = useNavigate(); const [serverError, setServerError] = useState('');
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' } });
  if (auth.user) return <Navigate to="/account" replace />;
  return <AuthLayout eyebrow="Join Nova Supply" title="A place for your objects." copy="Create an account for faster checkout, saved addresses, wishlists, and order history."><form onSubmit={form.handleSubmit(async (values) => { try { await auth.signUp(values.fullName, values.email, values.password); navigate('/account'); } catch (error) { setServerError(error instanceof Error ? error.message : 'Registration failed'); } })} className="auth-form"><FormInput label="Full name" register={form.register('fullName')} error={form.formState.errors.fullName?.message} /><FormInput label="Email address" type="email" register={form.register('email')} error={form.formState.errors.email?.message} /><FormInput label="Password" type="password" register={form.register('password')} error={form.formState.errors.password?.message} /><FormInput label="Confirm password" type="password" register={form.register('confirmPassword')} error={form.formState.errors.confirmPassword?.message} />{serverError && <p className="form-error">{serverError}</p>}<button className="auth-submit" disabled={form.formState.isSubmitting}>Create account <ArrowRight size={17} /></button><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></form></AuthLayout>;
}

const forgotSchema = z.object({ email: emailSchema });
export function ForgotPasswordPage() {
  const auth = useAuth(); const [sent, setSent] = useState(false); const form = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  return <AuthLayout eyebrow="Account recovery" title={sent ? 'Check your inbox.' : 'Reset your password.'} copy={sent ? 'If an account exists for that email, a secure reset link is on its way.' : 'Enter your account email and we’ll send a secure reset link.'}>{sent ? <Link className="auth-submit" to="/login">Return to sign in <ArrowRight size={17} /></Link> : <form onSubmit={form.handleSubmit(async ({ email }) => { await auth.resetPassword(email); setSent(true); })} className="auth-form"><FormInput label="Email address" type="email" register={form.register('email')} error={form.formState.errors.email?.message} /><button className="auth-submit" disabled={form.formState.isSubmitting}>Send reset link <ArrowRight size={17} /></button><p className="auth-switch"><Link to="/login">Return to sign in</Link></p></form>}</AuthLayout>;
}

function AuthLayout({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: React.ReactNode }) { return <main className="auth-page"><section className="auth-page__visual"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=88" alt="Quiet Nova Supply workspace" /><div><p className="wordmark wordmark--light">NOVA<span>SUPPLY</span></p><blockquote>“Useful things,<br />beautifully resolved.”</blockquote></div></section><section className="auth-page__content"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="auth-page__copy">{copy}</p>{children}</div></section></main>; }
function FormInput({ label, type = 'text', register, error }: { label: string; type?: string; register: Record<string, unknown>; error?: string }) { return <label className="auth-field"><span>{label}</span><input type={type} {...register} aria-invalid={Boolean(error)} />{error && <small>{error}</small>}</label>; }
