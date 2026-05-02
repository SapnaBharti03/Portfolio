import { Navbar } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Experience } from "@/components/sections/Experience";
import { EducationCerts } from "@/components/sections/EducationCerts";
import { Testimonials } from "@/components/sections/Testimonials";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

const Index = () => {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Services />
      <Experience />
      <EducationCerts />
      <Testimonials />
      <Blog />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
