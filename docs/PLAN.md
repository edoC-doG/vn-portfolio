# Kế hoạch

## 1. Mục tiêu

- Một trang web 3D: bay liên tục từ Lũng Cú tới Mũi Cà Mau. Đi từ Bắc vào Nam cũng là đi qua các mốc làm nghề.
- Cuộn trang là **bay tới**. Mọi thứ hiện ra từ xa giữa màn hình, lớn dần, rồi lướt qua bên cạnh. Không lướt ngang, không lướt dọc.
- Mỗi địa danh đứng trong **khung cảnh thật của nó** (phố, chợ, xe, thuyền, cây, người qua lại), không đứng trơ trọi.
- Mượt trên điện thoại và máy yếu. Máy không có WebGL vẫn đọc được CV.
- Song ngữ Việt / Anh. Có trang "CV nhanh" tĩnh. Deploy lên Vercel, gắn tên miền riêng.

## 2. Câu chuyện: mỗi công ty là một điểm đến

Đi theo thời gian. **Hiện tại (CTNP) là Đà Nẵng, Hội An.** Từ đó trở đi là những gì mình mang theo, và cuối cùng là Mũi Cà Mau: *"Mình đang tìm điểm đến tiếp theo"*. Không tổng kết kiểu "11 chặng, hơn 4 năm".

| Chặng | Nơi | Nội dung |
|---|---|---|
| 01 | Lũng Cú | **Khởi hành.** Tên, chức danh, một câu giới thiệu. Điểm xuất phát: Đại học FPT (2019). |
| 02 | Hà Nội | **FPT Software** (01/2021 – 12/2021). Chứng chỉ Front-end của Cybersoft (03/2021). |
| 03 | Hạ Long | **Vihat** (07/2022 – 01/2023). Tốt nghiệp (12/2022). |
| 04 | Huế | **Great Sun** (12/2023 – 11/2024). |
| 05 | Đà Nẵng, Hội An | **Hiện tại: CTNP** (12/2024 – nay), Sub-Lead. Bridgestone, L'Oréal. Có nhãn "Bạn đang ở đây". |
| 06 | Tây Nguyên | Dự án tiêu biểu |
| 07 | Nha Trang | Cách làm việc |
| 08 | Phan Thiết | Kỹ năng |
| 09 | Sài Gòn | Học vấn và chứng chỉ (Đại học FPT TP. Hồ Chí Minh, HackerRank) |
| 10 | Miền Tây | Điều mình tìm ở chặng tới *(bản nháp, cần anh Long sửa)* |
| 11 | Mũi Cà Mau | **Điểm đến tiếp theo.** "Hết đất liền, nhưng chưa hết đường. Mình đang tìm điểm đến tiếp theo." Email, LinkedIn. |

## 3. Máy quay: bay thẳng vào trong màn hình

- Máy quay **luôn nhìn về phía trước** (hướng Nam), chỉ nghiêng nhẹ về công trình khi tới gần (≤ 15–20%).
- Khi tới một chặng, máy quay **trượt sang phía bờ có công trình** để công trình lướt qua sát bên cạnh. Không dùng `setViewOffset` đẩy khung hình sang ngang nữa.
- Panel chữ ở phía bên kia. Panel cũng **đi theo chiều sâu**: hiện ra nhỏ ở xa, phóng to dần khi tới gần, khi đi qua thì phóng to thêm một chút và mờ đi, như vừa lướt qua người xem.
- Các phần đã có, vẫn giữ: bản đồ chữ S lúc đầu, đoạn xoáy lao xuống Lũng Cú, chậm lại ở mỗi chặng (tốc độ còn 13%), bay lên ở Cà Mau và quay về toàn cảnh.

## 4. Dựng cảnh từng chặng

Giữ model địa danh hiện có (Meshy). Mọi thứ **xung quanh** dựng bằng model ngoài (xem `docs/ASSETS.md`) và code, theo đúng khung cảnh ngoài đời.

