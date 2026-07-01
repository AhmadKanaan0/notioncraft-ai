"use client";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Layers, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LineWaves from '@/components/LineWaves';
import TiltedCard from '@/components/TiltedCard';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const Index = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/workspace');
    }
  }, [user, loading, router]);

  useGSAP(
    () => {
      if (loading) return;

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.gsap-bg', { opacity: 0, duration: 1.2 })
        .from('.gsap-logo', { opacity: 0, x: -16, duration: 0.6 }, 0.2)
        .from('.gsap-nav-actions', { opacity: 0, x: 16, duration: 0.6 }, '<')
        .from('.gsap-badge', { opacity: 0, y: 16, duration: 0.6 }, '-=0.3')
        .from('.gsap-heading', { opacity: 0, y: 32, duration: 0.7 }, '-=0.3')
        .from('.gsap-subtitle', { opacity: 0, y: 24, duration: 0.6 }, '-=0.4')
        .from('.gsap-cta', { opacity: 0, y: 24, duration: 0.6 }, '-=0.4')
        .from('.gsap-scroll', { opacity: 0, duration: 0.8 }, '-=0.3')
        .from(
          '.gsap-feature-card',
          { opacity: 0, y: 32, duration: 0.6, stagger: 0.15 },
          '-=0.3'
        );
    },
    { scope: containerRef, dependencies: [loading] }
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="gsap-bg fixed inset-0">
        <LineWaves
          color1="#666666"
          color2="#666666"
          color3="#666666"
          brightness={0.4}
          speed={0.2}
          enableMouseInteraction
          mouseInfluence={2}
        />
      </div>

      {/* Header - Responsive */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="gsap-logo flex items-center gap-2 sm:gap-3">
            <Image
              src="/Notion-black.png"
              alt="NotionCraft"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10 dark:hidden"
            />
            <Image
              src="/Notion-white.png"
              alt="NotionCraft"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10 hidden dark:block"
            />
            <span className="text-lg sm:text-xl font-semibold hidden sm:inline">NotionCraft AI</span>
          </div>
          <div className="gsap-nav-actions flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex cursor-pointer" onClick={() => router.push('/auth')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => router.push('/auth')} className="gap-1 sm:gap-2 text-sm sm:text-base cursor-pointer">
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

          {/* Main heading */}
          <h1 className="gsap-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
            Write, plan, and
            <br />
            <span className="bg-linear-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              organize together
            </span>
          </h1>

          {/* Subtitle */}
          <p className="gsap-subtitle text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10">
            A beautiful, minimal workspace for your notes and ideas.
            Powered by AI to help you write faster and think clearer.
          </p>

          {/* CTA Buttons */}
          <div className="gsap-cta flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Button
              size="lg"
              onClick={() => router.push('/auth')}
              className="gap-2 cursor-pointer text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
            >
              Start for Free <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/auth')}
              className="text-base cursor-pointer sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>

          {/* Scroll indicator - positioned between CTA and features */}
          <div className="gsap-scroll flex flex-col items-center gap-2 text-muted-foreground text-sm mb-8 sm:mb-12">
            <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-1">
              <div className="w-1.5 h-2.5 bg-muted-foreground/50 rounded-full animate-bounce" />
            </div>
            <span>Scroll to explore</span>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
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

const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUAAarVyFEAAAAASUVORK5CYII=';

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
    <div className="gsap-feature-card">
      <TiltedCard
        imageSrc={TRANSPARENT_PIXEL}
        containerHeight="220px"
        containerWidth="100%"
        imageHeight="220px"
        imageWidth="100%"
        scaleOnHover={1.05}
        rotateAmplitude={12}
        showMobileWarning={false}
        showTooltip={false}
        displayOverlayContent
        overlayContent={
          <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 w-full h-55 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {icon}
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        }
      />
    </div>
  );
}

export default Index;
