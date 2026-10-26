# Model cần tải

Model địa danh (cột cờ, lăng Bác, Cầu Vàng…) giữ bản làm bằng Meshy. File này là **đồ phụ trợ quanh địa danh**: xe, thuyền, nhà, cây, đồ đường phố. Mục đích là để mỗi địa danh đứng trong khung cảnh thật.

## Quy tắc khi tải

| | Lấy | Tránh |
|---|---|---|
| Giấy phép | **CC0**, hoặc **CC BY** (dùng được, chỉ cần ghi tên tác giả) | CC BY-NC, CC BY-ND, "Standard" hay "Editorial" của Sketchfab, bản quyền không rõ |
| Định dạng | **glTF / GLB** (trên Sketchfab: *Download 3D Model → glTF*). Có texture đi kèm. | Chỉ có `.blend`, `.max`, `.c4d` |
| Kiểu | Chân thật hoặc bán chân thật, cùng tông với nhau | Hoạt hình, low-poly màu phẳng (trừ khi không còn lựa chọn) |
| Độ nặng | Không cần quá lo, mình tự giảm. Một vật nên dưới 100k tam giác. | Model scan 1–5 triệu tam giác cho một vật nhỏ |

**Mỗi model một thư mục**, kèm file `nguon.txt` gồm 3 dòng: link trang tải, tên tác giả, giấy phép.

```
assets/incoming/models/<nhóm>/<tên>/
  scene.gltf (hoặc .glb), scene.bin, textures/...
  nguon.txt
```

Nhóm: `xe`, `thuyen`, `nha`, `cay`, `duong-pho`, `chang-01` … `chang-11` (đồ riêng của từng chặng).

## Tìm ở đâu

- **Sketchfab** (nhiều nhất, có đồ Việt Nam): https://sketchfab.com/search?features=downloadable&type=models&q=sampan
  Ở cột lọc bên trái chọn *License*: **CC0** và **CC Attribution**. Đổi chữ sau `q=` để tìm thứ khác.
- **Poly Haven**, CC0, chân thật nhưng ít đồ: https://polyhaven.com/models
- **Poly Pizza**, CC0 hoặc CC BY, low-poly, chỉ dùng cho vật nhỏ ở xa: https://poly.pizza
- **Kenney**, CC0, phong cách hoạt hình, chỉ dùng khi không còn cách khác: https://kenney.nl/assets

## Danh sách

Đánh dấu `[x]` khi đã tải. Cột "Từ khóa" là gợi ý để gõ vào ô tìm kiếm.

### Ưu tiên 1: dùng chung cho nhiều chặng

| | Thứ | Số loại | Từ khóa | Dùng ở |
|---|---|---|---|---|
| [ ] | Xe máy | 2–3 (xe số, tay ga, Vespa) | `honda wave`, `honda dream`, `scooter`, `vespa`, `motorbike` | Hà Nội, Đà Nẵng, Sài Gòn |
| [ ] | Ô tô con, taxi | 2 | `sedan car`, `taxi`, `toyota vios` | Đà Nẵng, Sài Gòn |
| [ ] | Xe buýt | 1 | `city bus` | Sài Gòn |
| [ ] | Thuyền gỗ nhỏ, xuồng | 2 | `sampan`, `wooden rowing boat`, `vietnamese boat` | Hạ Long, Huế, Hội An, Miền Tây |
| [ ] | Thuyền đánh cá | 2 | `fishing boat`, `vietnamese fishing boat`, `trawler` | Nha Trang, Phan Thiết, Cà Mau |
| [ ] | Nhà ống, nhà phố | 2–3 | `shophouse`, `asian shop house`, `vietnamese house`, `tube house` | Hà Nội, Hội An, Sài Gòn |
| [ ] | Đèn đường cổ | 1–2 | `vintage street lamp`, `street light` | Hà Nội, Sài Gòn, Đà Nẵng |
| [ ] | Bụi tre | 1–2 | `bamboo` | Lũng Cú, Huế, Miền Tây |
| [ ] | Cây dừa | 2 | `coconut palm` | Nha Trang, Phan Thiết, Miền Tây |
| [ ] | Dừa nước | 1 | `nipa palm` | Miền Tây, Cà Mau |
| [ ] | Người đi bộ (nhẹ, nếu có) | 3–5 | `low poly people`, `pedestrian` | Phố, chợ |

### Ưu tiên 2: theo chặng

