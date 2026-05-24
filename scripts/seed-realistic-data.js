'use strict';

/**
 * Comprehensive realistic seed for XchangeSkills.
 * Run from inside the backend/ directory:
 *   node ../scripts/seed-realistic-data.js
 *
 * Creates:
 *   8 users  •  5 categories  •  10 skills  •  8 service requests
 *   10 reviews  •  5 chats (with participants + messages)  •  4 reports
 *
 * NOTE: Requires a clean (empty) PostgreSQL DB — existing rows with the same
 *       username/email are skipped so the script is safe to re-run.
 */

let strapi;

// ---------------------------------------------------------------------------
// Data definitions (same structure as mockData.ts, realistic content)
// ---------------------------------------------------------------------------

const USERS = [
  {
    username: 'alice_johnson',
    email: 'alice.johnson@xchangeskills.io',
    password: 'SecurePass@2026',
    displayName: 'Alice Johnson',
    bio: 'Full-stack developer and instructor with 8 years of experience building React and Node.js applications.',
    location: 'New York, USA',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
  {
    username: 'bob_martinez',
    email: 'bob.martinez@xchangeskills.io',
    password: 'SecurePass@2026',
    displayName: 'Bob Martinez',
    bio: 'Graphic designer and illustrator specializing in brand identity and UI/UX. Adobe CC power user.',
    location: 'Madrid, Spain',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    username: 'carol_lee',
    email: 'carol.lee@xchangeskills.io',
    password: 'SecurePass@2026',
    displayName: 'Carol Lee',
    bio: 'Digital marketer and growth specialist who has scaled startups from zero to six-figure MRR.',
    location: 'Toronto, Canada',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    username: 'dave_kim',
    email: 'dave.kim@xchangeskills.io',
    password: 'SecurePass@2026',
    displayName: 'Dave Kim',
    bio: 'Senior backend engineer and API architect. Passionate about distributed systems and DDD.',
    location: 'Seoul, South Korea',
    avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
  },
  {
    username: 'eva_green',
    email: 'eva.green@xchangeskills.io',
    password: 'SecurePass@2026',
    displayName: 'Eva Green',
    bio: 'Product manager and strategist with a track record at top-tier SaaS companies.',
    location: 'Berlin, Germany',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
  },
  {
    username: 'frank_liu',
    email: 'frank.liu@xchangeskills.io',
    password: 'SecurePass@2026',
    displayName: 'Frank Liu',
    bio: 'Data scientist and ML engineer. Kaggle master. Loves turning messy data into actionable insight.',
    location: 'San Francisco, USA',
    avatar: 'https://randomuser.me/api/portraits/men/77.jpg',
  },
  {
    username: 'gina_torres',
    email: 'gina.torres@xchangeskills.io',
    password: 'SecurePass@2026',
    displayName: 'Gina Torres',
    bio: 'Copywriter and content strategist. B2B SaaS specialist with a sharp eye for conversion copy.',
    location: 'London, UK',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
  },
  {
    username: 'harry_singh',
    email: 'harry.singh@xchangeskills.io',
    password: 'SecurePass@2026',
    displayName: 'Harry Singh',
    bio: 'DevOps engineer with deep expertise in Kubernetes, Terraform, and cloud-native architectures.',
    location: 'Mumbai, India',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
  },
];

const CATEGORIES = [
  { name: 'Programming', slug: 'programming', description: 'Software development, coding, and engineering skills', icon: 'code' },
  { name: 'Design', slug: 'design', description: 'UI/UX, graphic design, and visual communication', icon: 'palette' },
  { name: 'Marketing', slug: 'marketing', description: 'Growth, SEO, paid ads, and content marketing', icon: 'megaphone' },
  { name: 'Business', slug: 'business', description: 'Strategy, product management, and operations', icon: 'briefcase' },
  { name: 'Data Science', slug: 'data-science', description: 'Analytics, machine learning, and data engineering', icon: 'bar-chart' },
];

// Skills reference user by index in USERS array (0-based)
const SKILLS_SEED = [
  {
    title: 'React & Next.js Development',
    description: 'I help teams build fast, scalable frontends with React and Next.js. Services include component architecture, SSR/SSG patterns, state management with Zustand or Redux, and performance optimisation. I follow accessibility best practices and write thoroughly tested code.',
    price: 50,
    deliveryDays: 3,
    tags: ['react', 'nextjs', 'frontend', 'typescript'],
    marketplace: true,
    rating: 4.8,
    reviewsCount: 24,
    coverImageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 0,       // alice
    categorySlug: 'programming',
  },
  {
    title: 'UI/UX Design & Research',
    description: 'End-to-end product design: discovery workshops, user research, wireframes, high-fidelity mockups, and interactive prototypes in Figma. I apply atomic design principles and create handoff-ready design systems that developers love.',
    price: 40,
    deliveryDays: 5,
    tags: ['ui', 'ux', 'figma', 'design-systems'],
    marketplace: true,
    rating: 4.6,
    reviewsCount: 12,
    coverImageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 1,       // bob
    categorySlug: 'design',
  },
  {
    title: 'SEO & Content Strategy',
    description: 'Full-funnel content strategy to increase organic traffic and domain authority. Deliverables include technical SEO audits, keyword research reports, editorial calendars, on-page optimisation guides, and monthly performance dashboards.',
    price: 70,
    deliveryDays: 7,
    tags: ['seo', 'content-marketing', 'keyword-research'],
    marketplace: true,
    rating: 4.4,
    reviewsCount: 8,
    coverImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 2,       // carol
    categorySlug: 'marketing',
  },
  {
    title: 'REST & GraphQL API Design',
    description: 'I architect and implement production-grade RESTful and GraphQL APIs on Node.js. Services cover data modelling, authentication (JWT/OAuth2), rate-limiting, OpenAPI documentation, integration testing, and CI/CD pipelines.',
    price: 80,
    deliveryDays: 4,
    tags: ['api', 'nodejs', 'graphql', 'rest'],
    marketplace: true,
    rating: 4.9,
    reviewsCount: 30,
    coverImageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 3,       // dave
    categorySlug: 'programming',
  },
  {
    title: 'Data Analysis with Python',
    description: 'Transform your raw data into clear business insights. I perform data cleaning with pandas, exploratory analysis, interactive visualisations with Plotly, and statistical modelling. I deliver annotated Jupyter notebooks and executive-ready reports.',
    price: 60,
    deliveryDays: 5,
    tags: ['python', 'pandas', 'data-analysis', 'matplotlib'],
    marketplace: true,
    rating: 4.7,
    reviewsCount: 10,
    coverImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 5,       // frank
    categorySlug: 'data-science',
  },
  {
    title: 'Figma Prototyping & Design Systems',
    description: 'High-fidelity Figma prototypes and scalable design systems. I build component libraries with variants, auto-layout, and tokenised styles that speed up your entire product team. Includes developer handoff documentation.',
    price: 45,
    deliveryDays: 3,
    tags: ['figma', 'prototyping', 'design-system'],
    marketplace: true,
    rating: 4.5,
    reviewsCount: 9,
    coverImageUrl: 'https://images.unsplash.com/photo-1706426622953-deb20641984c?q=80&w=880&auto=format&fit=crop',
    status: 'approved',
    ownerIdx: 1,       // bob
    categorySlug: 'design',
  },
  {
    title: 'Google Ads Campaign Management',
    description: 'Full-funnel Google Ads management: account structure, keyword strategy, responsive search ads, Performance Max campaigns, conversion tracking setup, and bi-weekly optimisation reports. Average client ROAS improvement: 3.2×.',
    price: 90,
    deliveryDays: 7,
    tags: ['google-ads', 'ppc', 'sem', 'roas'],
    marketplace: true,
    rating: 4.3,
    reviewsCount: 6,
    coverImageUrl: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 2,       // carol
    categorySlug: 'marketing',
  },
  {
    title: 'Technical Writing & API Docs',
    description: 'Clear, developer-friendly documentation: API references, integration guides, README files, changelogs, and internal runbooks. I have contributed to docs for several open-source projects and can work with your existing doc toolchain (MkDocs, Docusaurus, Notion).',
    price: 55,
    deliveryDays: 4,
    tags: ['technical-writing', 'api-docs', 'documentation'],
    marketplace: true,
    rating: 4.6,
    reviewsCount: 5,
    coverImageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 6,       // gina
    categorySlug: 'business',
  },
  {
    title: 'Kubernetes & Helm Cluster Setup',
    description: 'Production Kubernetes clusters on EKS, GKE, or AKS. Services include cluster bootstrapping, Helm chart authoring, ingress configuration, RBAC policies, monitoring with Prometheus/Grafana, and runbook documentation. Zero-downtime deployments guaranteed.',
    price: 150,
    deliveryDays: 10,
    tags: ['kubernetes', 'helm', 'devops', 'cloud-native'],
    marketplace: true,
    rating: 4.9,
    reviewsCount: 14,
    coverImageUrl: 'https://images.unsplash.com/photo-1505238680356-667803448bb6?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 7,       // harry
    categorySlug: 'programming',
  },
  {
    title: 'Logo & Brand Identity Design',
    description: 'Comprehensive brand identity packages: logo design (3 concepts + revisions), colour palette, typography system, icon set, and a brand guideline PDF. Delivered as vector files (AI, EPS, SVG) and ready-to-use web formats.',
    price: 120,
    deliveryDays: 7,
    tags: ['branding', 'logo-design', 'identity', 'illustrator'],
    marketplace: true,
    rating: 4.7,
    reviewsCount: 20,
    coverImageUrl: 'https://images.unsplash.com/photo-1485841890310-6a055c88698a?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    ownerIdx: 1,       // bob
    categorySlug: 'design',
  },
];

// Service requests: skillIdx references SKILLS_SEED (0-based), requesterIdx references USERS
const daysAgo = (n) => new Date(Date.now() - 1000 * 60 * 60 * 24 * n).toISOString();

const SERVICE_REQUESTS_SEED = [
  {
    skillIdx: 0,       // React & Next.js
    requesterIdx: 2,   // carol
    status: 'pending',
    requestDetails: 'Looking for help building an analytics dashboard with Chart.js, user authentication via NextAuth, and real-time data updates using SWR. Targeting launch in 3 weeks.',
    serviceMode: 'REMOTE',
    duration: 60,
    requestedTime: 'Jan 25, 2026 — 3:00 PM (GMT+0)',
    createdAt: daysAgo(3),
  },
  {
    skillIdx: 1,       // UI/UX Design
    requesterIdx: 4,   // eva
    status: 'accepted',
    requestDetails: 'Our SaaS landing page needs a complete redesign. Focus on conversion optimisation, trust signals, and a clean modern aesthetic. We want A/B test variants too.',
    serviceMode: 'REMOTE',
    duration: 90,
    requestedTime: 'Jan 24, 2026 — 2:00 PM (GMT+1)',
    createdAt: daysAgo(10),
    respondedAt: daysAgo(9),
  },
  {
    skillIdx: 3,       // REST & GraphQL API
    requesterIdx: 1,   // bob
    status: 'completed',
    requestDetails: 'Implement JWT authentication, refresh-token rotation, and role-based access control for our new platform. Must include integration tests and an OpenAPI spec.',
    serviceMode: 'HYBRID',
    serviceLocation: 'Espacio Abierto Co-working, Calle Gran Vía 28, Madrid',
    duration: 120,
    requestedTime: 'Jan 22, 2026 — 5:00 PM (GMT+1)',
    createdAt: daysAgo(30),
    respondedAt: daysAgo(28),
  },
  {
    skillIdx: 4,       // Data Analysis
    requesterIdx: 0,   // alice
    status: 'pending',
    requestDetails: 'We have 18 months of e-commerce sales data in CSV format. Need a full EDA, customer segmentation using k-means, and visualisations for the exec board presentation.',
    serviceMode: 'REMOTE',
    duration: 120,
    requestedTime: 'Jan 26, 2026 — 10:00 AM (GMT-5)',
    createdAt: daysAgo(2),
  },
  {
    skillIdx: 5,       // Figma Prototyping
    requesterIdx: 4,   // eva
    status: 'accepted',
    requestDetails: 'Design a high-fidelity prototype for our new mobile onboarding flow (7 screens). Must cover happy path, error states, and empty states. Include a design token export.',
    serviceMode: 'REMOTE',
    duration: 150,
    requestedTime: 'Jan 23, 2026 — 9:00 AM (GMT+1)',
    createdAt: daysAgo(8),
    respondedAt: daysAgo(7),
  },
  {
    skillIdx: 8,       // Kubernetes
    requesterIdx: 3,   // dave
    status: 'pending',
    requestDetails: 'Migrate our monolith from bare-metal VMs to AKS. Services: 4 microservices, Redis, PostgreSQL. Need Helm charts, horizontal pod autoscalers, and a disaster recovery plan.',
    serviceMode: 'ONSITE',
    serviceLocation: 'Tech Park Tower, Floor 12, Gangnam-gu, Seoul',
    duration: 180,
    requestedTime: 'Jan 27, 2026 — 11:00 AM (GMT+9)',
    createdAt: daysAgo(1),
  },
  {
    skillIdx: 7,       // Technical Writing
    requesterIdx: 6,   // gina
    status: 'rejected',
    requestDetails: 'Write comprehensive API documentation for our v2 REST endpoints (40+ routes). Must include request/response examples, error codes, and a getting-started guide.',
    serviceMode: 'REMOTE',
    duration: 90,
    requestedTime: 'Jan 20, 2026 — 4:00 PM (GMT+0)',
    createdAt: daysAgo(6),
    respondedAt: daysAgo(5),
    responseNote: 'Fully booked for the next three weeks — please check back in February.',
  },
  {
    skillIdx: 9,       // Logo & Brand Identity
    requesterIdx: 2,   // carol
    status: 'rejected',
    requestDetails: 'Need a complete brand identity package for a fintech startup targeting Gen-Z. Colours should feel bold and trustworthy. Logo, icon, and brand guidelines are all required.',
    serviceMode: 'REMOTE',
    duration: 120,
    requestedTime: 'Jan 21, 2026 — 3:00 PM (GMT-5)',
    createdAt: daysAgo(15),
    respondedAt: daysAgo(14),
    responseNote: 'Already committed to another client for this sprint — sorry I cannot take this on right now.',
  },
];

// Reviews: skillIdx and reviewerIdx reference the arrays above
const REVIEWS_SEED = [
  { skillIdx: 0, reviewerIdx: 2, rating: 5, comment: 'Alice delivered an outstanding React dashboard — clean code, excellent documentation, and finished two days ahead of schedule. I am already booking her for our next sprint.', daysAgo: 15 },
  { skillIdx: 0, reviewerIdx: 1, rating: 4, comment: 'Good work overall. The component architecture was solid and the code was well-tested. Minor feedback: the README could go into more detail on local setup.', daysAgo: 40 },
  { skillIdx: 1, reviewerIdx: 2, rating: 5, comment: 'Bob transformed our plain landing page into something beautiful. His design process was thorough — three concepts, two rounds of revisions, and a polished final result.', daysAgo: 12 },
  { skillIdx: 3, reviewerIdx: 1, rating: 5, comment: 'Dave architected our entire authentication layer in one session. The code is rock-solid, the OpenAPI spec is thorough, and the integration tests caught an edge case I had missed.', daysAgo: 60 },
  { skillIdx: 4, reviewerIdx: 0, rating: 5, comment: 'Frank uncovered three major trends in our sales data that directly shaped our Q1 strategy. The visualisations were presentation-ready and the insights were genuinely actionable.', daysAgo: 5 },
  { skillIdx: 5, reviewerIdx: 4, rating: 4, comment: 'Beautiful prototype, very thorough coverage of all screen states. Small note: the design tokens needed minor adjustments before exporting to our codebase, but overall a great result.', daysAgo: 20 },
  { skillIdx: 8, reviewerIdx: 3, rating: 5, comment: 'Harry migrated our entire infrastructure to AKS with zero downtime. The Helm charts are clean, the autoscaling policies are well-tuned, and the runbook is incredibly detailed.', daysAgo: 25 },
  { skillIdx: 9, reviewerIdx: 2, rating: 5, comment: 'Bob created a brand identity that perfectly captures the spirit of our product. From logo to brand guidelines, every deliverable exceeded expectations. Highly recommended.', daysAgo: 18 },
  { skillIdx: 0, reviewerIdx: 5, rating: 4, comment: 'Reliable, professional, and communicative throughout. The final Next.js build is fast and well-structured. Delivered on time and within the agreed scope.', daysAgo: 7 },
  { skillIdx: 3, reviewerIdx: 0, rating: 5, comment: 'Exceptional API design session. Dave thought through edge cases I had not considered and the resulting GraphQL schema is elegant and extensible. Will work with him again.', daysAgo: 45 },
];

// Chats & messages
const CHATS_SEED = [
  {
    participantIdxs: [0, 2],  // alice ↔ carol
    messages: [
      { senderIdx: 2, content: 'Hi Alice — I saw your React development profile and I am very interested. I need a dashboard built with charts and role-based access. Is your calendar open this month?' },
      { senderIdx: 0, content: 'Hey Carol! Yes, I have availability. Happy to help — dashboards are my sweet spot. Can you share more about the data sources and authentication requirements?' },
      { senderIdx: 2, content: 'We are pulling from a PostgreSQL database via a REST API. Auth is JWT-based already. Mainly need the frontend — Chart.js for visualisations and a clean admin layout.' },
    ],
  },
  {
    participantIdxs: [1, 2],  // bob ↔ carol
    messages: [
      { senderIdx: 2, content: 'Bob, we need our homepage completely redesigned before our Series A pitch. Can you take on a short turnaround project?' },
      { senderIdx: 1, content: 'Absolutely — I love high-stakes redesigns. Sending you three initial concept mood boards so we can align on direction first.' },
      { senderIdx: 2, content: 'Concept 2 is exactly the vibe we are going for. Modern, clean, and trustworthy. When can we kick off?' },
    ],
  },
  {
    participantIdxs: [5, 0],  // frank ↔ alice
    messages: [
      { senderIdx: 5, content: 'Alice, I am working on an ETL pipeline and running into performance issues with large pandas DataFrames. Would love to pair on this — think 90 minutes would do it.' },
      { senderIdx: 0, content: 'Sure thing! Share the notebook and a sample of the data and we can dig in. I have seen this kind of thing before — usually chunking or vectorised ops solve it.' },
    ],
  },
  {
    participantIdxs: [6, 4],  // gina ↔ eva
    messages: [
      { senderIdx: 6, content: 'Eva — I specialise in B2B SaaS content. I could draft a series of thought leadership blog posts tailored to your ICP. Would you like to see some sample topics?' },
      { senderIdx: 4, content: 'Yes, please! We are trying to build authority in the HR-tech space. A five-post series would be ideal. Please send a few headline ideas and we can take it from there.' },
    ],
  },
  {
    participantIdxs: [7, 3],  // harry ↔ dave
    messages: [
      { senderIdx: 7, content: 'Dave, I need to containerise three Node.js microservices and set up a local Kubernetes cluster with Minikube for dev. Could you walk me through best practices for the Dockerfiles and manifests?' },
      { senderIdx: 3, content: 'Happy to help! Multi-stage Dockerfiles and a Helm umbrella chart will keep things tidy. Let us set up a two-hour session and we will have you running locally by the end of it.' },
      { senderIdx: 7, content: 'Perfect — two hours sounds right. What time works for you next week? I am flexible Tuesday or Thursday afternoon KST.' },
    ],
  },
];

// Reports (reporter/target reference USERS by index)
const REPORTS_SEED = [
  {
    reporterIdx: 2,
    reportedUserIdx: 1,
    reason: 'Inappropriate communication',
    description: 'The provider sent multiple unsolicited messages outside of the agreed scope, including promotional offers unrelated to our project.',
    status: 'PENDING',
  },
  {
    reporterIdx: 1,
    reportedUserIdx: 2,
    reason: 'Misleading skill listing',
    description: 'The SEO service listing promised a guaranteed top-10 Google ranking within 30 days, which is not achievable and constitutes false advertising.',
    status: 'REVIEWED',
  },
  {
    reporterIdx: 4,
    reportedUserIdx: 7,
    reason: 'No-show for agreed session',
    description: 'The provider accepted the Kubernetes request and confirmed the session time, but did not show up and has not responded to follow-up messages in 48 hours.',
    status: 'PENDING',
  },
  {
    reporterIdx: 5,
    reportedUserIdx: 1,
    reason: 'Copyright infringement',
    description: 'The logo design delivered appears to be a direct copy of a well-known open-source icon with minor colour changes, not an original creation as advertised.',
    status: 'RESOLVED',
  },
];

// ---------------------------------------------------------------------------
// Helper: find or create records idempotently
// ---------------------------------------------------------------------------

async function findOrCreateUser(userData) {
  const existing = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { email: userData.email },
  });
  if (existing) {
    console.log(`  ↩  User exists: ${userData.username}`);
    return existing;
  }

  const userService = strapi.plugin('users-permissions').service('user');
  const authRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });

  const user = await userService.add({
    username: userData.username,
    email: userData.email,
    password: userData.password,
    provider: 'local',
    confirmed: true,
    blocked: false,
    displayName: userData.displayName,
    location: userData.location,
    avatar: userData.avatar,
    role: authRole?.id,
  });

  console.log(`  ✓  Created user: ${userData.username}`);
  return user;
}

