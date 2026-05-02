import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Skeleton } from "@/components/portfolio/Skeleton";
import { useResource } from "@/hooks/useResource";

interface T { id: number; client_name: string; company: string; position: string; review_text: string; star_rating: number; client_photo: string }

export function Testimonials() {
  const { data, loading } = useResource<T[]>("testimonials");
  const [i, setI] = useState(0);
  const total = data?.length ?? 0;

  useEffect(() => {
    if (!total) return;
    const id = setInterval(() => setI((v) => (v + 1) % total), 7000);
    return () => clearInterval(id);
  }, [total]);

  const current = data?.[i];

  return (
    <section id="testimonials" className="py-28 relative">
      <div className="container max-w-4xl">
        <SectionHeading eyebrow="Testimonials" title="What clients say" />

        {loading || !current ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="relative">
            <div className="absolute -top-6 left-6 text-primary/30"><Quote className="h-16 w-16" /></div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="glass rounded-3xl p-8 md:p-12 relative"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: current.star_rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg md:text-xl leading-relaxed">"{current.review_text}"</p>
                <div className="mt-7 flex items-center gap-4">
                  <img src={current.client_photo} alt={current.client_name} className="h-12 w-12 rounded-full object-cover border border-border" />
                  <div>
                    <div className="font-semibold">{current.client_name}</div>
                    <div className="text-sm text-muted-foreground">{current.position} · {current.company}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-1.5">
                {data?.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-1.5 bg-border"}`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setI((v) => (v - 1 + total) % total)} className="h-10 w-10 grid place-items-center rounded-full glass hover:text-primary"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setI((v) => (v + 1) % total)} className="h-10 w-10 grid place-items-center rounded-full glass hover:text-primary"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}