| Chặng | Địa danh (giữ) | Ngoài đời xung quanh có gì | Cần dựng thêm |
|---|---|---|---|
| 01 Lũng Cú | Cột cờ | Núi Rồng, 389 bậc đá lên cột cờ. Bản Lô Lô Chải: nhà trình tường mái ngói âm dương, tường rào đá. Ruộng bậc thang, hoa tam giác mạch hồng, núi đá tai mèo. | Bậc đá, nhà trình tường, tường đá, ruộng bậc thang thật (texture lúa), hoa tam giác mạch, sương núi. |
| 02 Hà Nội | Lăng Bác, Tháp Rùa | Quảng trường Ba Đình: 168 ô cỏ, cột cờ, hàng cây, đường rộng. Hồ Gươm: liễu rủ, cây đa cổ thụ, đền Ngọc Sơn, cầu Thê Húc, Tháp Bút. Phố cổ: nhà ống mái ngói, đèn đường kiểu Pháp, xe máy, xích lô. | Ô cỏ, cột cờ, liễu, đa, đèn đường, ghế đá, dãy nhà ống phố cổ, xe máy, xích lô. |
| 03 Hạ Long | Thuyền buồm | Hàng nghìn đảo đá, làng chài nổi (nhà bè, thuyền gỗ nhỏ), tàu du lịch trắng nhiều tầng, kayak, hang động. | Nhà bè, thuyền gỗ, tàu du lịch, kayak, phao nuôi trai. |
| 04 Huế | Tháp Phước Duyên | Chùa Thiên Mụ trên đồi: cổng tam quan, lầu chuông, nhà bia, thông già, bậc đá xuống bến. Sông Hương: thuyền rồng, đò. Cầu Trường Tiền. Gần đó là Đại Nội (Ngọ Môn, Kỳ Đài), hồ sen. | Cổng tam quan, thông, bậc đá, bến thuyền, thuyền rồng, đò, hồ sen. |
| 05 Đà Nẵng, Hội An | Cầu Vàng, Chùa Cầu | Bà Nà: đồi mây, vườn hoa, cáp treo. Đà Nẵng: cầu Rồng phun lửa, sông Hàn, nhà cao tầng hai bên bờ. Hội An: phố nhà vàng mái ngói rêu, đèn lồng, hoa giấy, thuyền gỗ có đèn trên sông Thu Bồn, hoa đăng. | Cáp treo, vườn hoa, mây, tòa nhà ven sông Hàn, nhà Hội An chi tiết, đèn lồng, hoa giấy, thuyền gỗ Hội An. |
| 06 Tây Nguyên | Nhà rông, cồng chiêng | Buôn làng: nhà dài Ê Đê, đất đỏ bazan, rẫy cà phê, rừng thông (Đà Lạt), thác nước, voi, thuyền độc mộc trên hồ Lắk. | Nhà dài, cây cà phê, texture đất đỏ, thác nước (shader), voi, thuyền độc mộc. |
| 07 Nha Trang | Tháp Bà Ponagar | Đồi Cù Lao bên cửa sông Cái, làng chài với thuyền thúng và thuyền câu mực sơn xanh, cầu Xóm Bóng, bãi biển dừa, khách sạn ven biển, đảo và cáp treo ra đảo. | Thuyền câu mực, dừa, dù bãi biển, khách sạn, cầu. |
| 08 Phan Thiết | Tháp nước | Sông Cà Ty, đồi cát Mũi Né (cát trắng, cát đỏ), làng chài thuyền thúng, vườn thanh long, tháp Chăm Pôshanư, dừa. | Thanh long, thuyền đánh cá, đồi cát (code, đã có), tháp Chăm nhỏ. |
| 09 Sài Gòn | Chợ Bến Thành (+ Nhà thờ Đức Bà, Bưu điện khi có file) | Bến Thành: vòng xoay, tượng Trần Nguyên Hãn, dòng xe máy, xe buýt, ga Metro. Nhà thờ Đức Bà gạch đỏ ở công xã Paris, tượng Đức Mẹ, hàng cây dầu; Bưu điện vàng ngay cạnh. Bitexco, Landmark 81. Sông Sài Gòn có phà, tàu. Xe đẩy hàng rong, quán cà phê vỉa hè. | Xe máy (nhiều), ô tô, xe buýt, tòa nhà thật hơn khối hộp, cây dầu, đèn đường, xe đẩy, ghế nhựa, phà. |
| 10 Miền Tây | Ghe chợ nổi | Chợ nổi Cái Răng: ghe có cây bẹo treo hàng, xuồng ba lá, người đội nón lá. Dừa, dừa nước, nhà sàn ven sông, cầu khỉ, vườn trái cây, ruộng lúa. | Xuồng ba lá, cây bẹo, dừa nước, trái cây, ruộng lúa, nhà sàn chi tiết. |
| 11 Mũi Cà Mau | Biểu tượng con tàu | Cột mốc tọa độ GPS 0001, cầu gỗ đi bộ, rừng đước rễ chống, bãi bồi, thuyền đánh cá, đảo Hòn Khoai xa xa. | Cây đước có rễ, cầu gỗ, cột mốc, thuyền đánh cá. |

