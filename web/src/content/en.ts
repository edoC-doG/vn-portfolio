import type { Dict } from './types';

const en: Dict = {
  locale: 'en',
  meta: {
    title: 'From Lũng Cú to Cà Mau · Nguyễn Minh Long',
    description:
      'The 3D portfolio of Nguyễn Minh Long, a full-stack .NET and React engineer: fly down Vietnam from Lũng Cú to Cà Mau, one stop per company.',
    cvTitle: 'CV · Nguyễn Minh Long',
    cvDescription: 'Quick CV of Nguyễn Minh Long: full-stack .NET Core and Next.js engineer, experience, projects, skills and education.',
    ogAlt: 'A glowing map of Vietnam, the journey from Lũng Cú to Cà Mau',
  },
  ui: {
    stop: 'Stop',
    rail: 'Stops',
    top: 'Back to top',
    here: 'You are here',
    cv: 'Quick CV',
    cvPill: 'Quick CV ↗',
    cvLong: 'Quick CV',
    play: 'Autoplay',
    light: 'Light mode',
    fpsInit: '– fps',
    timeReal: 'Real time',
    wxReal: 'Real weather',
    skyTitle: 'Change the time of day in the scene',
    wxTitle: 'Change the weather',
    copy: 'Copy email',
    restart: 'Fly again from Lũng Cú',
    goNow: 'Go to where I am now',
    start: 'Start the journey',
    hint: 'Scroll or swipe to fly, or press Autoplay',
    nogl: 'This browser cannot open the 3D scene. Everything is still on the Quick CV page.',
    credits: '3D model credits',
    creditsText:
      'The scene uses Sketchfab models by the authors below, under CC BY 4.0, plus CC0 textures and models from Poly Haven and ambientCG. The main landmarks are made with Meshy.',
    close: 'Close ×',
    closeAria: 'Close',
    otherLang: 'VI',
    otherLangAria: 'Chuyển sang tiếng Việt',
    email: 'Email',
    linkedin: 'LinkedIn',
    backToJourney: 'Back to the 3D journey',
    print: 'Print or save as PDF',
  },
  profile: {
    name: 'Nguyễn Minh Long',
    title: 'Full-stack Engineer (.NET / React)',
    summary: [
      'Designs and builds distributed systems for financial services, supply chain, FMCG and logistics clients, from backend architecture all the way to production.',
      'Every company I have worked for is a stop on the road south. The starting point was FPT University, in 2019.',
    ],
    email: 'longnminhse@gmail.com',
    linkedin: { url: 'https://www.linkedin.com/in/longnminhse', label: 'linkedin.com/in/longnminhse' },
    location: 'Đà Nẵng · Ho Chi Minh City, Vietnam',
  },
  jobs: [
    {
      company: 'FPT Software',
      role: 'Software Engineer',
      type: 'Full-time',
      period: '01/2021 – 12/2021',
      summary:
        'Worked on a large-scale ERP system for a Japanese electronics client across inventory, HR and finance modules, in a 12-person Scrum team. Deployed containerized applications with Docker.',
    },
    {
      company: 'Vihat',
      role: 'Software Engineer',
      type: 'Contract',
      period: '07/2022 – 01/2023',
      summary: 'Contributed to a cross-platform desktop CRM (Electron + React), working on real-time WebRTC/SIP calling features in a small team.',
    },
    {
      company: 'Great Sun',
      role: 'Full-stack Engineer',
      type: 'Full-time',
      period: '12/2023 – 11/2024',
      summary:
        'Built and operated a multi-platform ERP system end to end, from AWS-hosted backend services to a production React frontend, with Git- and Docker-based workflows.',
      extra: {
        label: 'Project',
        lines: [{ lead: 'Garage ERP Platform:', text: '20+ .NET Core REST APIs for 10+ locations, real-time check-in with Socket.io, the whole React frontend.' }],
      },
    },
    {
      company: 'CTNP',
      role: 'Full-stack Engineer, Sub-Lead',
      type: 'Full-time',
      period: '12/2024 – present',
      current: true,
      summary:
        'Full-stack engineer (.NET Core backend, Next.js/React frontend) across two concurrent client engagements with teams of 6–12. Owns the technical design docs and standardizes AI-assisted development across the team.',
      extra: {
        label: 'Working for',
        lines: [
          { lead: 'Bridgestone Vietnam:', text: 'Identity & Access Platform, Order System Platform' },
          { lead: "L'Oréal Vietnam:", text: 'FC Tool & FFM Tool' },
        ],
      },
    },
  ],
  projects: {
    title: 'Selected projects',
    items: [
      {
        title: 'Bridgestone · Identity & Access Platform',
        desc: 'Identity.API: Google sign-in, JWT, audit logging, permissions. Migrated the dealer portal from Angular to Next.js 15.',
        stack: '.NET Core · JWT · Next.js 15 · shadcn/ui',
        hot: true,
      },
      {
        title: 'Bridgestone · Order System Platform',
        desc: '5+ backend modules, multi-level approvals, row-level access rules, 80%+ test coverage.',
        stack: '.NET Core · Next.js · React Query · Zod',
      },
      { title: "L'Oréal · FC Tool & FFM Tool", desc: 'Maintains two legacy desktop backends, proposed moving them to the web.' },
      { title: 'Garage ERP Platform', desc: '20+ REST APIs for 10+ locations, real-time check-in.' },
    ],
  },
  ways: {
    title: 'How I work',
    items: [
      { lead: 'Design before code.', text: 'Writes and keeps the technical design docs for the project.' },
      { lead: 'AI with standards.', text: 'Standardized how the team uses GitHub Copilot and Claude Code.' },
      { lead: 'Thorough testing.', text: 'Jest and React Testing Library, 80%+ coverage on the Order System.' },
      { lead: 'Agile/Scrum.', text: 'Jira, Git, Docker, GitHub Actions and GitLab CI.' },
    ],
  },
  looking: {
    title: 'What I am looking for next',
    items: [
      { lead: 'A real product with real users.', text: 'A team building .NET and Next.js products that run in production.' },
      { lead: 'Depth in architecture.', text: 'Designing systems from the start, not only building to a given design.' },
      { lead: 'Technical leadership.', text: "Carrying on the Sub-Lead kind of role: docs, reviews, the team's shared practices." },
    ],
  },
  skills: {
    title: 'Skills',
    items: [
      { group: 'Backend', items: '.NET Core, ASP.NET Core, EF Core, CQRS/MediatR, Clean Architecture, C#' },
      { group: 'Frontend', items: 'React, Next.js, TypeScript, Tailwind CSS, shadcn/ui' },
      { group: 'Data & messaging', items: 'SQL Server, RabbitMQ, Redis, SignalR' },
      { group: 'DevOps & cloud', items: 'AWS (EC2, Lambda, S3), Docker, GitHub Actions, GitLab CI' },
      { group: 'Tools & practices', items: 'Git, Jest/RTL, Jira, Agile/Scrum, GitHub Copilot, Claude Code' },
    ],
  },
  education: {
    title: 'Education and certificates',
    school: 'FPT University Ho Chi Minh City',
    degree: "Bachelor's degree, Software Engineering",
    period: '07/2019 – 12/2022',
    credentials: [
      { title: 'HackerRank: SQL, CSS, JavaScript, React', issuer: 'HackerRank', date: '05/2024' },
      { title: 'Professional Front-end Developer', issuer: 'Cybersoft Academy', date: '03/2021' },
    ],
    languages: 'Vietnamese (native), English (professional working proficiency).',
  },
  contact: {
    title: 'The next destination',
    text: 'The land ends here, but the road goes on. I am looking for my next destination. If your team needs a .NET and Next.js engineer, I would love to hear from you.',
  },
  intro: {
    kicker: 'Portfolio of Nguyễn Minh Long',
    title: ['From Lũng Cú', 'to Cà Mau'],
    lead: 'A journey down the length of Vietnam, and through the working life of a full-stack .NET and React engineer.',
  },
  end: {
    kicker: 'Cà Mau Cape · where the land ends',
    title: 'The next destination is waiting',
    text: 'Thank you for travelling with me from Lũng Cú to here. If you have a new journey for a .NET and Next.js engineer, send me a message.',
  },
  stops: [
    { place: 'Lũng Cú', tag: 'Setting off', side: 'right', seen: 'Lũng Cú flag tower, the terraced fields of Hà Giang', body: { kind: 'profile' } },
    {
      place: 'Hà Nội',
      tag: '2021',
      side: 'left',
      seen: 'Hồ Chí Minh Mausoleum, Hoàn Kiếm Lake with the Turtle Tower and the Thê Húc bridge',
      body: { kind: 'job', job: 0, aside: { label: 'Same year', text: 'Professional Front-end Developer certificate, Cybersoft Academy (03/2021).' } },
    },
    {
      place: 'Hạ Long',
      tag: '2022',
      side: 'right',
      seen: 'Hạ Long Bay, junks among the limestone islands',
      body: {
        kind: 'job',
        job: 1,
        aside: { label: 'At the same time', text: "Graduated: Bachelor's degree in Software Engineering, FPT University Ho Chi Minh City (12/2022)." },
      },
    },
    {
      place: 'Huế',
      tag: '2023',
      side: 'left',
      seen: 'Phước Duyên tower of Thiên Mụ pagoda, the Trường Tiền bridge, conical hats on the Perfume River',
      body: { kind: 'job', job: 2 },
    },
    {
      place: 'Đà Nẵng, Hội An',
      side: 'left',
      now: true,
      seen: 'The Golden Bridge, the Dragon Bridge, the lantern streets and basket boats of Hội An',
      body: { kind: 'job', job: 3 },
    },
    { place: 'Central Highlands', side: 'right', seen: 'A rông communal house, gongs by the fire, coffee hills', body: { kind: 'projects' } },
    { place: 'Nha Trang', side: 'left', seen: 'The Po Nagar towers, islands and squid-boat lights', body: { kind: 'ways' } },
    { place: 'Phan Thiết', side: 'right', seen: 'The Phan Thiết water tower, the Mũi Né dunes, basket boats', body: { kind: 'skills' } },
    { place: 'Saigon', side: 'left', seen: 'Bến Thành market, Landmark 81, Bitexco', body: { kind: 'education' } },
    { place: 'Mekong Delta', side: 'right', seen: 'Floating market, coconut palms, stilt houses on the river, monkey bridge', body: { kind: 'looking' } },
    { place: 'Cà Mau Cape', side: 'left', seen: 'The ship monument of Cà Mau Cape, the mangrove forest', body: { kind: 'contact' } },
  ],
  cv: {
    experience: 'Experience',
    projects: 'Selected projects',
    skills: 'Skills',
    education: 'Education and certificates',
    ways: 'How I work',
    looking: 'What I am looking for next',
    contact: 'Contact',
  },
};

export default en;
