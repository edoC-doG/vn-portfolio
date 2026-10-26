# Kế hoạch dựng bản thật

## 1. Mục tiêu

- Một trang web 3D: bay liên tục dọc dải đất chữ S, chậm lại ở 11 chặng, mỗi chặng hiện một phần CV.
- Mượt trên điện thoại và máy yếu. Không giật, không nóng máy. Máy quá yếu hoặc không có WebGL thì vẫn đọc được CV.
- Song ngữ Việt / Anh. Có trang "CV nhanh" tĩnh cho người chỉ muốn đọc CV (và cho SEO).
- Deploy lên Vercel, gắn tên miền riêng.

## 2. Công nghệ

| Phần | Chọn |
|---|---|
| Khung | Next.js 16 (App Router), TypeScript |
| 3D | three.js + React Three Fiber + drei |
| Cuộn | Cuộn gốc của trình duyệt. Máy tính có thể thêm Lenis. Tiến độ cuộn giữ trong `ref`, không đưa vào React state. |
| Giao diện | Tailwind CSS + shadcn/ui |
| Ngôn ngữ | Từ điển `content/vi.ts`, `content/en.ts` + route `/[locale]` |
| Model | `.glb` nén meshopt, texture KTX2 (Basis), 3 mức high / mid / low |
| Kiểm tra | Playwright chụp khung cố định (giống `prototype/fly/shots.mjs`) |

## 3. Cấu trúc đề xuất (`web/`)

```
app/[locale]/page.tsx          hành trình 3D
app/[locale]/cv/page.tsx       CV nhanh (tĩnh)
components/journey/
  JourneyCanvas.tsx            Canvas, chọn mức, PerformanceMonitor
  CameraRig.tsx                đọc tiến độ cuộn, tính vị trí máy quay
  Terrain.tsx  Water.tsx  Sky.tsx  Overview.tsx
  stops/LungCu.tsx … CaMau.tsx một file cho mỗi chặng
  Lanterns.tsx  Fireflies.tsx  InstancedProps.tsx
components/ui/Panel.tsx  Rail.tsx  Hud.tsx
lib/route.ts                   đường sông, chặng, bảng tốc độ (chuyển từ prototype/fly/app.js)
lib/tier.ts                    phát hiện máy, mức hiển thị
content/vi.ts  content/en.ts   nội dung CV theo chặng
public/models/{low,mid,high}/  model
```

## 4. Đường bay và máy quay (đã có trong `prototype/fly/app.js`)

- **Đường sông:** CatmullRom qua 11 chặng. Tọa độ x lấy theo kinh độ thật (phía đông là −x) rồi phóng 1,8 lần để nhìn từ trên cao ra hình chữ S. Các chặng cách đều nhau theo trục z.
- **Đất liền:** heightfield tạo bằng code, rộng hẹp khác nhau theo từng chặng (`WEST`, `EAST`). Lũng Cú là đỉnh phía bắc, Cà Mau là mũi phía nam, ngoài là biển. Địa hình chia 8 khối theo z để chỉ vẽ phần gần máy quay.
- **Tiến độ cuộn u (0 → 1):**
  - 0 – 0,03: nhìn toàn bản đồ chữ S, tiêu đề bên trái.
  - 0,03 – 0,085: máy quay vừa xoáy vừa hạ xuống cột cờ Lũng Cú.
  - 0,085 – 0,93: bay dọc sông. Dùng bảng tốc độ (`TA`/`TU`): tốc độ còn 13% quanh điểm dừng của mỗi chặng (Gauss σ = 22). Nhờ vậy máy quay chậm lại để đọc mà không dừng hẳn.
  - 0,93 – 1: bay lên cao ở Cà Mau, quay về toàn cảnh chữ S, đường đã đi sáng dần lên.
