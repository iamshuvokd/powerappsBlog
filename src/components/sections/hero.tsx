import { ArrowRight, BookOpen, Boxes, FileStack, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PowerPlatformHeroScene } from "@/components/sections/power-platform-hero-scene";

const heroTopics = [
  { label: "Power Apps", icon: Boxes },
  { label: "Power Automate", icon: Workflow },
  { label: "SharePoint", icon: FileStack },
];

export function Hero() {
  return (
    <section className="relative isolate min-h-[680px] overflow-hidden pt-28 pb-16 sm:pt-32 xl:min-h-[720px] xl:pt-36">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_32%,color-mix(in_oklab,var(--primary)_35%,transparent),transparent_34%),linear-gradient(135deg,color-mix(in_oklab,var(--background)_96%,white)_0%,var(--background)_45%,color-mix(in_oklab,var(--surface)_92%,black)_100%)]" />
      <div className="absolute inset-0 -z-20 dot-bg opacity-35" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_72%_74%_at_18%_46%,var(--background)_0%,color-mix(in_oklab,var(--background)_86%,transparent)_44%,transparent_76%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent" />

      <PowerPlatformHeroScene
        mediaQuery="(min-width: 1280px)"
        placement="desktop"
        className="absolute inset-0 z-0 hidden h-full w-full xl:block"
      />

      <div className="relative z-10 max-w-7xl mx-auto container-px">
        <div className="grid min-h-[520px] items-center xl:grid-cols-[minmax(0,0.88fr)_minmax(380px,1.12fr)]">
          <div className="max-w-2xl space-y-8 animate-[slide-up_0.7s_ease-out]">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Microsoft 365 builder blog
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.04]">
                Build better with <span className="gradient-text">Power Platform</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Professional blog articles for Power Apps, Power Automate and SharePoint builders
                who want practical patterns, clean architecture and production-ready ideas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90"
              >
                <a href="#blogs">
                  Explore Blogs <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
              <span className="text-xs text-muted-foreground">
                Browse all articles or jump into a focused category.
              </span>
            </div>

            <div className="relative -mx-5 h-72 overflow-hidden sm:h-80 xl:hidden">
              <PowerPlatformHeroScene
                mediaQuery="(max-width: 1279px)"
                placement="inline"
                className="absolute inset-0 h-full w-full"
              />
            </div>

            <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {heroTopics.map((topic) => (
                <a
                  key={topic.label}
                  href={
                    topic.label === "Power Apps"
                      ? "/powerapps"
                      : `/${topic.label.toLowerCase().replace(" ", "-")}`
                  }
                  className="group rounded-lg border border-border/70 bg-card/70 p-3 shadow-[var(--shadow-soft)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
                      <topic.icon className="h-4 w-4" />
                    </span>
                    {topic.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
