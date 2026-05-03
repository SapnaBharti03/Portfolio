import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";
import { toast } from "sonner";
import { fun } from "@/lib/toastLines";

interface Post { id: number; slug: string; title: string; excerpt: string; cover_image: string; published_at: string; tags: string[] }

export function Blog() {
  const { data, loading } = useResource<Post[]>("blog");

  return (
    <section id="blog" className="py-28 relative">
      <div className="container">
        <SectionHeading eyebrow="Writing" title="From the blog" description="Notes on engineering, design and shipping software." />

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.map((p, idx) => (
              <motion.a
                key={p.id}
                href={`/blog/${p.slug}`}
                onClick={(e) => { e.preventDefault(); toast(fun.blogOpen()); }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <time>{new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
                    <span>·</span>
                    <div className="flex gap-1.5">
                      {p.tags.slice(0, 2).map((t) => <span key={t} className="text-primary">#{t}</span>)}
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-lg mt-3 leading-snug group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read more <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}