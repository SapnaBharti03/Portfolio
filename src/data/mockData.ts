import profileImg from "@/assets/profile.jpg";
import p1 from "@/assets/project-1.jpg";
import p2 from "@/assets/project-2.jpg";
import p3 from "@/assets/project-3.jpg";
import p4 from "@/assets/project-4.jpg";
import p5 from "@/assets/project-5.jpg";
import p6 from "@/assets/project-6.jpg";

export const profile = {
  name: "Alex Carter",
  title: "Full Stack Developer",
  roles: ["Full Stack Developer", "React Specialist", "Node.js Engineer", "Cloud Architect"],
  tagline:
    "I build fast, scalable web applications that solve real problems — from polished interfaces to production-ready APIs.",
  bio: [
    "I'm a full stack engineer with 7+ years of experience shipping production software for startups and enterprise teams. I specialize in TypeScript, React, Node.js and modern cloud infrastructure.",
    "My favorite work sits at the intersection of clean architecture and beautiful interfaces. I care about performance, accessibility and writing code other engineers love to maintain.",
  ],
  photo: profileImg,
  cv_url: "#",
  years_of_experience: 7,
  projects_completed: 84,
  happy_clients: 42,
  technologies_count: 30,
  email: "hello@alexcarter.dev",
  phone: "+1 (415) 555-0142",
  location: "San Francisco, CA",
};

