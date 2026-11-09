# Model

Mọi model đã được chuẩn hóa:
- Cạnh dài nhất bằng 1, tâm nằm trên trục x/z, đáy chạm y = 0.
- Mặt trước nhìn về +z.
- Texture WebP, không có map kim loại/độ nhám. Mặc định roughness 0,85, metallic 0. Riêng cồng chiêng metallic 0,55, roughness 0,45.

Khi đặt vào cảnh, hướng xoay được cộng thêm góc để mặt trước nhìn về phía máy quay đang tới.

## Số liệu sau xử lý

Số tam giác / dung lượng ở từng mức:

| slug | Chặng | Gốc (tam giác) | high | mid | low |
|---|---|---|---|---|---|
| cot-co-lung-cu | 01 Lũng Cú | 1.329.732 | 50k / 2,7 MB | 17k / 0,9 MB | 4,9k / 246 KB |
| lang-bac | 02 Hà Nội | 563.394 | 50k / 2,4 MB | 15k / 0,8 MB | 3k / 165 KB |
| thap-rua | 02 Hà Nội | 1.849.655 | 50k / 2,8 MB | 21k / 1,1 MB | 3k / 188 KB |
| thuyen-buom | 03 Hạ Long | 12.693 | 12,7k / 1,1 MB | 12,7k / 0,5 MB | 3k / 163 KB |
| thap-phuoc-duyen | 04 Huế | 2.730.564 | 50k / 2,5 MB | 15k / 0,8 MB | 3k / 185 KB |
| cau-vang | 05 Đà Nẵng | 1.093.652 | 50k / 2,3 MB | 15k / 0,7 MB | 3k / 158 KB |
| thuyen-thung | 05 Hội An, 08 Phan Thiết | 1.282.530 | 50k / 2,2 MB | 15k / 0,7 MB | 3k / 169 KB |
| nha-rong | 06 Tây Nguyên | 5.352.532 | 50k / 2,1 MB | 20k / 0,8 MB | 5,9k / 237 KB |
| cong-chieng | 06 Tây Nguyên | 222.552 | 50k / 2,2 MB | 15k / 0,7 MB | 3k / 180 KB |
| thap-ba-ponagar | 07 Nha Trang | 5.588.068 | 50k / 2,9 MB | 24k / 1,1 MB | 5,8k / 243 KB |
| thap-nuoc-phan-thiet | 08 Phan Thiết | 2.141.582 | 50k / 2,6 MB | 15k / 0,9 MB | 3k / 210 KB |
| cho-ben-thanh | 09 Sài Gòn | 4.232.982 | 80k / 4,3 MB | 24k / 1,1 MB | 3k / 196 KB |
| ghe-cho-noi | 10 Miền Tây | 1.775.290 | 50k / 2,3 MB | 15k / 0,7 MB | 3k / 162 KB |
| mui-ca-mau | 11 Mũi Cà Mau | 526.080 | 50k / 2,1 MB | 15k / 0,7 MB | 3k / 185 KB |

Tổng: low khoảng 2,6 MB, mid khoảng 11 MB, high khoảng 34 MB. Thử nén meshopt thì giảm được khoảng 25% (low 2,15 MB, mid 8,3 MB). Phần lớn dung lượng là texture, nên bước KTX2 sẽ giảm nhiều hơn.

Đang chờ file: `chua-cau` (Hội An), `nha-tho-duc-ba`, `buu-dien-thanh-pho` (Sài Gòn). Chỗ đặt đã có trong `prototype/fly/app.js`. Khi có file, thêm slug vào `AVAILABLE`.

## Cách đặt trong cảnh

`at(chặng, lat, along)`:
- `lat > 0` là bờ phải (phía tây khi đi về nam).
- `along > 0` là xuôi về phía trước.

