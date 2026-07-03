"use client";
import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Mail, KeyRound, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

function AuthContent() {
  const { signIn, signUp, user, resetPasswordForEmail, updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  const view = isRecoveryMode ? 'recovery' : showForgotPassword ? 'forgot' : 'main';

  // Entrance animation for the page chrome — runs once per view.
  useGSAP(
    () => {
      const clearProps = 'opacity,transform';

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.gsap-back', { opacity: 0, x: -16, duration: 0.5, clearProps })
        .from('.gsap-card', { opacity: 0, y: 24, duration: 0.6, clearProps }, '-=0.3')
        .from('.gsap-logo', { opacity: 0, scale: 0.8, duration: 0.5, clearProps }, '-=0.35')
        .from('.gsap-title', { opacity: 0, y: 12, duration: 0.5, clearProps }, '-=0.3')
        .from('.gsap-subtitle', { opacity: 0, y: 12, duration: 0.5, clearProps }, '-=0.35');
    },
    { scope: containerRef, dependencies: [view] }
  );

  // Form fields replay whenever the active view or tab changes.
  useGSAP(
    () => {
      const clearProps = 'opacity,transform';

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.gsap-field', { opacity: 0, y: 16, duration: 0.4, stagger: 0.08, clearProps })
        .from('.gsap-submit', { opacity: 0, y: 12, duration: 0.4, clearProps }, '-=0.2');
    },
    { scope: containerRef, dependencies: [view, tab] }
  );

  // Check if this is a password recovery callback
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setIsRecoveryMode(true);
    }
  }, [searchParams]);

  // Redirect if already logged in (unless in recovery mode)
  if (user && !isRecoveryMode) {
    router.push('/');
    return null;
  }

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.issues[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error('Sign in failed', {
        description: error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message,
      });
    } else {
      router.push('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Account exists', {
          description: 'This email is already registered. Please sign in instead.',
        });
      } else {
        toast.error('Sign up failed', {
          description: error.message,
        });
      }
    } else {
      toast.success('Welcome!', {
        description: 'Your account has been created successfully.',
      });
      router.push('/');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.issues[0].message });
      return;
    }

    setLoading(true);
    const { error } = await resetPasswordForEmail(email);
    setLoading(false);

    if (error) {
      toast.error('Reset failed', {
        description: error.message,
      });
    } else {
      toast.success('Check your email', {
        description: 'We sent you a password reset link. Please check your inbox.',
      });
      setShowForgotPassword(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setErrors({ password: passwordResult.error.issues[0].message });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast.error('Reset failed', {
        description: error.message,
      });
    } else {
      toast.success('Password updated!', {
        description: 'Your password has been successfully reset.',
      });
      setIsRecoveryMode(false);
      router.push('/');
    }
  };

  // Recovery mode: show password reset form
  if (isRecoveryMode) {
    return (
      <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="gsap-card w-full max-w-md">
          <CardHeader className="text-center">
            <div className="gsap-logo flex justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <KeyRound className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="gsap-title text-2xl">Set New Password</CardTitle>
            <CardDescription className="gsap-subtitle">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="gsap-field space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              <div className="gsap-field space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
              <Button type="submit" className="gsap-submit w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="gsap-card w-full max-w-md">
          <CardHeader className="text-center">
            <div className="gsap-logo flex justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Mail className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="gsap-title text-2xl">Reset Password</CardTitle>
            <CardDescription className="gsap-subtitle">
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="gsap-field space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <Button type="submit" className="gsap-submit w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gsap-submit w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Back to home button */}
      <div className="gsap-back w-full max-w-md mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card className="gsap-card w-full max-w-md">
        <CardHeader className="text-center">
          <div className="gsap-logo flex justify-center mb-4">
            <Image
              src="/Notion-black.png"
              alt="NotionCraft"
              width={64}
              height={64}
              className="h-24 w-24 dark:hidden"
            />
            <Image
              src="/Notion-white.png"
              alt="NotionCraft"
              width={64}
              height={64}
              className="h-24 w-24 hidden dark:block"
            />
          </div>
          <CardTitle className="gsap-title text-2xl">Welcome to NotionCraft AI</CardTitle>
          <CardDescription className="gsap-subtitle">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')} className="w-full">
            <TabsList className="gsap-field grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="gsap-field space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="gsap-field space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 h-auto text-sm font-normal text-muted-foreground hover:text-primary"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <Button type="submit" className="gsap-submit w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="gsap-field space-y-2">
                  <Label htmlFor="signup-name">Display Name (optional)</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="gsap-field space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="gsap-field space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <Button type="submit" className="gsap-submit w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
