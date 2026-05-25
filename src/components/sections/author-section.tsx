import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import { useAuthor } from "@/lib/queries";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const socials = [
  { icon: Github, href: "https://github.com/iamshuvokd", label: "GitHub" },
  { icon: Twitter, href: "https://x.com/iamshuvokd", label: "X (Twitter)" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/iamshuvokd", label: "LinkedIn" },
  { icon: Youtube, href: "https://www.youtube.com/@iamshuvokd", label: "YouTube" },
];

export function AuthorSection() {
  const { data: author } = useAuthor();

  // Nothing to show until the author has filled in at least a name/bio/photo.
  if (!author || (!author.name && !author.bio && !author.avatar)) return null;

  const name = author.name?.trim() || "PowerApps.blog";

  return (
    <section className="pt-2 pb-12">
      <div className="max-w-5xl mx-auto container-px">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-7 shadow-[var(--shadow-elevated)] backdrop-blur sm:p-9">
          {/* Decorative brand glow + texture */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 dot-bg opacity-[0.12]" />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            {/* Avatar with gradient ring + glow */}
            <div className="shrink-0">
              <div className="rounded-[1.6rem] bg-gradient-to-br from-primary/70 via-primary/30 to-transparent p-[3px] shadow-[var(--shadow-glow)]">
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={name}
                    className="h-28 w-28 rounded-[1.4rem] object-cover sm:h-32 sm:w-32"
                  />
                ) : (
                  <div className="grid h-28 w-28 place-items-center rounded-[1.4rem] gradient-primary text-3xl font-semibold text-primary-foreground sm:h-32 sm:w-32">
                    {initials(name)}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                <span className="h-px w-6 bg-primary/50" /> About the author
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h2>
              {author.title ? (
                <p className="mt-1 text-sm font-medium text-primary/90">{author.title}</p>
              ) : null}
              {author.bio ? (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {author.bio}
                </p>
              ) : null}

              <div className="mt-5 flex items-center justify-center gap-2 sm:justify-start">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border/70 bg-background/60 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
