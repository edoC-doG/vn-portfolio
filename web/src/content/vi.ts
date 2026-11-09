import type { Dict } from './types';

const vi: Dict = {
  locale: 'vi',
  meta: {
    title: 'Từ Lũng Cú đến Cà Mau · Nguyễn Minh Long',
    description: 'Portfolio 3D của Nguyễn Minh Long, kỹ sư full-stack .NET và React: bay dọc Việt Nam từ Lũng Cú đến Cà Mau, mỗi công ty là một chặng.',
    cvTitle: 'CV · Nguyễn Minh Long',
    cvDescription: 'CV nhanh của Nguyễn Minh Long: kỹ sư full-stack .NET Core và Next.js, kinh nghiệm, dự án, kỹ năng và học vấn.',
    ogAlt: 'Bản đồ Việt Nam phát sáng, hành trình từ Lũng Cú đến Cà Mau',
  },
  ui: {
    stop: 'Chặng',
    rail: 'Các chặng',
    top: 'Về đầu trang',
    here: 'Bạn đang ở đây',
    cv: 'CV nhanh',
    cvPill: 'CV nhanh ↗',
    cvLong: 'Xem CV nhanh',
    play: 'Tự chạy',
    light: 'Chế độ nhẹ',
    fpsInit: '– khung/giây',
    timeReal: 'Giờ thật',
    wxReal: 'Thời tiết thật',
    skyTitle: 'Đổi giờ trong cảnh',
    wxTitle: 'Đổi thời tiết',
    copy: 'Chép email',
    restart: 'Đi lại từ Lũng Cú',
    goNow: 'Tới chặng hiện tại',
    start: 'Bắt đầu hành trình',
    hint: 'Cuộn hoặc vuốt để bay, hoặc bấm Tự chạy',
    nogl: 'Trình duyệt này không mở được cảnh 3D. Bạn vẫn xem được toàn bộ thông tin ở trang CV nhanh.',
    credits: 'Ghi công mô hình 3D',
    creditsText:
      'Cảnh dùng mô hình từ Sketchfab theo giấy phép CC BY 4.0 của các tác giả dưới đây, cùng texture và mô hình CC0 từ Poly Haven và ambientCG. Các công trình chính làm bằng Meshy.',
    close: 'Đóng ×',
    closeAria: 'Đóng',
    otherLang: 'EN',
    otherLangAria: 'Switch to English',
    email: 'Email',
    linkedin: 'LinkedIn',
    backToJourney: 'Về hành trình 3D',
    print: 'In hoặc lưu PDF',
  },
  profile: {
    name: 'Nguyễn Minh Long',
    title: 'Kỹ sư Full-stack (.NET / React)',
    summary: [
      'Thiết kế và xây dựng hệ thống phân tán cho khách hàng tài chính, chuỗi cung ứng, hàng tiêu dùng nhanh và logistics. Làm trọn từ kiến trúc backend đến khi chạy production.',
      'Mỗi công ty mình từng làm là một điểm dừng trên đường vào Nam. Điểm xuất phát là Đại học FPT, năm 2019.',
    ],
    email: 'longnminhse@gmail.com',
    linkedin: { url: 'https://www.linkedin.com/in/longnminhse', label: 'linkedin.com/in/longnminhse' },
    location: 'Đà Nẵng · TP. Hồ Chí Minh',
  },
  jobs: [
    {
      company: 'FPT Software',
      role: 'Software Engineer',
      type: 'Toàn thời gian',
      period: '01/2021 – 12/2021',
      summary:
        'Phát triển hệ thống ERP quy mô lớn cho một khách hàng điện tử Nhật Bản ở các module kho, nhân sự và tài chính, trong team Scrum 12 người. Triển khai ứng dụng bằng Docker.',
    },
    {
      company: 'Vihat',
      role: 'Software Engineer',
      type: 'Hợp đồng',
      period: '07/2022 – 01/2023',
      summary: 'Phát triển CRM desktop đa nền tảng (Electron + React), phụ trách tính năng gọi điện thời gian thực WebRTC/SIP trong một team nhỏ.',
    },
    {
      company: 'Great Sun',
      role: 'Full-stack Engineer',
      type: 'Toàn thời gian',
      period: '12/2023 – 11/2024',
      summary:
        'Xây dựng và vận hành hệ thống ERP đa nền tảng từ đầu đến cuối, từ backend trên AWS đến frontend React chạy production, quy trình dựa trên Git và Docker.',
      extra: {
        label: 'Dự án',
        lines: [{ lead: 'Garage ERP Platform:', text: '20+ REST API .NET Core cho 10+ chi nhánh, check-in thời gian thực bằng Socket.io, toàn bộ frontend React.' }],
      },
    },
    {
      company: 'CTNP',
      role: 'Full-stack Engineer, Sub-Lead',
      type: 'Toàn thời gian',
      period: '12/2024 – nay',
      current: true,
      summary:
        'Full-stack (.NET Core backend, Next.js/React frontend) cho hai dự án khách hàng chạy song song, team 6–12 người. Phụ trách tài liệu thiết kế kỹ thuật và chuẩn hóa cách dùng AI trong quy trình phát triển của team.',
      extra: {
        label: 'Đang làm cho',
        lines: [
          { lead: 'Bridgestone Việt Nam:', text: 'Identity & Access Platform, Order System Platform' },
          { lead: "L'Oréal Việt Nam:", text: 'FC Tool & FFM Tool' },
        ],
      },
    },
  ],
  projects: {
    title: 'Dự án tiêu biểu',
    items: [
      {
        title: 'Bridgestone · Identity & Access Platform',
        desc: 'Identity.API: đăng nhập Google, JWT, log kiểm toán, phân quyền. Chuyển dealer portal từ Angular sang Next.js 15.',
        stack: '.NET Core · JWT · Next.js 15 · shadcn/ui',
        hot: true,
      },
      {
        title: 'Bridgestone · Order System Platform',
        desc: '5+ module backend, luồng duyệt nhiều cấp, phân quyền theo dòng dữ liệu, test trên 80%.',
        stack: '.NET Core · Next.js · React Query · Zod',
      },
      { title: "L'Oréal · FC Tool & FFM Tool", desc: 'Bảo trì hai backend desktop, đề xuất chuyển sang web.' },
      { title: 'Garage ERP Platform', desc: '20+ REST API cho 10+ chi nhánh, check-in thời gian thực.' },
    ],
  },
  ways: {
    title: 'Cách làm việc',
    items: [
      { lead: 'Thiết kế trước khi code.', text: 'Viết và giữ tài liệu thiết kế kỹ thuật cho dự án.' },
      { lead: 'Dùng AI có quy chuẩn.', text: 'Chuẩn hóa cách dùng GitHub Copilot và Claude Code trong team.' },
      { lead: 'Test đầy đủ.', text: 'Jest và React Testing Library, độ phủ trên 80% ở Order System.' },
      { lead: 'Agile/Scrum.', text: 'Jira, Git, Docker, GitHub Actions và GitLab CI.' },
    ],
  },
  looking: {
    title: 'Điều mình tìm ở chặng tới',
    items: [
      { lead: 'Sản phẩm thật, người dùng thật.', text: 'Một đội làm sản phẩm .NET và Next.js chạy production.' },
      { lead: 'Đi sâu kiến trúc.', text: 'Được thiết kế hệ thống từ đầu, không chỉ làm theo thiết kế có sẵn.' },
      { lead: 'Dẫn dắt kỹ thuật.', text: 'Tiếp tục vai trò kiểu Sub-Lead: tài liệu, review, cách làm chung của team.' },
    ],
  },
  skills: {
    title: 'Kỹ năng',
    items: [
      { group: 'Backend', items: '.NET Core, ASP.NET Core, EF Core, CQRS/MediatR, Clean Architecture, C#' },
      { group: 'Frontend', items: 'React, Next.js, TypeScript, Tailwind CSS, shadcn/ui' },
      { group: 'Dữ liệu & messaging', items: 'SQL Server, RabbitMQ, Redis, SignalR' },
      { group: 'DevOps & Cloud', items: 'AWS (EC2, Lambda, S3), Docker, GitHub Actions, GitLab CI' },
      { group: 'Công cụ & quy trình', items: 'Git, Jest/RTL, Jira, Agile/Scrum, GitHub Copilot, Claude Code' },
    ],
  },
  education: {
    title: 'Học vấn và chứng chỉ',
    school: 'Đại học FPT TP. Hồ Chí Minh',
    degree: 'Cử nhân Kỹ thuật phần mềm',
    period: '07/2019 – 12/2022',
    credentials: [
      { title: 'HackerRank: SQL, CSS, JavaScript, React', issuer: 'HackerRank', date: '05/2024' },
      { title: 'Professional Front-end Developer', issuer: 'Cybersoft Academy', date: '03/2021' },
    ],
    languages: 'Tiếng Việt bản ngữ, tiếng Anh làm việc chuyên nghiệp.',
  },
  contact: {
    title: 'Điểm đến tiếp theo',
    text: 'Hết đất liền, nhưng chưa hết đường. Mình đang tìm điểm đến tiếp theo. Nếu đội của bạn đang cần một kỹ sư .NET và Next.js, mình rất muốn nghe.',
  },
  intro: {
    kicker: 'Portfolio của Nguyễn Minh Long',
    title: ['Từ Lũng Cú', 'đến Cà Mau'],
    lead: 'Một hành trình dọc đất nước, cũng là chặng đường làm nghề của một kỹ sư full-stack .NET và React.',
  },
  end: {
    kicker: 'Mũi Cà Mau · điểm cuối của đất liền',
    title: 'Điểm đến tiếp theo đang chờ',
    text: 'Cảm ơn bạn đã đi cùng mình từ Lũng Cú tới đây. Nếu bạn có một hành trình mới cho kỹ sư .NET và Next.js, hãy nhắn cho mình.',
  },
  stops: [
    { place: 'Lũng Cú', tag: 'Khởi hành', side: 'right', seen: 'Cột cờ Lũng Cú, ruộng bậc thang Hà Giang', body: { kind: 'profile' } },
    {
      place: 'Hà Nội',
      tag: '2021',
      side: 'left',
      seen: 'Lăng Bác, Hồ Gươm với Tháp Rùa và cầu Thê Húc',
      body: { kind: 'job', job: 0, aside: { label: 'Cùng năm', text: 'Chứng chỉ Professional Front-end Developer, Cybersoft Academy (03/2021).' } },
    },
    {
      place: 'Hạ Long',
      tag: '2022',
      side: 'right',
      seen: 'Vịnh Hạ Long, thuyền buồm giữa núi đá vôi',
      body: { kind: 'job', job: 1, aside: { label: 'Cùng lúc', text: 'Tốt nghiệp Cử nhân Kỹ thuật phần mềm, Đại học FPT TP. Hồ Chí Minh (12/2022).' } },
    },
    { place: 'Huế', tag: '2023', side: 'left', seen: 'Tháp Phước Duyên chùa Thiên Mụ, cầu Trường Tiền, nón lá trên sông Hương', body: { kind: 'job', job: 2 } },
    { place: 'Đà Nẵng, Hội An', side: 'left', now: true, seen: 'Cầu Vàng, cầu Rồng, phố đèn lồng Hội An và thuyền thúng', body: { kind: 'job', job: 3 } },
    { place: 'Tây Nguyên', side: 'right', seen: 'Nhà rông, cồng chiêng bên đống lửa, đồi cà phê', body: { kind: 'projects' } },
    { place: 'Nha Trang', side: 'left', seen: 'Tháp Bà Ponagar, đảo và đèn thuyền câu mực', body: { kind: 'ways' } },
    { place: 'Phan Thiết', side: 'right', seen: 'Tháp nước Phan Thiết, đồi cát Mũi Né, thuyền thúng', body: { kind: 'skills' } },
    { place: 'Sài Gòn', side: 'left', seen: 'Chợ Bến Thành, Landmark 81, Bitexco', body: { kind: 'education' } },
    { place: 'Miền Tây', side: 'right', seen: 'Chợ nổi, rặng dừa, nhà sàn ven sông, cầu khỉ', body: { kind: 'looking' } },
    { place: 'Mũi Cà Mau', side: 'left', seen: 'Biểu tượng con tàu Mũi Cà Mau, rừng đước', body: { kind: 'contact' } },
  ],
  cv: {
    experience: 'Kinh nghiệm',
    projects: 'Dự án tiêu biểu',
    skills: 'Kỹ năng',
    education: 'Học vấn và chứng chỉ',
    ways: 'Cách làm việc',
    looking: 'Điều mình tìm ở chặng tới',
    contact: 'Liên hệ',
  },
};

export default vi;