export const socialLinks = [
  { id: 1, platform: "GitHub", url: "https://github.com", icon: "github" },
  { id: 2, platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
  { id: 3, platform: "Twitter", url: "https://twitter.com", icon: "twitter" },
  { id: 4, platform: "Instagram", url: "https://instagram.com", icon: "instagram" },
];

export const skills = [
  { id: 1, name: "React", category: "Frontend", proficiency: 95 },
  { id: 2, name: "TypeScript", category: "Frontend", proficiency: 92 },
  { id: 3, name: "Next.js", category: "Frontend", proficiency: 88 },
  { id: 4, name: "Tailwind CSS", category: "Frontend", proficiency: 95 },
  { id: 5, name: "Framer Motion", category: "Frontend", proficiency: 80 },
  { id: 6, name: "Node.js", category: "Backend", proficiency: 93 },
  { id: 7, name: "Express", category: "Backend", proficiency: 90 },
  { id: 8, name: "GraphQL", category: "Backend", proficiency: 78 },
  { id: 9, name: "Python", category: "Backend", proficiency: 75 },
  { id: 10, name: "PostgreSQL", category: "Database", proficiency: 88 },
  { id: 11, name: "MongoDB", category: "Database", proficiency: 82 },
  { id: 12, name: "Redis", category: "Database", proficiency: 75 },
  { id: 13, name: "Docker", category: "DevOps", proficiency: 85 },
  { id: 14, name: "AWS", category: "DevOps", proficiency: 80 },
  { id: 15, name: "GitHub Actions", category: "DevOps", proficiency: 85 },
  { id: 16, name: "Figma", category: "Tools", proficiency: 78 },
  { id: 17, name: "Vite", category: "Tools", proficiency: 90 },
];

export const projects = [
  {
    id: 1,
    title: "Pulse Analytics",
    short_description: "Real-time analytics dashboard for SaaS teams with custom event pipelines.",
    full_description:
      "A multi-tenant analytics platform supporting millions of events per day. Built with React, Node.js and ClickHouse for fast aggregations. Includes role-based access, custom dashboards and Slack alerts.",
    category: "Web App",
    tech_stack: ["React", "TypeScript", "Node.js", "ClickHouse", "Redis"],
    cover_image: p1,
    images: [p1],
    live_url: "https://example.com",
    github_url: "https://github.com",
    is_featured: true,
    challenges: "Aggregating millions of events with sub-second query times across thousands of tenants.",
    results: "Reduced p95 query latency by 78% and onboarded 40+ teams in the first quarter.",
  },
  {
    id: 2,
    title: "Northwind Store",
    short_description: "Headless e-commerce storefront with Stripe checkout and instant search.",
    full_description:
      "A premium headless storefront connected to a custom Node.js commerce API. Optimized for Core Web Vitals and conversion, with instant search powered by Meilisearch.",
    category: "E-commerce",
    tech_stack: ["Next.js", "Stripe", "Meilisearch", "PostgreSQL"],
    cover_image: p2,
    images: [p2],
    live_url: "https://example.com",
    github_url: "https://github.com",
    is_featured: true,
    challenges: "Building a fast PDP that supports complex variant logic with no flicker.",
    results: "Improved LCP from 4.1s to 1.2s and lifted checkout conversion 22%.",
  },
  {
    id: 3,
    title: "Pace Fitness",
    short_description: "Mobile workout tracker with adaptive training plans and live coaching.",
    full_description:
      "Cross-platform mobile app with offline-first sync, adaptive plans driven by ML, and live audio coaching sessions.",
    category: "Mobile",
    tech_stack: ["React Native", "Expo", "Supabase", "Python"],
    cover_image: p3,
    images: [p3],
    live_url: "https://example.com",
    github_url: "https://github.com",
    is_featured: false,
    challenges: "Reliable offline sync with conflict resolution.",
    results: "Achieved 4.8★ rating with 60k MAUs in year one.",
  },
  {
    id: 4,
    title: "DocsForge API",
    short_description: "Self-hosted API documentation portal with live request playground.",
    full_description:
      "OpenAPI-driven docs portal with interactive playground, code samples in 8 languages and team-managed API keys.",
    category: "API",
    tech_stack: ["Node.js", "Fastify", "OpenAPI", "Redis"],
    cover_image: p4,
    images: [p4],
    live_url: "https://example.com",
    github_url: "https://github.com",
    is_featured: false,
    challenges: "Generating accurate, type-safe samples from arbitrary OpenAPI specs.",
    results: "Adopted by 12 internal teams; reduced support tickets 35%.",
  },
  {
    id: 5,
    title: "Canvasly",
    short_description: "Real-time collaboration whiteboard with CRDT-based sync.",
    full_description:
      "Multiplayer whiteboard built on Yjs with sub-30ms sync, infinite canvas and presence indicators.",
    category: "Web App",
    tech_stack: ["React", "Yjs", "WebSockets", "Cloudflare"],
    cover_image: p5,
    images: [p5],
    live_url: "https://example.com",
    github_url: "https://github.com",
    is_featured: true,
    challenges: "Eliminating jitter in cursor presence under poor network conditions.",
    results: "Average sync latency under 28ms across 5 regions.",
  },
  {
    id: 6,
    title: "Inkwell CMS",
    short_description: "Block-based CMS with a delightful editing experience for writers.",
    full_description:
      "Headless CMS built around a block editor with live previews, scheduled publishing and a clean editorial UI.",
    category: "Web App",
    tech_stack: ["Next.js", "tRPC", "PostgreSQL", "S3"],
    cover_image: p6,
    images: [p6],
    live_url: "https://example.com",
    github_url: "https://github.com",
    is_featured: false,
    challenges: "Designing a flexible block schema without sacrificing editor UX.",
    results: "Cut publishing time for editors by 60%.",
  },
];

export const services = [
  {
    id: 1,
    title: "Web Application Development",
    description: "End-to-end React + Node.js apps built for performance, scale and maintainability.",
    icon: "Code2",
    starting_price: "$4,500",
  },
  {
    id: 2,
    title: "API & Backend Engineering",
    description: "Robust REST and GraphQL APIs with thoughtful auth, observability and clean docs.",
    icon: "Server",
    starting_price: "$3,500",
  },
  {
    id: 3,
    title: "Cloud & DevOps",
    description: "AWS infra, CI/CD pipelines and cost-aware architectures that scale predictably.",
    icon: "Cloud",
    starting_price: "$2,800",
  },
  {
    id: 4,
    title: "Performance Audits",
    description: "Deep dive into your stack to surface bottlenecks and ship fixes that actually matter.",
    icon: "Gauge",
    starting_price: "$1,500",
  },
  {
    id: 5,
    title: "Technical Consulting",
    description: "Architecture reviews, hiring help and roadmap planning for engineering teams.",
    icon: "Lightbulb",
    starting_price: "$200/hr",
  },
  {
    id: 6,
    title: "Product Engineering",
    description: "Embedded with your team to ship features fast — from idea to production.",
    icon: "Rocket",
    starting_price: "$6,000",
  },
];

export const experience = [
  {
    id: 1,
    company_name: "Lumen Labs",
    role: "Senior Full Stack Engineer",
    employment_type: "Full-time",
    start_date: "Mar 2022",
    end_date: "Present",
    is_current: true,
    description:
      "Lead engineer on the analytics platform team. Drove the migration from a monolith to a service-oriented architecture.",
    achievements: [
      "Cut p95 API latency by 64% across the analytics stack",
      "Mentored 5 engineers; introduced a design system used company-wide",
      "Owned billing platform rewrite that lifted ARR conversion 18%",
    ],
  },
  {
    id: 2,
    company_name: "Northwind Studio",
    role: "Full Stack Developer",
    employment_type: "Full-time",
    start_date: "Jun 2019",
    end_date: "Feb 2022",
    is_current: false,
    description: "Shipped storefronts and internal tools for early-stage e-commerce brands.",
    achievements: [
      "Launched 14 production storefronts with avg LCP under 1.5s",
      "Built reusable commerce SDK adopted across 9 client projects",
    ],
  },
  {
    id: 3,
    company_name: "Freelance",
    role: "Independent Developer",
    employment_type: "Freelance",
    start_date: "Aug 2017",
    end_date: "May 2019",
    is_current: false,
    description: "Helped startups validate ideas and ship MVPs end-to-end.",
    achievements: ["Delivered 20+ MVPs on tight timelines", "Two clients raised seed rounds post-launch"],
  },
];

export const education = [
  {
    id: 1,
    degree: "B.Sc. Computer Science",
    field_of_study: "Software Engineering",
    institution: "University of California, Berkeley",
    start_year: 2013,
    end_year: 2017,
    description: "Focused on distributed systems and human-computer interaction.",
  },
];

export const certifications = [
  { id: 1, name: "AWS Certified Solutions Architect", issuing_organization: "Amazon Web Services", issue_date: "2023", credential_url: "#" },
  { id: 2, name: "Professional Cloud Developer", issuing_organization: "Google Cloud", issue_date: "2022", credential_url: "#" },
  { id: 3, name: "MongoDB Developer", issuing_organization: "MongoDB University", issue_date: "2021", credential_url: "#" },
];

export const testimonials = [
  {
    id: 1,
    client_name: "Sarah Mitchell",
    company: "Lumen Labs",
    position: "VP of Engineering",
    review_text:
      "Alex is one of the most thoughtful engineers I've worked with. He combines deep technical chops with a real eye for product and design.",
    star_rating: 5,
    client_photo: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 2,
    client_name: "David Chen",
    company: "Northwind Studio",
    position: "Founder",
    review_text:
      "Hired Alex for an MVP and ended up keeping him on for two years. He ships fast, communicates clearly, and his code is a joy to maintain.",
    star_rating: 5,
    client_photo: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    client_name: "Priya Patel",
    company: "Canvasly",
    position: "Product Lead",
    review_text:
      "The real-time collaboration features Alex built for us are genuinely best-in-class. Customers comment on how smooth it feels.",
    star_rating: 5,
    client_photo: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: 4,
    client_name: "Marcus Webb",
    company: "DocsForge",
    position: "CTO",
    review_text:
      "Alex rewrote our docs portal from scratch in six weeks. It's faster, prettier, and our developers actually use it now.",
    star_rating: 5,
    client_photo: "https://i.pravatar.cc/150?img=68",
  },
];

export const blogPosts = [
  {
    id: 1,
    slug: "scaling-react-apps",
    title: "Scaling React Apps Without Losing Your Mind",
    excerpt: "Patterns I've used to keep large React codebases fast, friendly to onboard, and easy to refactor.",
    cover_image: p1,
    published_at: "2025-09-12",
    tags: ["React", "Architecture"],
    content: "",
    status: "Published",
  },
  {
    id: 2,
    slug: "node-observability",
    title: "A Pragmatic Guide to Node.js Observability",
    excerpt: "Logs, metrics, traces — what to instrument first when you don't have unlimited engineering time.",
    cover_image: p4,
    published_at: "2025-08-04",
    tags: ["Node.js", "DevOps"],
    content: "",
    status: "Published",
  },
  {
    id: 3,
    slug: "design-systems-small-teams",
    title: "Design Systems for Small Teams",
    excerpt: "Why most design system advice is wrong for teams under ten engineers — and what to do instead.",
    cover_image: p6,
    published_at: "2025-07-21",
    tags: ["Design", "Frontend"],
    content: "",
    status: "Published",
  },
];