| Chặng | Model và phần làm bằng code |
|---|---|
| 01 Lũng Cú | Cột cờ (scale 13) trên đồi ruộng bậc thang ở bờ trái. Lá cờ bay bằng shader. Ruộng bậc thang ở bờ phải, đèn bản làng trên sườn núi. |
| 02 Hà Nội | Lăng Bác (20) trên quảng trường Ba Đình, có hai hàng đèn. Hồ Gươm do sông mở rộng thành: Tháp Rùa (6,5) trên gò, đền Ngọc Sơn, cầu Thê Húc đỏ. Cây ven hồ. |
| 03 Hạ Long | Núi đá vôi trên vịnh (instanced, 4 dạng). Ba thuyền buồm (11–14) nhấp nhô. |
| 04 Huế | Tháp Phước Duyên (22) ở bờ phải. Cầu Trường Tiền 6 nhịp, đèn đổi màu. Nón lá có nến bên trong trôi trên sông. |
| 05 Đà Nẵng, Hội An | Cầu Vàng (34) trên đồi. Cầu Rồng: máy quay bay qua gầm cầu. Phố Hội An: nhà vàng mái ngói, dây đèn lồng, hoa đăng trôi, 4 thuyền thúng, chỗ dành cho Chùa Cầu. |
| 06 Tây Nguyên | Nhà rông (17), ba cồng chiêng quanh đống lửa, đồi cà phê (instanced), đom đóm. |
| 07 Nha Trang | Tháp Bà Ponagar (34) trên sườn đồi. Đảo ngoài biển, đèn thuyền câu mực, đèn đường ven biển. |
| 08 Phan Thiết | Tháp nước (18). Đồi cát Mũi Né. Đoàn thuyền thúng trong vịnh. |
| 09 Sài Gòn | Chợ Bến Thành (22). Landmark 81, Bitexco, các tòa nhà (gộp thành 1 mesh, cửa sổ sáng). Đèn ven sông. Chỗ dành cho Nhà thờ Đức Bà và Bưu điện. |
| 10 Miền Tây | 5 ghe chợ nổi có đèn, rặng dừa (instanced), nhà sàn ven sông, cầu khỉ bắc qua kênh nhánh, đom đóm. |
| 11 Mũi Cà Mau | Biểu tượng con tàu (14) trên mũi đất. Rừng đước (instanced). Đèn hải đăng ngoài khơi. |

## Xuất lại từ file gốc

```bash
cd tools && npm install
bash run_all.sh /đường/dẫn/thư-mục-file-meshy
```

`process.mjs` làm lần lượt:
1. Chuẩn hóa kích thước.
2. Giảm tam giác theo đường nối UV (`simplifyWithAttributes`; mức thấp dùng thêm `Permissive`).
3. Nén texture WebP.
4. `quantize`.
5. Xuất ra 3 mức.

## Cây, mặt nước và địa hình (nguồn mở)