| | Chặng | Thứ | Từ khóa |
|---|---|---|---|
| [ ] | 01 Lũng Cú | Nhà đất, nhà trình tường mái ngói | `rammed earth house`, `mountain village house`, `asian village house` |
| [ ] | 01 Lũng Cú | Tường rào đá, bậc đá | `stone wall`, `stone stairs` |
| [ ] | 02 Hà Nội | Liễu rủ | `weeping willow` |
| [ ] | 02 Hà Nội | Cây đa | `banyan tree` |
| [ ] | 02 Hà Nội | Xích lô | `cyclo`, `rickshaw`, `pedicab` |
| [ ] | 02 Hà Nội | Ghế đá công viên | `park bench` |
| [ ] | 03 Hạ Long | Tàu du lịch nhiều tầng | `cruise boat`, `junk boat`, `river cruise` |
| [ ] | 03 Hạ Long | Nhà bè, làng chài nổi | `floating house`, `floating village`, `house boat` |
| [ ] | 03 Hạ Long | Kayak | `kayak` |
| [ ] | 04 Huế | Thuyền rồng | `dragon boat` |
| [ ] | 04 Huế | Cổng chùa, cổng tam quan | `pagoda gate`, `asian temple gate` |
| [ ] | 04 Huế | Sen | `lotus` |
| [ ] | 05 Đà Nẵng, Hội An | Cáp treo | `cable car`, `gondola lift` |
| [ ] | 05 Đà Nẵng, Hội An | Hoa giấy | `bougainvillea` |
| [ ] | 05 Đà Nẵng, Hội An | Đèn lồng | `lantern`, `chinese lantern`, `hoi an lantern` |
| [ ] | 05 Đà Nẵng, Hội An | Nhà cao tầng hiện đại | `modern building`, `apartment building`, `hotel building` |
| [ ] | 06 Tây Nguyên | Voi | `elephant` |
| [ ] | 06 Tây Nguyên | Nhà dài, nhà sàn | `longhouse`, `stilt house` |
| [ ] | 06 Tây Nguyên | Cây cà phê | `coffee plant` |
| [ ] | 06 Tây Nguyên | Thuyền độc mộc | `dugout canoe` |
| [ ] | 07 Nha Trang | Dù, ghế bãi biển | `beach umbrella`, `beach chair` |
| [ ] | 07 Nha Trang | Khách sạn ven biển | `hotel`, `resort building` |
| [ ] | 08 Phan Thiết | Thanh long | `dragon fruit`, `pitaya plant`, `cactus` |
| [ ] | 08 Phan Thiết | Tháp Chăm (nếu có) | `cham tower`, `champa` |
| [ ] | 09 Sài Gòn | Xe đẩy hàng rong | `street food cart`, `food cart` |
| [ ] | 09 Sài Gòn | Ghế nhựa, bàn | `plastic chair`, `plastic stool` |
| [ ] | 09 Sài Gòn | Tòa nhà cao tầng | `skyscraper`, `office tower` |
| [ ] | 09 Sài Gòn | Phà, tàu sông | `ferry`, `river boat` |
| [ ] | 10 Miền Tây | Trái cây, sạp hàng | `fruit crate`, `market stall` |
| [ ] | 11 Mũi Cà Mau | Cây đước có rễ | `mangrove` |
| [ ] | 11 Mũi Cà Mau | Cầu gỗ đi bộ | `wooden boardwalk`, `wooden pier` |

### Texture còn thiếu (Poly Haven, 1K, như đợt trước)

| | Thứ | Ghi chú |
|---|---|---|
| [ ] | Vách đá đứng lặp được | Trang có `/textures/` chứ không phải `/models/` |
| [ ] | Ruộng lúa, cỏ xanh | Cho ruộng bậc thang và đồng Miền Tây |
| [ ] | Đất đỏ bazan | Tây Nguyên. Từ khóa `red soil`, `red dirt` |
| [ ] | Gạch đỏ, ngói âm dương | Nhà cổ, Hội An. Từ khóa `roof tiles`, `red brick` |
| [ ] | Đường nhựa, vỉa hè | Phố. Từ khóa `asphalt`, `pavement`, `sidewalk` |

### Địa danh còn thiếu (Meshy)

| | Thứ | Ghi chú |
|---|---|---|
| [ ] | Chùa Cầu | Bắt buộc (Hội An là chặng hiện tại) |
| [ ] | Nhà thờ Đức Bà | Sài Gòn |
| [ ] | Bưu điện Thành phố | Sài Gòn |
| [ ] | Chợ Bến Thành | Làm lại màu (Retexture) |

Tải xong một nhóm là push được ngay, không cần đợi đủ cả danh sách. Mình xử lý theo từng đợt.