Dùng chung cho nhiều chặng: xe máy, ô tô, thuyền gỗ các loại, nhà ống, đèn đường, tre (bụi tre là hình ảnh làng quê Việt), dừa, người (nếu có model nhẹ).

Cách làm một chặng cho kỹ:
1. Phác bố cục từ ảnh thật (ảnh tham khảo để ở `assets/incoming/img/`, chỉ để tham khảo).
2. Đặt model địa danh, rồi lớp gần (đường, bậc, quảng trường), lớp giữa (nhà, cây, xe, thuyền), lớp xa (đồi, nhà cao tầng, đảo).
3. Ánh sáng ngày và đêm cho chặng đó (đèn đường, cửa sổ, đèn lồng).
4. Chụp 4 khung (ngày, hoàng hôn, đêm, mưa), so với ảnh thật, sửa.

## 5. Công nghệ

| Phần | Chọn |
|---|---|
| Khung | Next.js 16 (App Router), TypeScript |
| 3D | three.js + React Three Fiber + drei |
| Cuộn | Cuộn gốc của trình duyệt. Máy tính có thể thêm Lenis. Tiến độ cuộn giữ trong `ref`, không đưa vào React state. |
| Giao diện | Tailwind CSS + shadcn/ui |
| Ngôn ngữ | Từ điển `content/vi.ts`, `content/en.ts` + route `/[locale]` |
| Model | `.glb` nén meshopt, texture KTX2 (Basis), 3 mức high / mid / low |
| Kiểm tra | Playwright chụp khung cố định (giống `prototype/fly/shots.mjs`) |

Cấu trúc đề xuất (`web/`):

```
app/[locale]/page.tsx          hành trình 3D
app/[locale]/cv/page.tsx       CV nhanh (tĩnh)
components/journey/
  JourneyCanvas.tsx            Canvas, chọn mức, PerformanceMonitor
  CameraRig.tsx                đọc tiến độ cuộn, tính vị trí máy quay
  Terrain.tsx  Water.tsx  Sky.tsx  Weather.tsx  Overview.tsx
  stops/LungCu.tsx … CaMau.tsx một file cho mỗi chặng
  Forest.tsx  Lanterns.tsx  Fireflies.tsx  InstancedProps.tsx
components/ui/Panel.tsx  Rail.tsx  Hud.tsx
lib/route.ts  lib/tier.ts  lib/atmo.ts   đường bay, mức hiển thị, giờ và thời tiết
content/vi.ts  content/en.ts   nội dung theo chặng
public/models/{low,mid,high}/  model
```

