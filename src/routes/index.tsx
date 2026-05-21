import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { Categories } from "@/components/sections/categories";
import { FeaturedArticles } from "@/components/sections/featured-articles";
import { EnterpriseSolutions } from "@/components/sections/enterprise-solutions";
import { UIShowcase } from "@/components/sections/ui-showcase";
import { Services } from "@/components/sections/services";
import { About } from "@/components/sections/about";
import { Testimonials } from "@/components/sections/testimonials";
import { Newsletter } from "@/components/sections/newsletter";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Stats />
      <Categories />
      <FeaturedArticles />
      <EnterpriseSolutions />
      <UIShowcase />
      <Services />
      <About />
      <Testimonials />
      <Newsletter />
    </>
  );
}
