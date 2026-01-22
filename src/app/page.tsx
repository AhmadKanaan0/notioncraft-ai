"use client";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Sparkles, Layers, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

const Index = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push('/workspace');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent via-background to-background" />
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
        />
      </div>

      {/* Header - Responsive */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className={`flex items-center gap-2 sm:gap-3 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-lg shadow-lg">
              N
            </div>
            <span className="text-lg sm:text-xl font-semibold hidden sm:inline">Notion Clone</span>
          </div>
          <div
            className={`flex items-center gap-1 sm:gap-3 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
          >
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => router.push('/auth')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => router.push('/auth')} className="gap-1 sm:gap-2 text-sm sm:text-base">
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent border border-border mb-6 sm:mb-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium">AI-Powered Note Taking</span>
          </div>

          {/* Main heading */}
          <h1
            className={`text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            Write, plan, and
            <br />
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              organize together
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            A beautiful, minimal workspace for your notes and ideas.
            Powered by AI to help you write faster and think clearer.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <Button
              size="lg"
              onClick={() => router.push('/auth')}
              className="gap-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
            >
              Start for Free <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/auth')}
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>

          {/* Scroll indicator - positioned between CTA and features */}
          <div
            className={`flex flex-col items-center gap-2 text-muted-foreground text-sm mb-8 sm:mb-12 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-1">
              <div className="w-1.5 h-2.5 bg-muted-foreground/50 rounded-full animate-bounce" />
            </div>
            <span>Scroll to explore</span>
          </div>

          {/* Features Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="Rich Text Editor"
              description="Tables, code blocks, math equations, and callout boxes"
            />
            <FeatureCard
              icon={<Layers className="h-5 w-5" />}
              title="Nested Pages"
              description="Organize with favorites, tags, and infinite hierarchy"
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="AI Assistant"
              description="Get help writing, editing, and brainstorming ideas"
            />
          </div>
        </div>

      </main>
    </div>
  );
};

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;