## 6. Đường bay (đã có trong `prototype/fly/app.js`)

- **Đường sông:** CatmullRom qua 11 chặng. Tọa độ x theo kinh độ thật (phía đông là −x), phóng 1,8 lần để từ trên cao thấy hình chữ S.
- **Đất liền:** heightfield bằng code, rộng hẹp theo từng chặng, núi kiểu ridged, chia 8 khối theo z. Texture Poly Haven cho đá, đất rừng, ruộng, cát.
- **Tiến độ cuộn u (0 → 1):** 0 – 0,03 toàn bản đồ; 0,03 – 0,085 xoáy xuống Lũng Cú; 0,085 – 0,93 bay dọc sông, chậm lại ở mỗi chặng; 0,93 – 1 bay lên ở Cà Mau.
- **Giờ và thời tiết:** mặt trời theo giờ Việt Nam và vị trí từng chặng; mưa và mây theo Open-Meteo.
- **Làm mượt:** u hiện tại đuổi theo u đích với hằng thời gian 0,28 s, dài hơn khi nhảy xa.

## 7. Mức hiển thị và ngân sách

| | Thấp (điện thoại, máy yếu) | Trung bình | Cao |
|---|---|---|---|
| Tam giác trên khung hình | ≤ 100k | ≤ 250k | ≤ 600k |
| Draw call | ≤ 40 | ≤ 80 | ≤ 150 |
| Texture | 512 | 1024 | 1024 KTX2 |
| Tỉ lệ điểm ảnh (DPR) | 1 – 1,25 | 1,5 | 2 |
| Bloom | tắt | bật (nửa độ phân giải) | bật |

- Chọn mức theo `pointer: coarse` + màn hình nhỏ, `deviceMemory ≤ 4`, `hardwareConcurrency ≤ 4`. Tự hạ mức khi dưới 40 khung/giây. Có nút "Chế độ nhẹ".
- Model phụ trợ (xe, thuyền, nhà) phải dùng instancing và có bản low. Mỗi chặng tối đa khoảng 15 draw call riêng.
- Mức thấp hiện đã 44–45 draw call ở vài chặng, cần gộp bớt ở Mốc C.

## 8. Các mốc

- **A. Tổng quan (đang làm).** Câu chuyện mới, máy quay bay thẳng, ngày đêm và thời tiết, mặt nước, địa hình, rừng.
- **B. Asset ngoài.** Tải theo `docs/ASSETS.md`, xử lý thành 3 mức, ghi nguồn và giấy phép.
- **C. Từng chặng chi tiết.** Làm lần lượt theo bảng ở mục 4, mỗi chặng chụp 4 khung so với ảnh thật. Thứ tự đề xuất: Đà Nẵng, Hội An (hiện tại) → Sài Gòn → Hà Nội → Lũng Cú → các chặng còn lại.
- **D. Project thật.** Next.js 16 + React Three Fiber trong `web/`, chuyển dần từ prototype. Trang CV nhanh Lighthouse ≥ 95.
- **E. Hiệu năng.** Meshopt + KTX2, PerformanceMonitor, đo từng chặng.
- **F. Song ngữ và hoàn thiện.** Tiếng Anh, ảnh chân dung, ảnh dự án, SEO / Open Graph, analytics.
- **G. Ra mắt.** Tên miền, kiểm tra trên iPhone, Android tầm trung, laptop không card rời.

## 9. Còn chờ

- File GLB địa danh: Chùa Cầu (bắt buộc), Nhà thờ Đức Bà, Bưu điện Thành phố. Chợ Bến Thành làm lại màu.
- Model phụ trợ theo `docs/ASSETS.md`.
- Nội dung chặng 10 (Miền Tây): điều anh Long muốn tìm ở công việc tiếp theo.
- Chứng chỉ trên LinkedIn, ảnh chân dung, ảnh chụp màn hình dự án.
- Bản tiếng Anh cho từng panel.
