// Friendly, slightly playful but professional toast copy.
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const lines = {
  created: (entity = "Item") => [
    `${entity} is live and looking sharp ✨`,
    `${entity} added — fresh out of the oven 🔥`,
    `${entity} created. The portfolio just leveled up.`,
    `New ${entity.toLowerCase()} signed, sealed, delivered.`,
  ],
  updated: (entity = "Item") => [
    `${entity} polished to perfection ✨`,
    `${entity} updated — looking even better.`,
    `Saved. ${entity} is wearing the new look well.`,
  ],
  deleted: (entity = "Item") => [
    `${entity} sent to the void 🗑️`,
    `${entity} removed. Out with the old.`,
    `${entity} deleted — cleaner already.`,
  ],
  error: () => [
    "Hmm, that didn't quite stick. Try again?",
    "Something tripped on the way. Mind retrying?",
    "Tiny hiccup on our end — give it another go.",
  ],
  contactSent: () => [
    "Message launched! ✈️ I'll reply within 24 hours.",
    "Got it — your message is in my inbox ☕ Reply within 24h.",
    "Sent! Pigeons dispatched 🕊️ — expect a reply within a day.",
  ],
  welcome: () => [
    "Welcome back, captain 🚀",
    "You're in. Let's ship something great.",
    "Logged in — the studio is yours.",
  ],
  loggedOut: () => [
    "Signed out. See you soon 👋",
    "Logged out — coffee break earned ☕",
  ],
  signup: () => [
    "Account ready. Welcome aboard 🎉",
    "You're in the club. Let's build.",
  ],
  cvDownload: () => [
    "CV on its way 📄 Hope it makes for good reading!",
    "Grabbing the resume… don't skip the projects section 😉",
    "CV downloaded — fingers crossed 🤞",
  ],
  copied: (label = "Copied") => [
    `${label}! Paste it somewhere fun 📋`,
    `${label} to clipboard ✨`,
  ],
  hireMe: () => [
    "Excellent taste 💼 Scrolling you down — let's talk.",
    "Buckle up — drop me a line below and we'll make it happen ✦",
    "Love that energy. The contact form awaits ✍️",
  ],
  viewWork: () => [
    "Buckle up — entering the project zone 🚀",
    "Showtime! Have a look around 👀",
    "Project gallery loading… hope you brought coffee ☕",
  ],
  externalLink: (where = "site") => [
    `Off to the ${where} — see you on the other side 🌐`,
    `Opening ${where} in a new tab… fly safe ✈️`,
  ],
  socialFollow: (platform = "social") => [
    `Heading to ${platform} — let's connect there 👋`,
    `Off to ${platform}. Don't forget to say hi!`,
  ],
  filterChange: (cat: string) => [
    `Filtering for ${cat} — only the good stuff ✨`,
    `${cat} only. Curated for you.`,
    `Showing ${cat} projects 🎯`,
  ],
  projectOpen: (title: string) => [
    `Opening "${title}" — grab a seat 🍿`,
    `Diving into "${title}"… enjoy the read 📖`,
  ],
  blogOpen: () => [
    "Opening the read 📖 Hope you enjoy it!",
    "Article incoming — stay a while ☕",
  ],
  validation: (msg: string) => msg,
};

export const fun = {
  created: (entity?: string) => pick(lines.created(entity)),
  updated: (entity?: string) => pick(lines.updated(entity)),
  deleted: (entity?: string) => pick(lines.deleted(entity)),
  error: () => pick(lines.error()),
  contactSent: () => pick(lines.contactSent()),
  welcome: () => pick(lines.welcome()),
  loggedOut: () => pick(lines.loggedOut()),
  signup: () => pick(lines.signup()),
  cvDownload: () => pick(lines.cvDownload()),
  copied: (label?: string) => pick(lines.copied(label)),
  hireMe: () => pick(lines.hireMe()),
  viewWork: () => pick(lines.viewWork()),
  externalLink: (where?: string) => pick(lines.externalLink(where)),
  socialFollow: (platform?: string) => pick(lines.socialFollow(platform)),
  filterChange: (cat: string) => pick(lines.filterChange(cat)),
  projectOpen: (title: string) => pick(lines.projectOpen(title)),
  blogOpen: () => pick(lines.blogOpen()),
};