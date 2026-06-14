-- Run once in Supabase SQL editor (or psql) before using drag-and-drop reorder.

-- Skill category enum value used by the admin UI
DO $$ BEGIN
  ALTER TYPE public.skill_category ADD VALUE 'Framework & Libraries';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- display_order for sections that did not have manual ordering yet
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.social_links ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