| Thành phần | Nguồn | Giấy phép | File |
|---|---|---|---|
| 4 loại cây: sồi, tần bì (rừng lá rộng), thông (Hà Giang, Tây Nguyên), bụi | [EZ-Tree](https://github.com/dgreenheck/ez-tree) của Daniel Greenheck, sinh từ các preset rồi rút gọn. Texture vỏ cây gốc từ Poly Haven và texturecan (CC0). | MIT | `assets/models/{mid,low}/tree-*.glb`, `assets/textures/tree-impostors.png` |
| Normal map mặt nước | three.js `examples/textures/waternormals.jpg` | MIT | `assets/textures/waternormals.jpg` |
| Texture địa hình: đá `aerial_rocks_02`, đất rừng `forest_leaves_02`, ruộng `brown_mud_leaves_01`, cát `aerial_beach_02` | [Poly Haven](https://polyhaven.com) (bản gốc ở `assets/incoming/`) | CC0 | `assets/textures/terrain-*.jpg` (512 px, màu + normal), `terrain.json` |
| Cách trộn các lớp trên địa hình, núi đá vôi | Shader tự viết: đá chiếu 3 phía ở sườn dốc, ruộng ở đất thấp bằng phẳng, đất rừng ở sườn đồi, cát ở mép nước | — | `prototype/fly/app.js` (`natureMaterial`) |

Sinh lại cây (cần Chromium cho Playwright):

```bash
cd tools && npm install
CHROME_PATH=/đường/dẫn/chrome npm run trees
```

`tools/trees/kinds.js` khai báo loại cây và mức chi tiết. Mỗi cây được chuẩn hóa vào khối 1 × 1 × 1, gốc ở y = 0.

| Mức | Tam giác (cành + lá) | Dung lượng |
|---|---|---|
| mid | 3,2k – 5,9k | 200 – 340 KB |
| low | 0,6k – 2,2k | 50 – 125 KB |

Ảnh impostor (`tree-impostors.png`, 2048 × 256) chụp mỗi loại từ trước và từ bên, 256 px mỗi góc.

Cách vẽ rừng trong bản bay thử:
- Khoảng 2.600 cây (mức thấp 1.500). Mật độ theo chặng (`FOREST`), tỉ lệ thông theo chặng (`PINE`), có khoảng trống theo noise.
- Không trồng cây trên công trình, bệ, ruộng bậc thang, các khu bằng phẳng (Ba Đình, phố Hội An) và trên đường nhìn từ máy quay tới công trình của mỗi chặng.
- Cây xa: hai tấm ảnh bắt chéo, mỗi khối địa hình một draw call. Cây gần (trong 56 đơn vị, tối đa 120 cây): mesh thật, chuyển sang bằng dither nên không bị giật. Mức thấp chỉ dùng ảnh.

Xử lý lại texture địa hình (chọn bộ khác thì sửa `tools/textures/terrain.json`):

```bash
cd tools && pip install OpenEXR numpy pillow   # chỉ cần khi normal map là file .exr
node textures/process.mjs
```

Script chia màu texture cho màu trung bình của chính nó, nên texture chỉ thêm chi tiết sáng tối; tông màu từng vùng vẫn lấy từ màu đỉnh của địa hình.

## Khung cảnh quanh các chặng (thư viện)

70 model phụ trợ lấy từ thư viện (`tools/library/props.json`), xử lý thành mức mid và low bằng `tools/library/build_props.sh`, được trải bằng instancing: mỗi loại vật chỉ tốn một lệnh vẽ dù có bao nhiêu bản sao. Vật nào đứng trên đường bay của máy quay, hoặc chắn đường nhìn từ máy quay tới công trình chính, sẽ tự bị loại.

| Chặng | Đã có |
|---|---|
| 01 Lũng Cú | Vách đá, sườn núi đá, tre, tảng đá, hoa tam giác mạch, xóm nhà tường đất mái ngói |
| 02 Hà Nội | Đường ven hồ có xe máy, ô tô, xe khách chạy; cây đa; đèn đường; chùa Một Cột; Khuê Văn Các; dãy nhà ống phố cổ có dây điện và xe máy đỗ |
| 03 Hạ Long | Thêm tàu buồm, phao, kayak, thuyền gỗ, làng chài nổi |
| 04 Huế | Thuyền đuôi dài (chờ thuyền rồng), đò, sen, cổng chùa, Ngọ Môn dựng bằng code |
| 05 Đà Nẵng, Hội An | Đường ven sông Hàn có xe chạy, hàng nhà kính, cáp treo lên Cầu Vàng; phố Hội An lát gạch, xe máy đỗ, chuối, dừa, đèn lồng, thuyền, rổ; nhà Hội An phủ texture vữa và ngói rêu |
| 06 Tây Nguyên | Nhà sàn mái lá, voi, chuối, dương xỉ, thác nước |
| 07 Nha Trang | Đường ven biển, hàng dừa, dù và ghế bãi biển, tòa nhà khách sạn, thuyền đánh cá, vách đá biển |
| 08 Phan Thiết | Ruộng thanh long trên trụ, thuyền đánh cá, dừa |
| 09 Sài Gòn | Landmark 81; Nhà thờ Đức Bà (bản Sketchfab); đường đông xe máy, ô tô, xe buýt; vỉa hè có xe đẩy, ghế nhựa, cây; cột điện và dây điện; dãy nhà phố có cửa cuốn và cục nóng điều hòa; tòa văn phòng; phà qua sông |
| 10 Miền Tây | Nhà sàn Cần Thơ, xuồng, thuyền đuôi dài, võng, sạp rau, chuối, dừa, dừa nước, ruộng lúa |
| 11 Mũi Cà Mau | Ba loại đước, cầu gỗ, cột mốc tọa độ, thuyền đánh cá, dừa nước |

### Chỗ chừa cho Meshy

Đặt file đúng tên dưới đây vào `assets/models/{mid,low}/` (qua `tools/process.mjs`) là cảnh tự dùng, không phải sửa code.

| Tên file | Ở đâu | Đang tạm dùng |
|---|---|---|
| `chua-cau` | Hội An | (trống) |
| `nha-tho-duc-ba` | Sài Gòn | Bản Sketchfab `nha-tho-duc-ba-sf` |
| `buu-dien-thanh-pho` | Sài Gòn | (trống) |
| `cho-ben-thanh` | Sài Gòn | Bản Meshy cũ, chờ làm lại màu |
| `nha-hoi-an-1`, `nha-hoi-an-2` | Phố Hội An | Khối nhà phủ texture vữa vàng và ngói rêu |
| `nha-ong-ha-noi` | Phố cổ Hà Nội | Dãy nhà ống dựng bằng code |
| `nha-pho-sai-gon` | Phố Sài Gòn | Dãy nhà phố dựng bằng code, có cửa cuốn và cục nóng |
| `cong-tam-quan` | Huế, trước tháp Phước Duyên | Đền kiểu Á Đông (`den-chua`) |
| `ngo-mon` | Huế, bờ bên kia | Ngọ Môn dựng bằng code |
| `xich-lo` | Vỉa hè ven Hồ Gươm, Hà Nội | (trống) |
| `thuyen-rong` | Huế | Thuyền đuôi dài |
| `thuyen-cau-muc` | Nha Trang | Thuyền đánh cá |
| `nha-be` | Hạ Long | Nhà bè dựng bằng code |
