import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Sparkles, FileText, Mail, MessageSquareQuote, Wrench, ArrowRight } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

const cards = [
  { key: "projects" as const, label: "Projects", icon: Briefcase, to: "/admin/projects" },
  { key: "skills" as const, label: "Skills", icon: Sparkles, to: "/admin/skills" },
  { key: "services" as const, label: "Services", icon: Wrench, to: "/admin/services" },
  { key: "blog" as const, label: "Blog Posts", icon: FileText, to: "/admin/blog" },
  { key: "testimonials" as const, label: "Testimonials", icon: MessageSquareQuote, to: "/admin/testimonials" },
  { key: "messages" as const, label: "Messages", icon: Mail, to: "/admin/messages" },
];

async function fetchCount(path: string, key: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/api/${path}`);
  if (!res.ok) return 0;
  const data = await res.json();
  const list = data[key] ?? [];
  return Array.isArray(list) ? list.length : 0;
}

export default function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({
    projects: 0,
    skills: 0,
    services: 0,
    blog: 0,
    testimonials: 0,
    messages: 0,
  });

  useEffect(() => {
    Promise.all([
      fetchCount("projects", "projects").then((n) => ["projects", n] as const),
      fetchCount("skills", "skills").then((n) => ["skills", n] as const),
      fetchCount("services", "services").then((n) => ["services", n] as const),
      fetchCount("blog-posts", "blog_posts").then((n) => ["blog", n] as const),
      fetchCount("testimonials", "testimonials").then((n) => ["testimonials", n] as const),
      fetchCount("messages", "messages").then((n) => ["messages", n] as const),
    ]).then((entries) => {
      setCounts(Object.fromEntries(entries));
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">Here's an overview of your portfolio content.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ key, label, icon: Icon, to }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={to}
              className="group block rounded-xl border border-border bg-surface/50 p-5 hover:border-primary/50 hover:bg-surface transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold mt-1">{counts[key]}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