- **Khung hình:** gần chặng, hướng nhìn nghiêng dần về công trình (bên trước chặng σ = 46, bên sau σ = 16). Dùng `setViewOffset` để đẩy công trình sang phía đối diện panel. Trên điện thoại thì đẩy lên nửa trên vì panel nằm dưới.
- **Làm mượt:** u hiện tại đuổi theo u đích với hằng thời gian 0,28 s. Khi nhảy xa (bấm thanh chặng) thì hằng thời gian dài hơn để máy quay bay qua thay vì giật.

## 5. Mức hiển thị và ngân sách

| | Thấp (điện thoại, máy yếu) | Trung bình | Cao |
|---|---|---|---|
| Tam giác trên khung hình | ≤ 100k | ≤ 250k | ≤ 600k |
| Draw call | ≤ 40 | ≤ 80 | ≤ 150 |
| Texture | 512 | 1024 | 1024 KTX2 |
| Tỉ lệ điểm ảnh (DPR) | 1 – 1,25 | 1,5 | 2 |
| Bloom | tắt | bật (nửa độ phân giải) | bật |
| Đom đóm, đồi cà phê, đèn thuyền câu mực | tắt khi bật "Chế độ nhẹ" | bật | bật |

- **Chọn mức:** `pointer: coarse` + màn hình nhỏ, `deviceMemory ≤ 4`, `hardwareConcurrency ≤ 4` → Thấp. Có thêm detect-gpu ở bản thật.
- **Tự hạ mức khi chạy:** 2 giây liên tiếp dưới 40 khung/giây thì tắt bloom trước, sau đó hạ DPR.
- **Nút "Chế độ nhẹ":** lưu lựa chọn, áp dụng ngay.
- **Không dùng phản chiếu thật.** Nước là shader tự viết, có gợn sóng và vệt trăng.
- **Không dùng nhiều nguồn sáng.** Đèn lồng là điểm sáng phát quang (một draw call cho cả cụm). Tổng chỉ có 5 nguồn sáng cố định: trời, trăng, ánh ấm, đèn chiếu công trình, một đèn điểm ấm di chuyển theo chặng. Số đèn không đổi nên shader không phải biên dịch lại.
- **Nạp dần:** model nạp theo thứ tự hành trình, 3 file một lúc. Shader được biên dịch trước khi công trình hiện ra khỏi sương.

## 6. Các mốc

1. **Khung project.** Next.js + R3F + Tailwind/shadcn, route `/vi` `/en`, trang CV nhanh tĩnh, deploy Vercel bản nháp.
   - Xong khi: Lighthouse của trang CV đạt ≥ 95.
2. **Hành trình trống.** Chuyển `lib/route.ts`, địa hình, nước, bầu trời, bản đồ toàn cảnh, CameraRig, panel và thanh chặng (chưa có model).
   - Xong khi: cuộn từ đầu đến cuối mượt trên một điện thoại tầm trung.
3. **11 chặng.** Đặt model và phần làm bằng code theo `docs/MODELS.md`. Có hiệu ứng: cờ bay, đèn lồng trôi, thuyền nhấp nhô, cầu Trường Tiền đổi màu.
4. **Hiệu năng.** Nén model meshopt + KTX2. Chọn mức tự động, PerformanceMonitor, đo draw call và số tam giác ở từng chặng.
5. **Song ngữ và hoàn thiện.** Tiếng Anh, ảnh chân dung, ảnh dự án, chứng chỉ LinkedIn, SEO / Open Graph, trang lỗi, analytics.
6. **Ra mắt.** Gắn tên miền và kiểm tra trên iPhone, Android tầm trung, laptop không có card rời.

## 7. Còn chờ

- File GLB: Chùa Cầu (bắt buộc), Nhà thờ Đức Bà, Bưu điện Thành phố. Chợ Bến Thành làm lại màu.
- Chứng chỉ trên LinkedIn (hiện mới có 2 cái lấy từ CV PDF).
- Ảnh chân dung, ảnh chụp màn hình dự án.
- Bản tiếng Anh cho từng panel. Nội dung tiếng Anh của CV nhanh đã có trong `prototype/quick-cv/index.html`.
