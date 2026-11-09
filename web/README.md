# web: site thật (Next.js 16)

Site của portfolio "Từ Lũng Cú đến Cà Mau": hành trình 3D ở `/vi` và `/en`, CV nhanh ở `/vi/cv` và `/en/cv`.

## Chạy

```bash
npm install
npm run dev        # http://localhost:3000, tự chuyển sang /vi hoặc /en theo ngôn ngữ trình duyệt
npm run build && npm start
npm run lint
npm run typecheck
```

`npm run dev` và `npm run build` chạy `scripts/sync.mjs` trước. Script này:

- chép `../assets/models/{mid,low}/*.glb` vào `public/models/` và `../assets/textures/*` vào `public/textures/`;
- sinh `src/scene/journey.js` (engine 3D) từ `../prototype/fly/app.js`, điền danh sách model, ghi công Sketchfab và
  manifest texture (dùng chung `../prototype/fly/inject.mjs` với bản prototype), và cho engine tải file `.glb` / `.jpg`
  thật thay vì base64.

Ba thứ này do script tạo ra, không commit. **Sửa cảnh 3D thì sửa `prototype/fly/app.js`**, không sửa `journey.js`: cả
prototype lẫn site đều dựng từ file đó.

## Cấu trúc

```
src/proxy.ts                     / và mọi đường dẫn chưa có ngôn ngữ → /vi hoặc /en (theo Accept-Language)
src/app/[lang]/layout.tsx        layout gốc: font (next/font), metadata, Open Graph, hreflang
src/app/[lang]/page.tsx          hành trình 3D
src/app/[lang]/journey.css       giao diện hành trình, chuyển nguyên từ prototype/fly/page.html
src/app/[lang]/cv/page.tsx       CV nhanh (Tailwind + shadcn/ui), in hoặc lưu PDF được
src/app/[lang]/globals.css       Tailwind v4 + token shadcn theo bảng màu đêm của hành trình
src/content/{vi,en}.ts           toàn bộ nội dung, một từ điển mỗi ngôn ngữ; panel hành trình và trang CV cùng đọc
src/components/journey/          panel, thanh trên, HUD, thanh chặng, bảng ghi công, component khởi động engine
src/components/ui/               button, badge, card, separator (shadcn/ui, kiểu new-york)
scripts/sync.mjs                 chép asset, sinh engine
scripts/og.mjs                   chụp ảnh chia sẻ public/og-{vi,en}.jpg từ site đang chạy
```

## Cách trang hành trình chạy

Server render đủ 13 panel bằng ngôn ngữ của route, nên nội dung đọc được và lên được công cụ tìm kiếm ngay cả khi
máy không mở được WebGL. Sau khi trang hiện, `JourneyScene` import engine. Engine tìm phần tử theo id và class
(`#gl`, `#track`, `.panel[data-k]`, `.rail .dot`, `#play`, `#sky`…), bay máy quay theo vị trí cuộn và làm mờ panel.

Mọi link vào và ra khỏi hành trình là thẻ `<a>` thường (tải lại trang), nên engine chỉ khởi động một lần mỗi lần tải
và không cần dọn dẹp. Nút EN / VI là link sang trang ngôn ngữ kia; engine lưu vị trí đang bay vào `sessionStorage`
và bay tiếp đúng chỗ đó sau khi tải lại.

Tham số thử: `?tier=low|mid` ép mức hiển thị, `?time=17:20` giờ cố định, `?rain=0.8` mưa, `?test` chế độ chụp.

## Thêm component shadcn

`components.json` đã cấu hình sẵn. Trên máy có mạng: `npx shadcn@latest add dialog` (registry ui.shadcn.com bị chặn
trong môi trường cloud nên bốn component hiện có được viết tay theo mã nguồn gốc).

## Deploy lên Vercel

- Root Directory: `web`.
- Bật "Include files outside the root directory in the Build Step" (mặc định đã bật), vì `prebuild` đọc `../assets`
  và `../prototype`.
- Biến môi trường `NEXT_PUBLIC_SITE_URL` = tên miền thật (ví dụ `https://longnm.dev`) cho metadata, sitemap và ảnh
  chia sẻ. Thiếu thì dùng địa chỉ production của Vercel.
- Model và texture được cache 1 ngày, làm mới ngầm trong 7 ngày (`next.config.ts`), vì tên file giữ nguyên khi
  thay model Meshy.