async function findOrCreateCategory(catData) {
  const existing = await strapi.db.query('api::category.category').findOne({ where: { name: catData.name } });
  if (existing) {
    console.log(`  ↩  Category exists: ${catData.name}`);
    return existing;
  }
  const cat = await strapi.db.query('api::category.category').create({ data: catData });
  console.log(`  ✓  Created category: ${catData.name}`);
  return cat;
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seedAll() {
  console.log('\n━━━ 1 / 7  Users ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const users = [];
  for (const u of USERS) {
    users.push(await findOrCreateUser(u));
  }

  console.log('\n━━━ 2 / 7  Categories ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const categoryMap = {};
  for (const c of CATEGORIES) {
    const cat = await findOrCreateCategory(c);
    categoryMap[c.slug] = cat;
  }

  console.log('\n━━━ 3 / 7  Profiles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (let i = 0; i < USERS.length; i++) {
    const user = users[i];
    const uData = USERS[i];
    const existing = await strapi.db.query('api::profile.profile').findOne({ where: { user: user.id } });
    if (existing) {
      console.log(`  ↩  Profile exists for: ${uData.username}`);
      continue;
    }
    await strapi.db.query('api::profile.profile').create({
      data: {
        displayName: uData.displayName,
        bio: uData.bio,
        profilePicUrl: uData.avatar,
        location: uData.location,
        user: user.id,
      },
    });
    console.log(`  ✓  Created profile for: ${uData.username}`);
  }

  console.log('\n━━━ 4 / 7  Skills ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const skills = [];
  for (const s of SKILLS_SEED) {
    const existing = await strapi.db.query('api::skill.skill').findOne({ where: { title: s.title } });
    if (existing) {
      console.log(`  ↩  Skill exists: ${s.title}`);
      skills.push(existing);
      continue;
    }
    const category = categoryMap[s.categorySlug];
    const owner = users[s.ownerIdx];
    const skill = await strapi.db.query('api::skill.skill').create({
      data: {
        title: s.title,
        description: s.description,
        price: s.price,
        deliveryDays: s.deliveryDays,
        tags: s.tags,
        marketplace: s.marketplace,
        rating: s.rating,
        reviewsCount: s.reviewsCount,
        coverImageUrl: s.coverImageUrl,
        status: s.status,
        category: category?.id,
        user: owner?.id,
      },
    });
    skills.push(skill);
    console.log(`  ✓  Created skill: ${s.title}`);
  }

  console.log('\n━━━ 5 / 7  Service Requests ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const serviceRequests = [];
  for (const sr of SERVICE_REQUESTS_SEED) {
    const skill = skills[sr.skillIdx];
    const requester = users[sr.requesterIdx];
    const skillOwner = users[SKILLS_SEED[sr.skillIdx].ownerIdx];

    // Check idempotency by skill + requester + requestDetails prefix
    const detailsPrefix = sr.requestDetails.slice(0, 60);
    const existing = await strapi.db.query('api::service-request.service-request').findMany({
      where: { skill: skill?.id, requester: requester?.id },
    });
    if (existing.length > 0) {
      const match = existing.find(e => (e.requestDetails || '').startsWith(detailsPrefix.trim()));
      if (match) {
        console.log(`  ↩  Service request exists for skill: ${SKILLS_SEED[sr.skillIdx].title}`);
        serviceRequests.push(match);
        continue;
      }
    }

    const request = await strapi.db.query('api::service-request.service-request').create({
      data: {
        requestDetails: sr.requestDetails,
        requestedTime: sr.requestedTime,
        duration: sr.duration,
        serviceMode: sr.serviceMode,
        serviceLocation: sr.serviceLocation,
        status: sr.status,
        respondedAt: sr.respondedAt,
        responseNote: sr.responseNote,
        skill: skill?.id,
        requester: requester?.id,
        provider: skillOwner?.id,
      },
    });
    serviceRequests.push(request);
    console.log(`  ✓  Created service request: ${SKILLS_SEED[sr.skillIdx].title} ← ${USERS[sr.requesterIdx].username} [${sr.status}]`);
  }

  console.log('\n━━━ 6 / 7  Reviews ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const r of REVIEWS_SEED) {
    const skill = skills[r.skillIdx];
    const reviewer = users[r.reviewerIdx];
    const skillOwner = users[SKILLS_SEED[r.skillIdx].ownerIdx];

    const existing = await strapi.db.query('api::review.review').findMany({
      where: { skill: skill?.id, reviewer: reviewer?.id },
    });
    if (existing.length > 0) {
      console.log(`  ↩  Review exists: ${USERS[r.reviewerIdx].username} → ${SKILLS_SEED[r.skillIdx].title}`);
      continue;
    }

    const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * r.daysAgo).toISOString();
    await strapi.db.query('api::review.review').create({
      data: {
        rating: r.rating,
        comment: r.comment,
        reviewer: reviewer?.id,
        reviewee: skillOwner?.id,
        skill: skill?.id,
      },
    });
    console.log(`  ✓  Created review: ${USERS[r.reviewerIdx].username} → ${SKILLS_SEED[r.skillIdx].title} (${r.rating}★)`);
  }

  console.log('\n━━━ 7 / 7  Chats, Participants & Messages ━━━━━━━━━━━━━━━━');
  for (const chatSeed of CHATS_SEED) {
    const participants = chatSeed.participantIdxs.map(i => users[i]);
    const names = participants.map(p => p.username).join(' ↔ ');

    // Idempotency: skip if a chat with the same two participants exists
    const existingChats = await strapi.db.query('api::chat.chat').findMany({
      populate: ['participants'],
    });
    const alreadyExists = existingChats.some((c) => {
      const ids = (c.participants || []).map(p => p.id).sort();
      const wantIds = participants.map(p => p.id).sort();
      return ids.length === wantIds.length && ids.every((id, i) => id === wantIds[i]);
    });

    if (alreadyExists) {
      console.log(`  ↩  Chat exists: ${names}`);
      continue;
    }

    const chat = await strapi.db.query('api::chat.chat').create({
      data: { title: names },
    });

    for (const p of participants) {
      await strapi.db.query('api::chat-participant.chat-participant').create({
        data: { user: p.id, chat: chat.id, role: 'member' },
      });
    }

    for (const msg of chatSeed.messages) {
      const sender = users[msg.senderIdx];
      await strapi.db.query('api::message.message').create({
        data: { content: msg.content, sender: sender.id, chat: chat.id },
      });
    }

    console.log(`  ✓  Created chat [${chatSeed.messages.length} messages]: ${names}`);
  }

  // Reports
  console.log('\n━━━  Reports ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const rep of REPORTS_SEED) {
    const reporter = users[rep.reporterIdx];
    const reportedUser = users[rep.reportedUserIdx];

    const existing = await strapi.db.query('api::report.report').findMany({
      where: { reporter: reporter?.id, reportedUser: reportedUser?.id, reason: rep.reason },
    });
    if (existing.length > 0) {
      console.log(`  ↩  Report exists: ${USERS[rep.reporterIdx].username} → ${USERS[rep.reportedUserIdx].username}`);
      continue;
    }

    await strapi.db.query('api::report.report').create({
      data: {
        reason: rep.reason,
        description: rep.description,
        status: rep.status,
        reporter: reporter?.id,
        reportedUser: reportedUser?.id,
      },
    });
    console.log(`  ✓  Created report: ${USERS[rep.reporterIdx].username} → ${USERS[rep.reportedUserIdx].username} [${rep.status}]`);
  }

  console.log('\n✅  Seed complete!\n');
}

// ---------------------------------------------------------------------------
// Bootstrap and run
// ---------------------------------------------------------------------------

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  strapi = app;
  app.log.level = 'error';

  console.log('\n🌱  Starting XchangeSkills realistic data seed…');
  await seedAll();

  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err);
  process.exit(1);
});
