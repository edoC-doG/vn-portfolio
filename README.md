# Từ Lũng Cú đến Cà Mau

Portfolio 3D của **Nguyễn Minh Long**, kỹ sư full-stack .NET / Next.js. Người xem bay một chuyến đêm dọc dải đất hình chữ S, qua 11 chặng từ Lũng Cú đến Mũi Cà Mau. Mỗi chặng có một công trình biểu tượng và một phần CV. Ai chỉ muốn đọc CV thì bấm sang bản "CV nhanh".

## Trạng thái (26/10/2026)

| Hạng mục | Tình trạng |
|---|---|
| 14 model Meshy, xử lý thành 3 mức high / mid / low | Xong, nằm ở `assets/models` |
| Storyboard 11 chặng và bản điện thoại | Xong, ảnh ở `docs/storyboard` |
| CV nhanh song ngữ Việt / Anh | Xong, ở `prototype/quick-cv` |
| Bản bay liên tục (`prototype/fly`) | Chạy đủ 11 chặng. Đã chụp kiểm tra toàn bộ khung trên máy tính và điện thoại (26/10/2026), sửa xong khung hình Lũng Cú, Đà Nẵng, Nha Trang, đoạn qua cầu Rồng, đoạn bay lên cuối và bản đồ cuối trên điện thoại. |
| Câu chuyện và máy quay | Mỗi công ty là một điểm dừng, hiện tại (CTNP) ở Đà Nẵng, Hội An, Cà Mau là "điểm đến tiếp theo". Máy quay nhìn thẳng về phía trước: cuộn là bay tới, công trình từ xa lớn dần rồi lướt qua bên cạnh. Panel phóng to theo chiều sâu. |
| Giờ và thời tiết | Ngày, đêm theo giờ Việt Nam thật; mưa và mây theo Open-Meteo. Nút đổi giờ và thời tiết ở góc trên. |
| Khung cảnh quanh địa danh | **Việc tiếp theo.** Danh sách model cần tải ở `docs/ASSETS.md`, bảng khung cảnh từng chặng ở `docs/PLAN.md` mục 4. |
| Cây, mặt nước, địa hình | Rừng 4 loại cây từ EZ-Tree (MIT), mặt nước có normal map, vệt trăng và bọt sóng, địa hình có đá / thảm thực vật / cát bằng shader. Nguồn và giấy phép ở `docs/MODELS.md`. |
| Chùa Cầu, Nhà thờ Đức Bà, Bưu điện Thành phố | Đã làm trên Meshy, **chưa có file**. Code đã chừa sẵn chỗ. |
| Chợ Bến Thành | Cần làm lại màu (Retexture) trên Meshy |
| Project thật Next.js + React Three Fiber | Chưa bắt đầu, xem `docs/PLAN.md` (Mốc D) |

## Thư mục

```
assets/models/{high,mid,low}/*.glb   model đã xử lý (high 50k tam giác, mid 15k, low 3k)
docs/PLAN.md                         kế hoạch dựng bản thật
docs/MODELS.md                       danh sách model, vị trí đặt, số liệu
docs/ASSETS.md                       danh sách model phụ trợ cần tải, quy tắc giấy phép
docs/storyboard/*.png                khung hình storyboard (máy tính và điện thoại)
prototype/fly/                       bản bay liên tục: app.js (cảnh + máy quay), page.html (giao diện + nội dung CV)
prototype/storyboard-scene/          cảnh tĩnh dùng để chụp storyboard
prototype/quick-cv/                  trang CV nhanh
prototype/model-viewer/              trang xem từng model theo mức
assets/textures/                     normal map mặt nước, ảnh impostor của cây
tools/                               xử lý model (gltf-transform, meshoptimizer, sharp) và chụp thử bằng Playwright
tools/trees/                         sinh cây bằng EZ-Tree (`npm run trees`)
```

## Chạy bản bay thử

```bash
cd tools && npm install            # three, gltf-transform, playwright...
node ../prototype/fly/build.mjs    # tạo prototype/fly/dist
cd ../prototype/fly/dist && python3 -m http.server 8770
```

Mở `http://localhost:8770/_local.html`. Thêm `?tier=low` hoặc `?tier=mid` để ép mức hiển thị, `?time=17:20` để xem một giờ cố định, `?rain=0.8` để xem mưa.

Chụp kiểm tra (cần server ở trên đang chạy):

```bash
cd prototype/fly
node shots.mjs desktop overview,dive1,s01,s05,end
node shots.mjs phone overview,s01
```

Nếu Playwright báo không tìm thấy trình duyệt (phiên bản lệch với Chromium có sẵn), chỉ đường dẫn bằng `CHROME_PATH=/đường/dẫn/chrome node shots.mjs ...`.

Tên khung có sẵn: `overview`, `dive1`, `dive2`, `s01`…`s11`, `dragon`, `hoian`, `between`, `rise`, `end`. Ảnh lưu vào `prototype/fly/shots/`.

## Tiếp tục trong Claude Code (cloud session)

Mở repo này trong claude.ai/code (hoặc mục Code trong app desktop, chọn Cloud) rồi giao việc. Ví dụ:

> Đọc README.md và docs/PLAN.md. Hoàn thiện prototype/fly: chụp lại tất cả các khung bằng shots.mjs, sửa những chỗ hình bị lỗi (model lơ lửng, camera xuyên vật thể, panel che công trình), rồi commit.

> Đọc docs/PLAN.md và bắt đầu Mốc 1: dựng project Next.js 16 + React Three Fiber trong thư mục `web/`, chuyển đường bay, địa hình và nội dung từ prototype/fly sang component.

## Ghi chú

- File gốc từ Meshy (0,2 đến 5,6 triệu tam giác mỗi file, khoảng 1,3 GB) không đưa lên repo. Muốn xuất lại thì để chúng vào một thư mục rồi chạy `tools/run_all.sh <thư mục>`.
- Bản bay thử nạp model dạng base64 (`.txt`) vì nơi xem thử không phục vụ được file `.glb`. Bản thật sẽ dùng `.glb` nén meshopt + KTX2.
