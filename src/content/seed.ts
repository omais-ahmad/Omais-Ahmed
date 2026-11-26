import type { SiteContent } from './types'

/**
 * Bundled content. Every statement here comes from Omais Ahmed's resume or from the
 * previous version of this portfolio. It is what the site renders when no database is
 * configured, what the prerender step bakes into the static HTML, and what the admin
 * dashboard imports into an empty database.
 *
 * Paths starting with "img/" or "cv/" are relative to the site base and resolved by assetUrl().
 */
export const seed: SiteContent = {
  profile: {
    name: 'Omais Ahmed',
    title: 'Full-Stack Software Engineer',
    location: 'Islamabad, Pakistan',
    email: 'webdeveloperomais@gmail.com',
    phone: '+92 339 510 1414',
    showPhone: true,
    whatsapp: '+92 339 510 1414',
    experienceLabel: '3+ years',
    availability: 'Open to full-stack, frontend and software engineering roles',
    photo: 'img/profile.webp',
    cvUrl: 'cv/Omais-Ahmed-Resume.pdf',
  },

  hero: {
    status: 'Open to new opportunities',
    roles: ['Full-Stack Software Engineer', 'Angular Developer', 'MEAN Stack Developer', 'MERN Stack Developer'],
    coreStack: ['Angular', 'React.js', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB'],
    eyebrow: 'Full-Stack Software Engineer · Angular & MERN',
    headline: 'Building scalable software. Engineering better digital experiences.',
    subheadline:
      'Full-Stack Software Engineer with 3+ years of experience, specializing in Angular, React, Node.js, enterprise application architecture, and distributed systems.',
    specializations: [
      'Frontend architecture',
      'Reusable component libraries',
      'REST APIs · Node.js',
      'Event-driven & real-time systems',
    ],
    facts: [
      {
        value: '3+',
        label: 'Years of professional experience',
        detail: 'Full-stack web and cross-platform mobile development since 2023',
      },
      {
        value: '4',
        label: 'Web portals on one component library',
        detail: 'A private Angular package published through Azure Artifacts',
      },
      {
        value: '5',
        label: 'Countries served',
        detail: 'Saudi Arabia, Malaysia, Sweden, Kenya and Pakistan',
      },
      {
        value: '5',
        label: 'Business domains',
        detail: 'FinTech, Healthcare, Tourism, E-Commerce and SaaS',
      },
    ],
    diagramTitle: 'System map: what I build, layer by layer',
    diagram: {
      caption: 'A composite of patterns from different projects, not a single production system.',
      lanes: [
        {
          label: 'Interfaces',
          nodes: [
            {
              id: 'web',
              label: 'Web portals',
              detail: 'Angular · TypeScript',
              note: 'Large Angular applications built from feature modules and a shared component library, as in the Sukna Financial Platform and HexCore.',
            },
            {
              id: 'spa',
              label: 'Web apps',
              detail: 'React.js',
              note: 'React clients for member-facing and administrative functions, as in the MITA tourism platform.',
            },
            {
              id: 'mobile',
              label: 'Mobile & PWA',
              detail: 'Ionic · Angular',
              note: 'One configurable codebase delivered to Android, iOS and the web, as in PubQ.',
            },
          ],
        },
        {
          label: 'Services',
          nodes: [
            {
              id: 'api',
              label: 'REST APIs',
              detail: 'Node.js · Express · JWT · RBAC',
              note: 'Modular, API-first services with JWT authentication and role-based access control in middleware.',
            },
            {
              id: 'workers',
              label: 'Background workers',
              detail: 'Async jobs · notifications',
              note: 'Consumers that process queued events outside the request cycle.',
            },
            {
              id: 'realtime',
              label: 'Real-time gateway',
              detail: 'SignalR · Socket.IO',
              note: 'Live notifications and status updates pushed to connected clients.',
            },
          ],
        },
        {
          label: 'Infrastructure',
          nodes: [
            {
              id: 'db',
              label: 'Databases',
              detail: 'MongoDB · PostgreSQL · MySQL',
              note: 'Document and relational stores, with attention to schema design and query performance.',
            },
            {
              id: 'cache',
              label: 'Redis',
              detail: 'Cache · sessions',
              note: 'Caching to reduce database load and API response times.',
            },
            {
              id: 'queue',
              label: 'RabbitMQ',
              detail: 'Events · queues',
              note: 'Asynchronous event processing and background job execution.',
            },
          ],
        },
      ],
      links: [
        { from: 'web', to: 'api' },
        { from: 'spa', to: 'api' },
        { from: 'mobile', to: 'api' },
        { from: 'api', to: 'db' },
        { from: 'api', to: 'cache' },
        { from: 'api', to: 'queue' },
        { from: 'queue', to: 'workers' },
        { from: 'workers', to: 'realtime' },
        { from: 'realtime', to: 'spa', dashed: true },
        { from: 'realtime', to: 'web', dashed: true },
      ],
    },
  },

  about: {
    heading: 'An engineer who works on how the system is put together, not only how it looks.',
    paragraphs: [
      'I am a full-stack software engineer based in Islamabad with 3+ years of professional experience building web and mobile applications across FinTech, healthcare, tourism, e-commerce and SaaS. Most of my work sits where product requirements meet system structure: how an application is divided into modules, what is shared between teams, and how the parts communicate.',
      'On the frontend I work mainly in Angular and React. At CyberSoft Vantage I work directly with Sukna Capital, a Saudi FinTech company, leading frontend development of its lending and investment platform. There I designed a feature-based modular architecture and built a private Angular component library, published through Azure Artifacts, that its four web portals share as their design system, together with a configuration-driven form engine that keeps new screens from becoming new code.',
      'On the backend I build REST APIs with Node.js and Express, secured with JWT authentication and role-based access control. I have used RabbitMQ for asynchronous processing and background jobs, Redis for caching, and SignalR and Socket.IO for real-time updates, and I have shipped cross-platform mobile apps with Ionic for Android, iOS and the web.',
    ],
    principles: [
      {
        title: 'Structure before features',
        body: 'Feature modules, a shared core and clear boundaries, so an application can grow without being rewritten.',
      },
      {
        title: 'Build once, reuse everywhere',
        body: 'Component libraries and configuration-driven systems instead of copied screens and duplicated logic.',
      },
      {
        title: 'Decouple what can wait',
        body: 'Queues, background jobs and caching for work that should not block a request.',
      },
      {
        title: 'Ship with the team',
        body: 'Requirement analysis, technical planning, code reviews and production deployments alongside cross-functional and international teams.',
      },
    ],
  },

  seo: {
    title: 'Omais Ahmed | Full-Stack Software Engineer (Angular, React, Node.js)',
    description:
      'Full-Stack Software Engineer in Islamabad with 3+ years of experience building scalable enterprise applications with Angular, React, Node.js, RabbitMQ and Redis.',
    keywords: [
      'Omais Ahmed',
      'Full-Stack Software Engineer',
      'Angular Developer',
      'MERN Stack Developer',
      'MEAN Stack Developer',
      'React.js Developer',
      'Node.js Developer',
      'Software Engineer in Pakistan',
      'Enterprise Application Development',
      'Frontend Architecture',
      'Distributed Systems',
    ],
    ogImage: 'og-image.png',
  },

  settings: {
    sections: {
      about: true,
      experience: true,
      skills: true,
      projects: true,
      expertise: true,
      education: true,
      contact: true,
    },
    contactHeading: 'Let’s talk about your engineering team.',
    contactIntro:
      'I am open to full-stack, frontend and software engineering roles, including remote positions with international teams. Send a message and I will reply by email.',
    footerNote: 'Built with React, TypeScript and Vite.',
  },

  experience: [
    {
      id: 'exp-cybersoft-vantage',
      published: true,
      company: 'CyberSoft Vantage (CSV)',
      role: 'MEAN Stack Developer',
      location: 'Islamabad, Pakistan',
      start: '2026-01',
      end: '',
      summary:
        'Working directly with Sukna Capital, a Saudi FinTech company, and leading frontend development of its Angular web platform: four portals covering loan operations, borrowers, investor operations and investors.',
      highlights: [
        'Led the frontend development of the Sukna Capital web platform using Angular, delivering maintainable, high-performance solutions across four business portals.',
        'Delivered the portals in two pairs: an operations back office for loan management with a borrower portal, and an operations back office for investor management with an investor portal.',
        'Implemented the onboarding, KYC, guarantor form and subscription workflows, and the funds management modules including fund allocation and the fund book.',
        'Designed a feature-based modular architecture with shared and core modules, lazy loading, route guards, resolvers, HTTP interceptors, services and reusable utilities.',
        'Architected a private Angular component library, published as an NPM package through Azure Artifacts, that serves as the centralized design system for four independent web portals.',
        'Built reusable UI components including tables, forms, buttons, inputs, modals, tabs, pagination, tooltips, cards and loaders.',
        'Developed configuration-driven dynamic forms supporting multiple field types, validation rules, read-only states, conditional rendering and modal-based workflows.',
        'Integrated SignalR for live data synchronization and instant notifications across financial management workflows.',
        'Integrated secure REST APIs with backend teams, including authentication flows, data handling and error management.',
        'Optimized performance through lazy loading, code splitting, OnPush change detection and bundle optimization.',
        'Took part in solution design, technical planning, code reviews and production deployments, contributing to frontend architecture decisions.',
        'Applied SOLID principles, Clean Architecture concepts and component-driven development.',
      ],
      stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'SignalR', 'Azure Artifacts', 'REST APIs'],
    },
    {
      id: 'exp-syslab',
      published: true,
      company: 'Syslab Technologies Sdn Bhd',
      role: 'MERN Stack Developer',
      location: 'Islamabad, Pakistan',
      start: '2025-09',
      end: '2026-01',
      summary:
        'Full-stack development of SaaS, healthcare, tourism and business management platforms with React.js, Node.js, Express.js and MongoDB.',
      highlights: [
        'Engineered full-stack web applications using React.js, Node.js, Express.js and MongoDB for SaaS, healthcare, tourism and business management platforms.',
        'Designed modular REST APIs and integrated third-party services, payment gateways and external business systems.',
        'Implemented JWT authentication, role-based access control (RBAC), middleware and protected routes.',
        'Built responsive, cross-browser compatible and accessible interfaces from reusable components.',
        'Developed event-driven backend services with RabbitMQ for asynchronous processing, background jobs and notifications.',
        'Optimized performance with Redis caching, efficient database querying and API response optimization.',
        'Collaborated with cross-functional and international teams through requirement analysis, solution design, code reviews, sprint planning and production deployments.',
        'Applied Clean Code principles, modular design patterns and API-first development.',
      ],
      stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'RabbitMQ', 'Redis', 'JWT · RBAC'],
    },
    {
      id: 'exp-softosol',
      published: true,
      company: 'SoftoSol Pvt Ltd',
      role: 'Full Stack Developer',
      location: 'Islamabad, Pakistan',
      start: '2023-03',
      end: '2025-09',
      summary:
        'Web and cross-platform mobile applications for healthcare, FinTech and e-commerce clients using Angular, React, Ionic, Node.js and Express.js.',
      highlights: [
        'Developed and maintained web and cross-platform mobile applications for Healthcare, FinTech and E-Commerce domains using Angular, React, Ionic, Node.js and Express.js.',
        'Engineered responsive Angular and Ionic applications with a reusable component architecture and API integration across web, Android and iOS.',
        'Worked with project managers, UI/UX designers, QA engineers, backend developers and business stakeholders to turn functional requirements into technical solutions.',
        'Contributed to application architecture, system design discussions, technology evaluations and technical decision-making.',
        'Took part in the full development lifecycle: requirement analysis, development, code reviews, testing, debugging, CI/CD deployments, production support and performance optimization.',
      ],
      stack: ['Angular', 'Ionic', 'React', 'Node.js', 'Express.js', 'TypeScript'],
    },
  ],

  projects: [
    {
      id: 'proj-sukna',
      published: true,
      slug: 'sukna-financial-platform',
      name: 'Sukna Financial Platform',
      category: 'FinTech',
      group: 'case-study',
      featured: true,
      tagline:
        'Lending and investment platform for Sukna Capital, a Saudi FinTech company: two operations back offices, a borrower portal and an investor portal, built as four Angular portals on one shared component library.',
      description:
        'Sukna Capital is a Saudi FinTech company. Through CyberSoft Vantage I worked directly with its team on the web platform, which is made of four portals in two pairs: an operations back office for loan management with a borrower portal, and an operations back office for investor management with an investor portal. I architected and developed the Angular frontend: a feature-based modular application structure, a private component library that all four portals consume, and a configuration-driven form system that lets new business workflows be assembled rather than rebuilt. On that foundation I implemented the onboarding, KYC, guarantor form and subscription workflows, and the funds management modules for fund allocation and the fund book.',
      role: 'Frontend lead: application architecture, component library and feature development',
      technologies: ['Angular', 'TypeScript', 'Azure Artifacts', 'SignalR', 'Angular i18n', 'REST APIs'],
      responsibilities: [
        'Architected the Angular application around feature modules with shared and core layers.',
        'Designed, built and published the private Angular NPM component library on Azure Artifacts.',
        'Developed the configuration-driven dynamic form system used across business workflows.',
        'Implemented SignalR-based real-time notifications and status updates.',
        'Built the API service layer with HTTP interceptors, route resolvers, guards and centralized error handling.',
        'Implemented the onboarding and KYC workflows and the guarantor forms.',
        'Implemented the subscription workflows.',
        'Built the funds management modules, including fund allocation and the fund book.',
        'Delivered reporting dashboards, workflow automation modules and administrative portals.',
      ],
      features: [
        'Four portals: loan operations back office, borrower portal, investor operations back office and investor portal',
        'Onboarding, KYC, guarantor form and subscription workflows',
        'Funds management: fund allocation and the fund book',
        'Feature-based modular architecture with lazy-loaded routes',
        'Private component library shared across the four portals',
        'Centralized design system: tables, forms, buttons, tabs, modals, tooltips, pagination, cards',
        'Dynamic forms with validations, conditional rendering, read-only states and modal workflows',
        'Live notifications and synchronized workflow status over SignalR',
        'Multi-language support with Angular i18n, translation services and custom pipes',
        'Reporting dashboards, workflow automation and administrative portals',
        'Lazy loading, code splitting and Angular performance best practices',
      ],
      architectureSummary:
        'The platform has a lending side and an investment side, each with an operations back office and a customer-facing portal. Each portal is an Angular application organized into feature modules on top of a shared core (guards, resolvers, interceptors, services). User interface building blocks do not live in any single portal: they are versioned in a private NPM package, published to an Azure Artifacts feed, and consumed by all four portals so that a fix or a new component reaches every portal through a version bump.',
      diagram: {
        caption: 'Conceptual view of the frontend structure. Internal details are intentionally omitted.',
        lanes: [
          {
            label: 'Design system',
            nodes: [
              {
                id: 'lib',
                label: 'Component library',
                detail: 'Private NPM · Azure Artifacts',
                note: 'Tables, forms, buttons, tabs, modals, tooltips, pagination and cards, versioned and published as one private package.',
              },
              {
                id: 'forms',
                label: 'Dynamic form engine',
                detail: 'Configuration-driven',
                note: 'Forms are described as configuration: field types, validation rules, read-only states and conditional rendering.',
              },
            ],
          },
          {
            label: 'Angular portals',
            nodes: [
              {
                id: 'lending',
                label: 'Lending portals',
                detail: 'Loan operations · Borrowers',
                note: 'The operations back office for loan management and the borrower portal.',
              },
              {
                id: 'investment',
                label: 'Investment portals',
                detail: 'Investor operations · Investors',
                note: 'The operations back office for investor management and the investor portal.',
              },
              {
                id: 'core',
                label: 'Core layer',
                detail: 'Guards · resolvers · interceptors',
                note: 'Authentication flow, data pre-loading, HTTP concerns and centralized error handling live in one place.',
              },
            ],
          },
          {
            label: 'Platform services',
            nodes: [
              {
                id: 'api',
                label: 'REST APIs',
                detail: 'Service layer integration',
                note: 'Typed services with shared interfaces sit between components and the backend APIs.',
              },
              {
                id: 'signalr',
                label: 'SignalR hub',
                detail: 'Real-time updates',
                note: 'Live notifications, instant status updates and synchronized workflows across modules.',
              },
            ],
          },
        ],
        links: [
          { from: 'lib', to: 'lending' },
          { from: 'lib', to: 'investment' },
          { from: 'forms', to: 'lending' },
          { from: 'forms', to: 'investment' },
          { from: 'lending', to: 'core' },
          { from: 'investment', to: 'core' },
          { from: 'core', to: 'api' },
          { from: 'signalr', to: 'core', dashed: true },
        ],
      },
      challenges: [
        {
          challenge:
            'Four independent web portals needed the same look, behaviour and quality without four copies of every component.',
          solution:
            'Extracted the UI into a private Angular component library, published as an NPM package through Azure Artifacts, and made it the centralized design system for all four portals.',
        },
        {
          challenge:
            'Financial workflows involve many forms that differ in fields, rules and states, which normally means a large amount of repeated form code.',
          solution:
            'Built configuration-driven dynamic forms supporting text inputs, checkboxes, radio buttons, dropdowns, read-only fields, validations, conditional rendering and modal-based workflows.',
        },
        {
          challenge: 'Users needed to see status changes and notifications as they happened, across multiple modules.',
          solution:
            'Integrated SignalR for live notifications, instant status updates and synchronized business workflows.',
        },
        {
          challenge: 'A large application has to stay fast as features are added.',
          solution:
            'Applied lazy loading, code splitting, OnPush change detection and bundle optimization within a modular architecture.',
        },
      ],
      images: [],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'Sukna Capital Financial Platform: Angular architecture for a Saudi FinTech',
      seoDescription:
        'Case study: the Angular frontend of Sukna Capital’s lending and investment platform. Four portals on one private component library, with KYC, onboarding and fund management workflows.',
    },
    {
      id: 'proj-mita',
      published: true,
      slug: 'mita-tourism-platform',
      name: 'MITA – Malaysian Inbound Tourism Authority',
      category: 'Tourism',
      group: 'case-study',
      featured: true,
      tagline:
        'Full-stack tourism management platform for membership, events and operations, with queued background processing, caching and real-time updates.',
      description:
        'A comprehensive tourism management platform developed for MITA, a Malaysian tourism body that represents more than 3,000 members across the inbound and domestic tourism sector and is one of the associations recognized by the Ministry of Tourism (MOTAC) for travel agent licence renewal. The platform supports membership management, event administration, organizational operations and member-facing services. I worked across the stack: React.js on the client, a modular Node.js and Express REST API, MongoDB for data, RabbitMQ for asynchronous work, Redis for caching and Socket.IO for real-time communication.',
      role: 'Full-stack developer: API design, backend services and React features',
      technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'RabbitMQ', 'Redis', 'Socket.IO', 'JWT'],
      responsibilities: [
        'Engineered full-stack features with React.js, Node.js, Express.js and MongoDB.',
        'Designed and developed secure REST APIs following a modular, API-first structure.',
        'Implemented JWT authentication, role-based access control, middleware and protected routes.',
        'Built member management, event registration, content management, notification and administration modules.',
        'Integrated the payment gateway: a sandbox setup for development and Fiuu in production.',
        'Introduced RabbitMQ for asynchronous event processing and Redis for caching.',
      ],
      features: [
        'Membership management and member-facing services',
        'Event registration and event administration',
        'Content management and notifications',
        'JWT authentication with role-based access control',
        'Fiuu payment gateway in production, sandbox payments in development',
        'Real-time notifications and live status updates with Socket.IO',
        'Asynchronous processing and background jobs with RabbitMQ',
        'Redis caching to reduce database load and response times',
        'Automation of manual operational workflows',
      ],
      architectureSummary:
        'React clients talk to a modular Express API guarded by JWT and RBAC middleware. Work that does not need to block a request is published to RabbitMQ and handled by background workers. Redis caches frequent reads and supports session management, MongoDB is the system of record, and a Socket.IO gateway pushes notifications and status changes back to connected clients.',
      diagram: {
        caption: 'Conceptual view of the request, messaging and real-time paths.',
        lanes: [
          {
            label: 'Clients',
            nodes: [
              {
                id: 'member',
                label: 'Member portal',
                detail: 'React.js',
                note: 'Member-facing services: membership, event registration and payments.',
              },
              {
                id: 'admin',
                label: 'Admin console',
                detail: 'React.js · RBAC',
                note: 'Administration of members, events and content, restricted by role.',
              },
            ],
          },
          {
            label: 'API',
            nodes: [
              {
                id: 'api',
                label: 'REST API',
                detail: 'Express · JWT · RBAC',
                note: 'Modular REST API. Middleware authenticates the token and checks the role before a route runs.',
              },
              {
                id: 'socket',
                label: 'Socket.IO gateway',
                detail: 'WebSockets',
                note: 'Instant notifications, live status updates and event-driven synchronization across clients.',
              },
            ],
          },
          {
            label: 'Async',
            nodes: [
              {
                id: 'queue',
                label: 'RabbitMQ',
                detail: 'Events · jobs',
                note: 'Asynchronous event processing and background job execution for business-critical workflows.',
              },
              {
                id: 'workers',
                label: 'Workers',
                detail: 'Background processing',
                note: 'Consumers handle notifications and decoupled business workflows outside the request cycle.',
              },
            ],
          },
          {
            label: 'Data & integrations',
            nodes: [
              { id: 'mongo', label: 'MongoDB', detail: 'System of record', note: 'Primary data store for members, events and content.' },
              {
                id: 'redis',
                label: 'Redis',
                detail: 'Cache · sessions',
                note: 'Caching to optimize API performance, reduce database load and improve session management.',
              },
              {
                id: 'fiuu',
                label: 'Fiuu',
                detail: 'Payment gateway',
                note: 'Production payment gateway. Development uses a sandbox payment setup for testing and validation.',
              },
            ],
          },
        ],
        links: [
          { from: 'member', to: 'api' },
          { from: 'admin', to: 'api' },
          { from: 'api', to: 'queue' },
          { from: 'queue', to: 'workers' },
          { from: 'workers', to: 'mongo' },
          { from: 'queue', to: 'redis' },
          { from: 'workers', to: 'fiuu' },
          { from: 'socket', to: 'member', dashed: true },
          { from: 'socket', to: 'admin', dashed: true },
        ],
      },
      challenges: [
        {
          challenge:
            'Business-critical workflows such as notifications and post-registration processing should not slow down or fail the user request that triggers them.',
          solution:
            'Moved that work behind RabbitMQ: the API publishes an event and background consumers process it asynchronously.',
        },
        {
          challenge: 'Frequently requested data put repeated load on the database under high user traffic.',
          solution:
            'Added Redis caching to optimize API performance, reduce database load and improve session management.',
        },
        {
          challenge: 'Administrative and member-facing functions needed clearly separated access.',
          solution:
            'Implemented JWT-based authentication with role-based access control enforced by middleware and protected routes.',
        },
        {
          challenge: 'Payments had to be testable in development and reliable in production.',
          solution:
            'Integrated a sandbox payment setup for development and validation, and the Fiuu payment gateway for production transactions.',
        },
      ],
      images: [],
      liveUrl: 'https://mita.com.my',
      repoUrl: '',
      seoTitle: 'MITA tourism platform: MERN stack with RabbitMQ, Redis and Socket.IO',
      seoDescription:
        'Case study: a full-stack tourism management platform for the Malaysian Inbound Tourism Authority built with React.js, Node.js, Express.js, MongoDB, RabbitMQ, Redis and Socket.IO.',
    },
    {
      id: 'proj-pubq',
      published: true,
      slug: 'pubq-digital-ordering',
      name: 'PubQ',
      category: 'Hospitality',
      group: 'case-study',
      featured: true,
      tagline:
        'Digital ordering and payment platform for restaurants: one configurable Ionic and Angular codebase that becomes a branded app for every branch.',
      description:
        'PubQ is a digital ordering and payment platform for restaurants and hospitality businesses. I developed the cross-platform mobile application with Ionic and Angular. Instead of building an app per restaurant, the application is driven by configuration: each branch defines its menu, branding and behaviour, and the same codebase renders a customized ordering experience for Android, iOS and the web.',
      role: 'Mobile and frontend developer: application architecture, theming and payments',
      technologies: ['Ionic', 'Angular', 'TypeScript', 'PWA', 'Reepay', 'Clearhaus', 'REST APIs'],
      responsibilities: [
        'Developed the cross-platform mobile application with Ionic and Angular.',
        'Architected the dynamic menu management system.',
        'Implemented the dynamic theming engine for per-branch branding.',
        'Built the configuration-driven architecture that generates interfaces, navigation and business logic per branch.',
        'Integrated the Reepay and Clearhaus payment gateways.',
        'Designed reusable Angular and Ionic components and modular services.',
      ],
      features: [
        'One configurable application for many restaurants and branches',
        'Dynamic menus: categories, items, pricing, availability, images and content',
        'Dynamic theming: colours, logos, typography, banners and UI styling per branch',
        'Configurable navigation flows and business logic',
        'Secure checkout with Reepay and Clearhaus',
        'Android, iOS and Progressive Web App targets',
        'Reusable Ionic and Angular component set',
      ],
      architectureSummary:
        'Branch-specific configuration is the input. At runtime the application shell reads it and resolves three things: the menu (what can be ordered), the theme (how the app looks) and the flow (how the customer moves through it). The same build is then delivered as native Android and iOS apps and as a PWA, with payments handled through Reepay and Clearhaus.',
      diagram: {
        caption: 'Conceptual view of the configuration-driven application.',
        lanes: [
          {
            label: 'Per-branch configuration',
            nodes: [
              {
                id: 'config',
                label: 'Branch settings',
                detail: 'Menu · brand · behaviour',
                note: 'Each restaurant branch configures categories, items, pricing, availability and branding without an app update.',
              },
            ],
          },
          {
            label: 'Shared codebase',
            nodes: [
              {
                id: 'menu',
                label: 'Dynamic menu',
                detail: 'Categories · items · pricing',
                note: 'The menu is rendered from configuration, so content changes need no release.',
              },
              {
                id: 'theme',
                label: 'Theming engine',
                detail: 'Colours · logos · typography',
                note: 'Branding is applied at runtime to give every branch its own look from one codebase.',
              },
              {
                id: 'flow',
                label: 'Navigation & logic',
                detail: 'Configurable flows',
                note: 'Branch settings generate the interface, navigation flow and business rules.',
              },
            ],
          },
          {
            label: 'Delivery',
            nodes: [
              { id: 'native', label: 'Android · iOS', detail: 'Ionic', note: 'Native builds from the shared Ionic and Angular codebase.' },
              { id: 'pwa', label: 'PWA', detail: 'Web', note: 'The same application delivered as a Progressive Web App.' },
              {
                id: 'pay',
                label: 'Payments',
                detail: 'Reepay · Clearhaus',
                note: 'Payment processing workflows, transaction validation and checkout.',
              },
            ],
          },
        ],
        links: [
          { from: 'config', to: 'menu' },
          { from: 'config', to: 'theme' },
          { from: 'config', to: 'flow' },
          { from: 'menu', to: 'native' },
          { from: 'theme', to: 'pwa' },
          { from: 'flow', to: 'pay' },
        ],
      },
      challenges: [
        {
          challenge:
            'Every restaurant wanted its own branded ordering app, but maintaining a separate application per client does not scale.',
          solution:
            'Built a configuration-driven architecture in which branch-specific settings generate the interface, navigation flow and business logic from a shared codebase.',
        },
        {
          challenge: 'Menus change constantly: items, prices, availability and images.',
          solution:
            'Architected a dynamic menu management system so each branch can update its menu without requiring an application update.',
        },
        {
          challenge: 'Brand identity differs for every business.',
          solution:
            'Implemented a dynamic theming engine covering colours, logos, typography, banners and UI styling.',
        },
        {
          challenge: 'Customers order from Android phones, iPhones and browsers.',
          solution:
            'Delivered one Ionic and Angular application optimized for Android, iOS and Progressive Web App environments.',
        },
      ],
      images: [],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'PubQ: configuration-driven Ionic and Angular ordering app',
      seoDescription:
        'Case study: a cross-platform digital ordering and payment app for restaurants built with Ionic and Angular, with dynamic menus, a theming engine and Reepay and Clearhaus payments.',
    },
    {
      id: 'proj-hexcore',
      published: true,
      slug: 'hexcore-healthcare-platform',
      name: 'HexCore Healthcare Platform',
      category: 'Healthcare',
      group: 'case-study',
      featured: false,
      tagline:
        'Healthcare management platform for hospitals and medical organizations in Kenya: patient, appointment and administration interfaces in Angular.',
      description:
        'HexCore is a healthcare management platform for hospitals and medical organizations in Kenya. I developed its Angular frontend for patient management, appointment scheduling and healthcare administration, with workflow-driven interfaces that follow how clinical and administrative staff actually work.',
      role: 'Frontend developer: Angular modules, API integration and performance',
      technologies: ['Angular', 'TypeScript', 'REST APIs'],
      responsibilities: [
        'Developed patient management, appointment scheduling and healthcare administration interfaces.',
        'Implemented workflow-driven screens for patient registration and the appointment lifecycle.',
        'Built medical records views and operational reporting dashboards.',
        'Integrated REST APIs between healthcare modules.',
        'Worked with cross-functional teams to turn business and clinical requirements into frontend solutions.',
      ],
      features: [
        'Patient registration and patient management',
        'Appointment scheduling and lifecycle management',
        'Medical records views',
        'Operational reporting dashboards',
        'Healthcare administration interfaces',
        'Responsive, accessible interfaces for clinical and administrative staff',
      ],
      architectureSummary:
        'The frontend is organized into Angular feature modules that mirror the clinical workflows (patients, appointments, records and reporting). A shared API layer handles communication with the REST services so the modules stay focused on their own workflow.',
      diagram: {
        caption: 'Conceptual view of the frontend modules.',
        lanes: [
          {
            label: 'Angular feature modules',
            nodes: [
              { id: 'patients', label: 'Patients', detail: 'Registration · management', note: 'Patient registration and management workflows.' },
              { id: 'appointments', label: 'Appointments', detail: 'Scheduling · lifecycle', note: 'Scheduling and appointment lifecycle management.' },
              { id: 'records', label: 'Records & reporting', detail: 'Views · dashboards', note: 'Medical records views and operational reporting dashboards.' },
            ],
          },
          {
            label: 'Shared layer',
            nodes: [
              { id: 'shared', label: 'API services', detail: 'Reusable components', note: 'Shared services and components used by every module.' },
            ],
          },
          {
            label: 'Backend',
            nodes: [{ id: 'rest', label: 'REST APIs', detail: 'Healthcare modules', note: 'Secure communication and data synchronization between healthcare modules.' }],
          },
        ],
        links: [
          { from: 'patients', to: 'shared' },
          { from: 'appointments', to: 'shared' },
          { from: 'records', to: 'shared' },
          { from: 'shared', to: 'rest' },
        ],
      },
      challenges: [
        {
          challenge: 'Clinical operations depend on multi-step processes such as registration and the appointment lifecycle.',
          solution:
            'Designed workflow-driven frontend solutions that follow those processes step by step, reducing manual effort for staff.',
        },
        {
          challenge: 'Healthcare modules must exchange data reliably.',
          solution: 'Integrated REST APIs for secure communication and dependable data synchronization between modules.',
        },
      ],
      images: [],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'HexCore Healthcare Platform: Angular healthcare management frontend',
      seoDescription:
        'Angular frontend for a healthcare management platform in Kenya: patient management, appointment scheduling, medical records views and reporting dashboards.',
    },
    {
      id: 'proj-sidmart',
      published: true,
      slug: 'sidmart-ecommerce-platform',
      name: 'Sidmart E-Commerce Platform',
      category: 'E-Commerce',
      group: 'case-study',
      featured: false,
      tagline: 'Enterprise e-commerce platform supporting online sales operations, with Angular storefront interfaces.',
      description:
        'Sidmart is an enterprise e-commerce platform supporting online sales operations. I developed its Angular-based e-commerce interfaces, covering the product catalog, shopping cart, checkout and order management.',
      role: 'Frontend developer',
      technologies: ['Angular'],
      responsibilities: [
        'Developed Angular-based e-commerce interfaces.',
        'Implemented product catalog, shopping cart, checkout and order management.',
        'Optimized application responsiveness and customer experience.',
      ],
      features: ['Product catalog', 'Shopping cart', 'Checkout workflows', 'Order management', 'Responsive user experience'],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'Sidmart E-Commerce Platform: Angular e-commerce interfaces',
      seoDescription:
        'Angular e-commerce interfaces for an enterprise platform: product catalog, shopping cart, checkout workflows and order management.',
    },
    {
      id: 'proj-osp',
      published: true,
      slug: 'osp-pakistan-corporate-platform',
      name: 'OSP Pakistan Corporate Platform',
      category: 'Corporate',
      group: 'case-study',
      featured: false,
      tagline: 'Corporate web platform for a cold storage and ice manufacturing facility: responsive, fast and mobile-friendly.',
      description:
        'A corporate web platform developed for OSP Pakistan’s organizational branding and digital presence. OSP Pakistan operates a cold storage and ice manufacturing facility, and the site presents its services and capabilities with a responsive layout and a contact path for enquiries.',
      role: 'Frontend developer',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'],
      responsibilities: [
        'Developed responsive web interfaces using modern frontend technologies.',
        'Improved user engagement through optimized design and performance.',
        'Delivered mobile-friendly experiences across multiple devices.',
      ],
      features: [
        'Responsive layout for all screen sizes',
        'Service and capability sections',
        'Scroll-based animations and transitions',
        'Contact form for enquiries',
        'Lightweight, performance-focused build',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [
        { src: 'img/projects/osp-3.webp', alt: 'OSP Pakistan cold storage landing section' },
        { src: 'img/projects/osp-1.webp', alt: 'OSP Pakistan home page' },
        { src: 'img/projects/osp-2.webp', alt: 'OSP Pakistan services section' },
        { src: 'img/projects/osp-4.webp', alt: 'OSP Pakistan content section' },
      ],
      liveUrl: 'https://ospp-coral.vercel.app',
      repoUrl: '',
      seoTitle: 'OSP Pakistan Corporate Platform: responsive corporate website',
      seoDescription:
        'Responsive corporate web platform for OSP Pakistan, a cold storage and ice manufacturing facility, built for performance and mobile devices.',
    },
    {
      id: 'proj-mydawa',
      published: true,
      slug: 'mydawa-health-ecommerce',
      name: 'myDawa Health E-Commerce',
      category: 'E-Commerce',
      group: 'earlier',
      featured: false,
      tagline: 'E-commerce storefront for healthcare and wellness products, built with Angular and Tailwind CSS.',
      description:
        'An e-commerce website for healthcare and wellness products for a telehealth company in Kenya. Built with Angular, Tailwind CSS and SCSS, it covers the product catalog with filtering and search, the shopping cart and checkout, account management with order history, and service flows such as booking a consultation.',
      role: 'Frontend developer',
      technologies: ['Angular', 'TypeScript', 'Tailwind CSS', 'SCSS', 'HTML5'],
      responsibilities: [],
      features: [
        'Product catalog with filtering and search',
        'Shopping cart and checkout',
        'Account management with order history',
        'Consultation booking flow',
        'Responsive, mobile-optimized layout',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [
        { src: 'img/projects/mydawa-1.webp', alt: 'myDawa storefront' },
        { src: 'img/projects/mydawa-2.webp', alt: 'myDawa product pages' },
        { src: 'img/projects/mydawa-3.webp', alt: 'myDawa consultation booking flow' },
        { src: 'img/projects/mydawa-4.webp', alt: 'myDawa shopping experience' },
      ],
      liveUrl: 'https://my-dawa-webapp-orcin.vercel.app/home',
      repoUrl: '',
      seoTitle: 'myDawa Health E-Commerce: Angular storefront',
      seoDescription: 'Angular and Tailwind CSS e-commerce storefront for healthcare and wellness products in Kenya.',
    },
    {
      id: 'proj-insurance',
      published: true,
      slug: 'insurance-analytics-dashboard',
      name: 'Insurance Analytics Dashboard',
      category: 'Healthcare',
      group: 'earlier',
      featured: false,
      tagline: 'Utilization and claims analytics dashboard for an insurance company in Kenya.',
      description:
        'A web application for an insurance company in Kenya. The interface presents utilization and claims data through summary cards, filters, trend charts and breakdowns by scheme, provider and benefit.',
      role: 'Frontend developer',
      technologies: [],
      responsibilities: [],
      features: [
        'Utilization and claims overview',
        'Filtering by provider, scheme and point of sale',
        'Trend charts and forecasts',
        'Summary, fraud and risk breakdowns',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [
        { src: 'img/projects/insurance-1.webp', alt: 'Insurance utilization and claims dashboard' },
        { src: 'img/projects/insurance-2.webp', alt: 'Insurance analytics view' },
        { src: 'img/projects/insurance-3.webp', alt: 'Insurance dashboard detail view' },
        { src: 'img/projects/insurance-4.webp', alt: 'Insurance dashboard widget' },
      ],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'Insurance Analytics Dashboard',
      seoDescription: 'Utilization and claims analytics dashboard built for an insurance company in Kenya.',
    },
    {
      id: 'proj-smart-balancer',
      published: true,
      slug: 'smart-balancer-finance-app',
      name: 'Smart Balancer',
      category: 'FinTech',
      group: 'earlier',
      featured: false,
      tagline: 'Personal finance and bookkeeping application for tracking income, expenses and balances.',
      description:
        'A personal project: a finance and bookkeeping application built with Angular for budgeting, expense tracking and financial reporting, with a dashboard of income, expenses and account balances.',
      role: 'Personal project',
      technologies: ['Angular', 'TypeScript', 'Chart.js', 'Tailwind CSS', 'Bootstrap'],
      responsibilities: [],
      features: [
        'Dashboard with income and expense summary',
        'Add, edit and categorize transactions',
        'Financial reports and balance charts',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [
        { src: 'img/projects/smart-balancer-1.webp', alt: 'Smart Balancer dashboard' },
        { src: 'img/projects/smart-balancer-2.webp', alt: 'Smart Balancer transactions' },
        { src: 'img/projects/smart-balancer-3.webp', alt: 'Smart Balancer reports' },
      ],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'Smart Balancer: Angular finance and bookkeeping app',
      seoDescription: 'Personal finance and bookkeeping application built with Angular, Chart.js and Tailwind CSS.',
    },
    {
      id: 'proj-webmantis',
      published: true,
      slug: 'webmantis-service-website',
      name: 'WebMantis',
      category: 'Corporate',
      group: 'earlier',
      featured: false,
      tagline: 'Responsive website for a multi-service digital and IT solutions provider.',
      description:
        'A responsive website for a service provider offering digital and IT solutions. Built with HTML5, CSS3, JavaScript and Bootstrap 5, it presents the company’s service portfolio in a structured layout with interactive service sections.',
      role: 'Frontend developer',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5'],
      responsibilities: [],
      features: [
        'Responsive layout on the Bootstrap grid',
        'Interactive service sections with scroll-triggered animations',
        'Semantic HTML structure',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [
        { src: 'img/projects/webmantis-1.webp', alt: 'WebMantis home page' },
        { src: 'img/projects/webmantis-2.webp', alt: 'WebMantis services section' },
        { src: 'img/projects/webmantis-3.webp', alt: 'WebMantis content section' },
      ],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'WebMantis: responsive service provider website',
      seoDescription: 'Responsive website for a digital and IT services provider built with HTML5, CSS3, JavaScript and Bootstrap 5.',
    },
    {
      id: 'proj-yai',
      published: true,
      slug: 'yai-psychiatry-assistant-app',
      name: 'YAI – AI Assistant App for Psychiatrists',
      category: 'Healthcare',
      group: 'earlier',
      featured: false,
      tagline: 'Cross-platform mobile app with a conversational AI assistant interface for psychiatrists, built with Angular and Ionic.',
      description:
        'A mobile application built with Angular and Ionic for psychiatrists and mental health professionals. It gives them a conversational assistant interface for asking questions, drafting clinical notes and reaching mental health resources, with light and dark themes and builds for Android and iOS.',
      role: 'Mobile frontend developer',
      technologies: ['Angular', 'Ionic', 'TypeScript'],
      responsibilities: [],
      features: [
        'Conversational chat interface for the AI assistant',
        'Light and dark mode',
        'Responsive layout with smooth transitions',
        'Android and iOS from one Ionic codebase',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [
        { src: 'img/projects/yai-3.webp', alt: 'YAI assistant chat screens on a phone' },
        { src: 'img/projects/yai-2.webp', alt: 'YAI conversation and navigation screens' },
      ],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'YAI: Angular and Ionic assistant app for psychiatrists',
      seoDescription: 'Cross-platform mobile app with a conversational AI assistant interface for psychiatrists, built with Angular and Ionic.',
    },
    {
      id: 'proj-softoteam',
      published: true,
      slug: 'softoteam-hrm-landing-page',
      name: 'SoftoTeam Landing Page',
      category: 'Corporate',
      group: 'earlier',
      featured: false,
      tagline: 'Responsive, SEO-focused landing page for an HR management product.',
      description:
        'A landing page for SoftoTeam, a human resource management application. Built with HTML, SCSS, Bootstrap and JavaScript, it introduces the product, presents its payroll, attendance, recruitment and performance features, and leads visitors to a demo request.',
      role: 'Frontend developer',
      technologies: ['HTML5', 'SCSS', 'Bootstrap', 'JavaScript'],
      responsibilities: [],
      features: [
        'Hero section with a clear call to action',
        'Overview of the HRM features',
        'Mobile-first, cross-browser layout',
        'SEO metadata and structured markup',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [
        { src: 'img/projects/softoteam-1.webp', alt: 'SoftoTeam landing page hero and feature sections' },
        { src: 'img/projects/softoteam-2.webp', alt: 'SoftoTeam landing page feature overview' },
      ],
      liveUrl: '',
      repoUrl: '',
      seoTitle: 'SoftoTeam Landing Page: responsive HRM product page',
      seoDescription: 'Responsive, SEO-focused landing page for the SoftoTeam HR management product, built with HTML, SCSS and Bootstrap.',
    },
    {
      id: 'proj-cr-review',
      published: true,
      slug: 'change-request-review-ui',
      name: 'Change Request Review UI',
      category: 'GitHub',
      group: 'github',
      featured: false,
      tagline: 'Angular approver interface for reviewing purchase agreement change requests, with permission-aware actions and a tested state model.',
      description:
        'A take-home exercise for a procurement platform. Starting from a provided Angular 15 scaffold and a mock API, I completed the screens an approver uses to find a change request, see exactly what it changes, follow its approval history, and approve or reject it. The work covered fixing two deliberately failing tests at their root cause, the list and detail state handling, and the test suite. As I noted in the repository, an AI assistant helped me expand the test cases.',
      role: 'Take-home exercise, completed individually',
      technologies: ['Angular 15', 'TypeScript', 'Reactive Forms', 'RxJS', 'Jest'],
      responsibilities: [],
      features: [
        'List with loading, loaded, empty and error states and a status filter',
        'Line-item diff showing added, removed, changed and unchanged rows with totals and delta',
        'Approval timeline in chronological order',
        'Approve and Reject offered only when both the request status and the user’s policies allow it',
        'Reject reason validation and protection against double submission',
        'Component tests with Jest and TestBed for filtering, permissions and action failures',
      ],
      architectureSummary:
        'Each screen owns its state. The list component keeps the loaded rows, the active status filter and a view state, and derives the visible rows without rewriting the loaded data. The detail component derives the diff and the timeline from the loaded change request and tracks the submit and error state of each action. Permission helpers and the diff calculation are plain functions, so they are tested without rendering a component.',
      diagram: {
        caption: 'Structure of the exercise as implemented in the repository.',
        lanes: [
          {
            label: 'Screens',
            nodes: [
              { id: 'list', label: 'CR list', detail: 'Filter · view states', note: 'Loads the change requests for the user’s organization and filters them by status.' },
              { id: 'detail', label: 'CR detail', detail: 'Diff · timeline · actions', note: 'Shows what the request changes, its history, and Approve or Reject when allowed.' },
            ],
          },
          {
            label: 'Rules',
            nodes: [
              { id: 'perms', label: 'Permissions', detail: 'Policy strings', note: 'Decides whether the current user may approve, from the request status and the user’s policies.' },
              { id: 'diff', label: 'Diff utility', detail: 'Line-item comparison', note: 'Classifies each line as added, removed, changed or unchanged.' },
            ],
          },
          {
            label: 'Data',
            nodes: [
              { id: 'api', label: 'Mock CR API', detail: 'Latency · failure switch', note: 'Provided mock service with fixtures, adjustable latency and a fail-next switch.' },
              { id: 'session', label: 'Session', detail: 'Current user', note: 'Holds the current user and their permission strings.' },
            ],
          },
        ],
        links: [
          { from: 'list', to: 'api' },
          { from: 'detail', to: 'perms' },
          { from: 'detail', to: 'diff' },
          { from: 'detail', to: 'api' },
          { from: 'perms', to: 'session' },
        ],
      },
      challenges: [
        {
          challenge: 'A changed line item was reported as unchanged, because the diff only compared unit prices.',
          solution: 'The comparison now includes quantity and description, so any real edit to a line is classified as changed.',
        },
        {
          challenge: 'A read-only viewer could approve, because the action only checked the request status.',
          solution:
            'Approve and Reject require both the pending status and an approval policy. The buttons are hidden when not allowed, and the action methods check again before calling the API.',
        },
        {
          challenge: 'Slow or failing responses could lead to double submissions or a status the server never confirmed.',
          solution:
            'A shared submitting flag blocks repeat clicks, a failure keeps the existing request and shows an error, and success replaces the view with the API response.',
        },
      ],
      images: [],
      liveUrl: '',
      repoUrl: 'https://github.com/omais-ahmad/cr-assessment-frontend-20260721',
      seoTitle: 'Change Request Review UI: Angular approval workflow',
      seoDescription:
        'Angular approver interface for purchase agreement change requests, with permission-aware actions, a line-item diff and Jest component tests.',
    },
    {
      id: 'proj-kyc-form',
      published: true,
      slug: 'kyc-legal-entity-form',
      name: 'KYC Legal Entity Form',
      category: 'GitHub',
      group: 'github',
      featured: false,
      tagline: 'Recursive Angular reactive form for registering legal entities, their controlling persons and nested child entities.',
      description:
        'A KYC and AML registration form built with Angular 21 and Angular Material. A legal entity has controlling persons and can own child entities, each with controlling persons and children of its own, to any depth. One standalone component renders an entity and uses itself for each child, while a form factory service builds the matching tree of form groups and arrays.',
      role: 'Personal project',
      technologies: ['Angular 21', 'TypeScript', 'Reactive Forms', 'Angular Material'],
      responsibilities: [],
      features: [
        'Legal entities nested to any depth',
        'Add and remove controlling persons and child entities at every level',
        'Validation for required fields, minimum lengths and ownership percentage between 0 and 100',
        'Form factory service that builds and pre-fills the recursive form tree',
        'Conversion of the form value back to a typed model, with dates normalized',
      ],
      architectureSummary:
        'The form structure lives in one place. The factory service creates the form group for an entity, including the form arrays for its controlling persons and child entities, and calls itself for each child. The entity component receives one form group as an input and renders itself again for each child group, so the template and the form tree always have the same shape.',
      diagram: {
        caption: 'Structure of the form as implemented in the repository.',
        lanes: [
          {
            label: 'Pages',
            nodes: [
              { id: 'home', label: 'Home', detail: 'Entry page' },
              { id: 'kyc', label: 'KYC form page', detail: 'Root form · submit', note: 'Creates the root form and handles submission.' },
            ],
          },
          {
            label: 'Component',
            nodes: [
              { id: 'entity', label: 'Legal entity form', detail: 'Recursive · standalone', note: 'Renders one entity and uses itself for every child entity.' },
            ],
          },
          {
            label: 'Form layer',
            nodes: [
              { id: 'factory', label: 'Form factory', detail: 'Groups · arrays', note: 'Builds the nested form groups and form arrays, and converts values back to the model.' },
              { id: 'model', label: 'Models', detail: 'Entity · person', note: 'Typed interfaces for legal entities and controlling persons.' },
            ],
          },
        ],
        links: [
          { from: 'home', to: 'kyc' },
          { from: 'kyc', to: 'entity' },
          { from: 'kyc', to: 'factory' },
          { from: 'entity', to: 'factory' },
          { from: 'factory', to: 'model' },
        ],
      },
      challenges: [],
      images: [],
      liveUrl: '',
      repoUrl: 'https://github.com/omais-ahmad/my-angular-app-vercel',
      seoTitle: 'KYC Legal Entity Form: recursive Angular reactive forms',
      seoDescription:
        'Recursive Angular reactive form for KYC registration of legal entities, controlling persons and nested child entities, built with Angular Material.',
    },
    {
      id: 'proj-tick-tock',
      published: true,
      slug: 'tick-tock-timesheets',
      name: 'Tick Tock Timesheets',
      category: 'GitHub',
      group: 'github',
      featured: false,
      tagline: 'Timesheet tracking interface built with React 19 and Tailwind CSS, with protected routes and weekly status tracking.',
      description:
        'A frontend assessment built in about six hours with React 19, Vite and Tailwind CSS, and deployed on Vercel. After signing in, a user sees their weekly timesheets with a status derived from the hours logged, opens a week to see its daily entries, and adds entries through a validated form. The assessment came without an API, so sign-in and timesheet data are mocked in the client.',
      role: 'Frontend assessment, completed individually',
      technologies: ['React 19', 'Vite', 'Tailwind CSS', 'React Router', 'React Hook Form'],
      responsibilities: [],
      features: [
        'Sign-in form with validation and error feedback',
        'Protected routes behind an authentication context',
        'Weekly timesheet table with completed, incomplete and missing statuses',
        'Week detail view with daily entries',
        'Add-entry modal for project, type of work, description and hours',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [
        { src: 'img/projects/tick-tock-1.webp', alt: 'Tick Tock weekly timesheets table with status badges' },
        { src: 'img/projects/tick-tock-3.webp', alt: 'Tick Tock week detail view with daily entries' },
        { src: 'img/projects/tick-tock-2.webp', alt: 'Tick Tock add entry form' },
        { src: 'img/projects/tick-tock-4.webp', alt: 'Tick Tock sign-in page' },
      ],
      liveUrl: 'https://tick-tock-app.vercel.app',
      repoUrl: 'https://github.com/omais-ahmad/tick-tock-app',
      seoTitle: 'Tick Tock Timesheets: React 19 and Tailwind CSS',
      seoDescription:
        'Timesheet tracking interface built with React 19, Vite and Tailwind CSS, with protected routes, weekly statuses and a validated entry form.',
    },
    {
      id: 'proj-event-management',
      published: true,
      slug: 'event-management-dashboard',
      name: 'Event Management Dashboard',
      category: 'GitHub',
      group: 'github',
      featured: false,
      tagline: 'React client for an events REST API, with JWT sign-in, image uploads, time zone handling and notifications.',
      description:
        'A frontend assessment built with React 19, Vite and Tailwind CSS. The client talks to an events REST API: users register and sign in, the JWT is attached to every request, and signed-in users create events with an image, browse and open them, delete them, and send notifications for an event. Event times are entered in a chosen time zone and shown in local time with Luxon.',
      role: 'Frontend assessment, completed individually',
      technologies: ['React 19', 'Vite', 'Tailwind CSS', 'React Router', 'Luxon'],
      responsibilities: [],
      features: [
        'Registration and sign-in against the API, with the JWT sent as a bearer token',
        'Routes that require authentication',
        'Create events with an image upload, then list, open and delete them',
        'Time zone aware event dates with Luxon',
        'Notification form and an in-app notification list',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [],
      liveUrl: '',
      repoUrl: 'https://github.com/omais-ahmad/Event-Management',
      seoTitle: 'Event Management Dashboard: React client for an events API',
      seoDescription: 'React 19 client for an events REST API with JWT sign-in, image uploads, time zone aware dates and notifications.',
    },
    {
      id: 'proj-task-manager',
      published: true,
      slug: 'php-mvc-task-manager',
      name: 'PHP MVC Task Manager',
      category: 'GitHub',
      group: 'github',
      featured: false,
      tagline: 'Task manager on a small hand-written MVC structure in plain PHP, with MySQL and drag-and-drop ordering.',
      description:
        'A task manager written in plain PHP without a framework. A front controller routes requests to a controller, a model wraps the database queries, and views render the pages. Tasks can be created, edited, given a status, deleted and reordered by dragging, and the new order is saved to MySQL.',
      role: 'Personal project',
      technologies: ['PHP', 'MySQL', 'PDO', 'jQuery UI'],
      responsibilities: [],
      features: [
        'Front controller with controller, model and view layers',
        'Create, edit, update status and delete tasks',
        'Drag-and-drop reordering saved through an AJAX request',
        'Prepared statements with PDO',
      ],
      architectureSummary: '',
      diagram: null,
      challenges: [],
      images: [],
      liveUrl: '',
      repoUrl: 'https://github.com/omais-ahmad/task_manager',
      seoTitle: 'PHP MVC Task Manager',
      seoDescription: 'Task manager built on a small hand-written MVC structure in plain PHP, with MySQL, PDO and drag-and-drop ordering.',
    },
  ],

  skillCategories: [
    {
      id: 'skills-frontend',
      published: true,
      name: 'Frontend Engineering',
      summary: 'Component-driven interfaces in Angular and React.',
      skills: [
        { name: 'Angular', level: 'core' },
        { name: 'React.js', level: 'core' },
        { name: 'TypeScript', level: 'core' },
        { name: 'JavaScript (ES6+)', level: 'core' },
        { name: 'HTML5', level: 'core' },
        { name: 'CSS3 · SCSS', level: 'core' },
        { name: 'Ionic Framework', level: 'core' },
        { name: 'Tailwind CSS', level: 'applied' },
        { name: 'Bootstrap', level: 'applied' },
        { name: 'Responsive Web Design', level: 'applied' },
        { name: 'Component-Driven Development', level: 'applied' },
        { name: 'Angular Material', level: 'familiar' },
        { name: 'Syncfusion', level: 'familiar' },
      ],
    },
    {
      id: 'skills-backend',
      published: true,
      name: 'Backend Engineering',
      summary: 'REST APIs and services on Node.js.',
      skills: [
        { name: 'Node.js', level: 'core' },
        { name: 'Express.js', level: 'core' },
        { name: 'RESTful API Development', level: 'core' },
        { name: 'API Integration', level: 'core' },
        { name: 'JWT Authentication', level: 'applied' },
        { name: 'Role-Based Access Control', level: 'applied' },
        { name: 'Middleware Design', level: 'applied' },
        { name: 'PHP', level: 'familiar' },
        { name: 'Laravel', level: 'familiar' },
        { name: 'CodeIgniter', level: 'familiar' },
        { name: 'WordPress', level: 'familiar' },
        { name: 'Java', level: 'familiar' },
        { name: 'NestJS', level: 'learning' },
        { name: 'ASP.NET Web API', level: 'learning' },
      ],
    },
    {
      id: 'skills-fullstack',
      published: true,
      name: 'Full-Stack Development',
      summary: 'End-to-end delivery on the MEAN and MERN stacks.',
      skills: [
        { name: 'MEAN Stack', level: 'core' },
        { name: 'MERN Stack', level: 'core' },
        { name: 'API-First Development', level: 'applied' },
        { name: 'Authentication & Authorization', level: 'applied' },
        { name: 'Business Workflow Development', level: 'applied' },
      ],
    },
    {
      id: 'skills-architecture',
      published: true,
      name: 'Architecture & System Design',
      summary: 'Structures that keep large applications maintainable.',
      skills: [
        { name: 'Frontend Architecture', level: 'core' },
        { name: 'Modular Architecture', level: 'core' },
        { name: 'Reusable Component Libraries', level: 'core' },
        { name: 'Design Systems', level: 'core' },
        { name: 'Clean Architecture Principles', level: 'applied' },
        { name: 'SOLID Principles', level: 'applied' },
        { name: 'Event-Driven Architecture', level: 'applied' },
        { name: 'Distributed Systems', level: 'applied' },
        { name: 'Microservices Concepts', level: 'familiar' },
      ],
    },
    {
      id: 'skills-realtime',
      published: true,
      name: 'Real-Time & Messaging',
      summary: 'Live updates and work that runs outside the request.',
      skills: [
        { name: 'SignalR', level: 'applied' },
        { name: 'Socket.IO · WebSockets', level: 'applied' },
        { name: 'RabbitMQ', level: 'applied' },
        { name: 'Asynchronous Processing', level: 'applied' },
        { name: 'Background Jobs', level: 'applied' },
      ],
    },
    {
      id: 'skills-data',
      published: true,
      name: 'Databases & Caching',
      summary: 'Document and relational stores, with caching in front.',
      skills: [
        { name: 'MongoDB', level: 'core' },
        { name: 'Redis', level: 'applied' },
        { name: 'PostgreSQL', level: 'applied' },
        { name: 'MySQL', level: 'applied' },
        { name: 'SQL', level: 'applied' },
        { name: 'Database Design', level: 'applied' },
        { name: 'Query Optimization', level: 'applied' },
      ],
    },
    {
      id: 'skills-mobile',
      published: true,
      name: 'Mobile Development',
      summary: 'One codebase for Android, iOS and the web.',
      skills: [
        { name: 'Ionic', level: 'core' },
        { name: 'Cross-Platform Mobile Applications', level: 'core' },
        { name: 'Progressive Web Applications', level: 'applied' },
      ],
    },
    {
      id: 'skills-devops',
      published: true,
      name: 'DevOps & Cloud',
      summary: 'Packaging, publishing and deployment.',
      skills: [
        { name: 'Azure Artifacts', level: 'applied' },
        { name: 'NPM Package Publishing', level: 'applied' },
        { name: 'Environment Configuration', level: 'applied' },
        { name: 'Docker · Containerization', level: 'familiar' },
        { name: 'CI/CD Fundamentals', level: 'familiar' },
        { name: 'Vercel Deployments', level: 'familiar' },
        { name: 'cPanel Deployments', level: 'familiar' },
      ],
    },
    {
      id: 'skills-practices',
      published: true,
      name: 'Engineering Practices',
      summary: 'How the work gets done with a team.',
      skills: [
        { name: 'Git & GitHub', level: 'core' },
        { name: 'Agile · Scrum', level: 'applied' },
        { name: 'Code Reviews', level: 'applied' },
        { name: 'Performance Optimization', level: 'applied' },
        { name: 'Debugging & Troubleshooting', level: 'applied' },
        { name: 'Requirement Analysis', level: 'applied' },
        { name: 'Technical Documentation', level: 'applied' },
        { name: 'Accessibility (WCAG)', level: 'applied' },
        { name: 'Cross-Browser Compatibility', level: 'applied' },
        { name: 'Unit Testing (Jest)', level: 'familiar' },
      ],
    },
  ],

  expertise: [
    {
      id: 'expertise-frontend-architecture',
      published: true,
      title: 'Frontend Architecture',
      summary:
        'Large Angular applications organized so that teams can add features without stepping on each other.',
      points: [
        'Feature-based modules on top of shared and core layers',
        'Lazy-loaded routes with guards and resolvers',
        'HTTP interceptors and centralized error handling',
        'Shared interfaces between components and services',
      ],
      flow: ['Feature modules', 'Shared & core layers', 'Lazy-loaded routes', 'Guards · resolvers · interceptors'],
      evidence: ['sukna-financial-platform', 'hexcore-healthcare-platform'],
    },
    {
      id: 'expertise-component-systems',
      published: true,
      title: 'Reusable Component Systems',
      summary: 'User interface built once, versioned as a package and consumed by every application that needs it.',
      points: [
        'Private Angular component library distributed through Azure Artifacts',
        'One design system shared across four independent web portals',
        'Configuration-driven dynamic forms',
        'Reusable Ionic and Angular components across restaurant deployments',
      ],
      flow: ['Component library', 'Versioned NPM package', 'Azure Artifacts feed', 'Four web portals'],
      evidence: ['sukna-financial-platform', 'pubq-digital-ordering'],
    },
    {
      id: 'expertise-full-stack',
      published: true,
      title: 'Full-Stack Engineering',
      summary: 'Features delivered end to end on the MEAN and MERN stacks, from interface to database.',
      points: [
        'React.js and Angular clients',
        'Node.js and Express.js services',
        'MongoDB, PostgreSQL and MySQL',
        'Third-party services and payment gateway integration',
      ],
      flow: ['React · Angular UI', 'REST API', 'Business logic', 'Database'],
      evidence: ['mita-tourism-platform'],
    },
    {
      id: 'expertise-rest-api',
      published: true,
      title: 'REST API Development',
      summary: 'Modular, API-first services with authentication and authorization built into the request path.',
      points: [
        'Modular route, controller and service structure',
        'JWT authentication',
        'Role-based access control through middleware',
        'Protected routes for administrative and member-facing functions',
      ],
      flow: ['Request', 'JWT middleware', 'RBAC check', 'Controller · service', 'Response'],
      evidence: ['mita-tourism-platform'],
    },
    {
      id: 'expertise-distributed-systems',
      published: true,
      title: 'Distributed Systems',
      summary: 'Applications split into parts that communicate through queues, caches and APIs.',
      points: [
        'RabbitMQ for asynchronous processing',
        'Redis caching to reduce database load',
        'Background workers for decoupled workflows',
        'REST integration between independent modules',
      ],
      flow: ['API', 'RabbitMQ', 'Workers', 'Redis · MongoDB'],
      evidence: ['mita-tourism-platform'],
    },
    {
      id: 'expertise-event-driven',
      published: true,
      title: 'Event-Driven Architecture',
      summary: 'Business events published once and handled by consumers that run independently of the request.',
      points: [
        'Asynchronous event processing',
        'Background job execution',
        'Notification systems',
        'Decoupled business workflows',
      ],
      flow: ['Business event', 'Queue', 'Consumer', 'Notification or side effect'],
      evidence: ['mita-tourism-platform'],
    },
    {
      id: 'expertise-real-time',
      published: true,
      title: 'Real-Time Communication',
      summary: 'Interfaces that reflect what is happening on the server without a refresh.',
      points: [
        'SignalR for live data synchronization and notifications',
        'Socket.IO and WebSockets for instant status updates',
        'Event-driven synchronization across connected clients',
      ],
      flow: ['Server event', 'SignalR hub · Socket.IO', 'Connected clients', 'Live interface update'],
      evidence: ['sukna-financial-platform', 'mita-tourism-platform'],
    },
    {
      id: 'expertise-performance',
      published: true,
      title: 'Performance Optimization',
      summary: 'Performance treated as part of the architecture, on both sides of the API.',
      points: [
        'Lazy loading and code splitting',
        'OnPush change detection and bundle optimization',
        'Redis caching and efficient database querying',
        'API response optimization',
      ],
      flow: ['Lazy loading', 'Code splitting', 'OnPush change detection', 'Redis caching'],
      evidence: ['sukna-financial-platform', 'mita-tourism-platform'],
    },
  ],

  education: [
    {
      id: 'edu-fuuast',
      published: true,
      degree: 'Bachelor in Computer Science',
      institution: 'Federal Urdu University of Arts, Science and Technology (FUUAST)',
      location: 'Islamabad, Pakistan',
      start: '2018',
      end: '2022',
      coursework: [
        'Software Engineering',
        'Data Structures & Algorithms',
        'Database Systems',
        'Object-Oriented Programming',
        'Web Development',
        'Operating Systems',
      ],
      projects: [
        'Online Employee System: an HRM web application in Laravel and MySQL with access management, geolocation-based attendance, leave management and an employee self-service panel.',
        'Social media web application for visually impaired users, built with ASP.NET, with text to speech, high-contrast views and a magnifier.',
        'Weather Forecast System: a desktop application in Core Java that uses weather APIs to show current conditions and a seven-day forecast.',
      ],
    },
  ],

  certifications: [],

  achievements: [
    {
      id: 'ach-international',
      published: true,
      title: 'Delivery across five countries',
      body: 'Contributed to business-critical web and mobile applications for customers in Saudi Arabia, Malaysia, Sweden, Kenya and Pakistan.',
    },
    {
      id: 'ach-library',
      published: true,
      title: 'One component library, four portals',
      body: 'Designed and implemented a reusable Angular component library, published through Azure Artifacts, that standardizes UI development across four independent web portals.',
    },
    {
      id: 'ach-config-driven',
      published: true,
      title: 'Configuration-driven systems',
      body: 'Developed scalable frontend architectures in which forms, menus, themes and navigation are generated from configuration instead of written per screen or per client.',
    },
    {
      id: 'ach-distributed',
      published: true,
      title: 'Distributed and real-time systems',
      body: 'Contributed to systems using asynchronous processing with RabbitMQ, caching with Redis, and real-time communication with SignalR and Socket.IO.',
    },
  ],

  socialLinks: [
    {
      id: 'social-linkedin',
      published: true,
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/omais-ahmed-184660248/',
      icon: 'linkedin',
    },
    { id: 'social-github', published: true, label: 'GitHub', url: 'https://github.com/omais-ahmad', icon: 'github' },
    { id: 'social-email', published: true, label: 'Email', url: 'mailto:webdeveloperomais@gmail.com', icon: 'email' },
  ],

  languages: [
    { id: 'lang-english', published: true, name: 'English', level: 'Professional working proficiency' },
    { id: 'lang-urdu', published: true, name: 'Urdu', level: 'Native' },
  ],
}
