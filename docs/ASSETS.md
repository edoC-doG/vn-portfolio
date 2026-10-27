# Asset cần tải

Thứ tự làm: **1. Texture** → **2. Model địa danh (Meshy)** → **3. Model phụ trợ** (xe, thuyền, nhà, cây, đồ đường phố).

Tải xong nhóm nào thì push nhóm đó, không cần đợi đủ danh sách. Đánh dấu `[x]` khi đã có.

---

## 1. Texture

### Texture lặp được và texture của mô hình 3D

Chỉ **texture lặp được** (tileable, seamless) mới phủ được lên núi, đất, tường: ảnh lặp lại liên tục mà không thấy đường nối.

**Texture của mô hình 3D** (ví dụ `rock_face_01`, `rock_face_02` đã tải) là ảnh của **một vật cụ thể** bị cắt ra nhiều mảnh rồi xếp lên một tấm. Phần trống giữa các mảnh được kéo giãn thành vệt. Phủ lên núi sẽ thấy các ô vuông lặp lại và các vệt kéo giãn, nên không dùng làm texture được.

Mô hình đó vẫn có ích **dưới dạng mô hình**: tải bản **glTF** của `rock_face_01/02` thì mình đặt được như những khối vách đá thật ở Hà Giang và Hạ Long (xem mục 3).

![Texture của mô hình 3D và texture lặp được](texture-lap-va-texture-mo-hinh.png)

Cách nhận ra khi tải:
- Chỉ chọn từ **trang danh sách texture**: https://polyhaven.com/textures. Trang chi tiết của texture và của mô hình đều có link dạng `/a/<tên>`, nên nhìn link không phân biệt được.
- Mở ảnh `_diff_`. Nếu nó trông như **nhiều mảnh ghép, có vệt màu kéo giãn** thì đó là texture của mô hình.

### Nguồn (đều CC0, dùng tự do, không cần ghi công)

| Nguồn | Link | Ghi chú |
|---|---|---|
| Poly Haven | https://polyhaven.com/textures | Chân thật nhất. Chọn **1K**. |
| ambientCG | https://ambientcg.com/list?type=material | Nhiều loại Poly Haven không có (ngói, mái tôn, mái lá, vữa, gạch lát). Chọn bản **1K-JPG**. Mọi "material" ở đây đều lặp được. |
| cgbookcase | https://www.cgbookcase.com/textures | Nguồn thứ ba nếu hai nguồn trên thiếu. |

Mỗi texture chỉ cần **ảnh màu** (`diff`, `color`, `albedo`) và **normal** (`nor_gl` hoặc `NormalGL`). Tải nguyên file zip cũng được, có thừa file hay normal dạng `.exr` cũng không sao.

### Đặt vào repo

```
assets/incoming/<nhóm>/<tên asset giữ nguyên>/
```

Nhóm: `rock`, `ground`, `grass`, `sand`, `road`, `wall`, `roof`, `wood`, `metal`. Mỗi loại con nên có **1–3 ứng viên**; mình ghép thử vào cảnh, chụp ảnh để bạn chọn. Không cần ghi mã loại con, mình tự nhận ra từ ảnh.

### Danh sách theo loại

Cách tìm: gõ **tên tiếng Anh** trước (1–2 từ là đủ, các trang này tìm theo nhãn). Không ra kết quả ưng ý thì thử lần lượt các **từ đồng nghĩa**.

⭐ = cần cho hai chặng làm chi tiết trước (Đà Nẵng, Hội An và Sài Gòn).

**A. Đá** (`rock`)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [ ] | A1. Vách đá vôi xám | **limestone cliff** | cliff, cliff side, rock wall, rocky cliff, limestone, karst | Núi Hà Giang, đảo Hạ Long, đảo Nha Trang |
| [x] | A2. Đá lẫn rêu cỏ | aerial rocks | mossy rock, rocky ground | đã có `aerial_rocks_02` |
| [ ] | A3. Đá tảng granite | **granite rock** | granite, boulder, coastal rocks, rocky coast, stone | Đồi Cù Lao (Ponagar), ghềnh đá ven biển |
| [ ] | A4. Sỏi, đá cuội | **gravel** | pebbles, river pebbles, river rocks, cobbles, shingle, stones | Lòng suối, thác Tây Nguyên, bờ kè |

**B. Đất** (`ground`)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [x] | B1. Đất rừng lá mục | forest floor | forest leaves, leaf litter | đã có `forest_leaves_02` |
| [x] | B2. Đất bùn lốm đốm cỏ | muddy ground | brown mud, mud with leaves | đã có `brown_mud_leaves_01` |
| [ ] | B3. Đất đỏ bazan | **red soil** | red dirt, red earth, red clay, laterite, red mud | Tây Nguyên, rẫy cà phê |
| [ ] | B4. Bùn ướt bãi bồi | **wet mud** | mud flat, mudflat, river mud, muddy ground, swamp mud, silt | Rừng đước Cà Mau, ven sông Miền Tây |
| [ ] | B5. Đường đất nện | **dirt path** | dirt road, packed earth, dry ground, dry dirt, trail, rocky trail | Bản Lô Lô Chải, buôn Tây Nguyên |

**C. Cỏ, ruộng** (`grass`)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [ ] | C1. Cỏ xanh cắt ngắn | **lawn grass** | short grass, mowed grass, grass, turf, green grass | 168 ô cỏ Ba Đình, công viên |
| [ ] | C2. Cỏ dại, cỏ khô | **dry grass** | wild grass, meadow, dead grass, patchy grass, savanna | Sườn đồi Phan Thiết, Lũng Cú mùa khô |
| [ ] | C3. Ruộng lúa, mạ non | **rice paddy** | rice field, paddy field, crop field, farmland, young rice, seedlings | Ruộng bậc thang, đồng Miền Tây. Nếu không có, mình làm bằng shader và cây lúa 3D. |
| [x] | Bảng ngọn cỏ trong suốt | grass blades atlas | grass cards, grass alpha | đã có `grass_bermuda_01` (dùng trồng cỏ 3D) |

**D. Cát** (`sand`)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [x] | D1. Cát ướt bờ biển | wet sand | beach sand, aerial beach | đã có `aerial_beach_02` |
| [ ] | D2. Cát khô trắng mịn | **white sand** | dry sand, fine sand, beach sand, dune sand | Đồi cát trắng Mũi Né, bãi biển Nha Trang |
| [ ] | D3. Cát đỏ cam | **red sand** | orange sand, desert sand, sand dunes | Đồi cát đỏ Mũi Né |

**E. Đường, vỉa hè** (`road`)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [ ] ⭐ | E1. Đường nhựa | **asphalt** | road, tarmac, street, asphalt road, worn asphalt | Sài Gòn, Đà Nẵng, Hà Nội |
| [ ] ⭐ | E2. Vỉa hè lát gạch | **paving stones** | pavement, sidewalk, paving tiles, concrete tiles, brick paving | Sài Gòn, Hà Nội, ven sông Hàn |
| [ ] ⭐ | E3. Đường lát đá, gạch cổ | **cobblestone** | stone pavement, flagstone, cobble street, old brick floor, terracotta floor tiles | Phố cổ Hội An, Huế, bậc đá Lũng Cú |
| [ ] | E4. Bê tông | **concrete** | concrete floor, cement, concrete slab | Bến thuyền, kè, cầu |

**F. Tường** (`wall`)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [ ] ⭐ | F1. Tường vữa cũ loang lổ | **old plaster wall** | plaster, stucco, painted plaster, weathered plaster, limewash, peeling paint wall | Nhà vàng Hội An (màu vàng mình chỉnh bằng code, chỉ cần vữa sáng màu) |
| [ ] ⭐ | F2. Gạch đỏ | **red brick** | brick wall, bricks, old bricks, clay bricks | Nhà thờ Đức Bà, nhà cổ |
| [ ] | F3. Tường đất trình tường | **rammed earth** | adobe, clay wall, mud wall, earthen wall, cob wall | Nhà Lô Lô Chải, Lũng Cú |
| [ ] | F4. Tường đá xếp | **dry stone wall** | stone wall, rubble wall, fieldstone wall, rock wall | Rào đá Hà Giang, chân tháp Chăm |
| [ ] ⭐ | F5. Vữa trắng xám nhà phố | **white plaster** | concrete wall, cement wall, painted concrete, facade | Nhà ống Sài Gòn, Hà Nội |

**G. Mái** (`roof`)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [ ] ⭐ | G1. Ngói đất nung | **clay roof tiles** | roof tiles, roofing tiles, terracotta tiles, Chinese roof tiles, barrel tiles, pantiles | Hội An, Huế, phố cổ Hà Nội, nhà Lô Lô Chải |
| [ ] | G2. Mái tôn | **corrugated metal** | corrugated iron, corrugated steel, metal roof, tin roof, sheet metal | Nhà phố, nhà sàn Miền Tây |
| [ ] | G3. Mái lá, mái tranh | **thatch** | thatched roof, straw roof, palm leaf roof, nipa roof, reed, straw | Nhà rông, nhà sàn, nhà Miền Tây |

**H. Gỗ, tre** (`wood`)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [ ] ⭐ | H1. Ván gỗ cũ | **weathered wood planks** | wood planks, old planks, wooden floor, boardwalk, driftwood | Cầu gỗ Cà Mau, sàn nhà bè Hạ Long, bến Hội An |
| [ ] ⭐ | H2. Gỗ sơn tróc | **painted wood** | peeling paint, chipped paint, old painted planks, weathered painted wood | Thuyền, cửa gỗ nhà Hội An |
| [ ] | H3. Tre, phên tre đan | **woven bamboo** | bamboo, wicker, rattan, basket weave, bamboo mat | Vách nhà, thuyền thúng |

**I. Kim loại** (`metal`, ít ưu tiên)

| | Loại | Tên tiếng Anh | Từ đồng nghĩa để tìm | Dùng ở |
|---|---|---|---|---|
| [ ] | I1. Sắt gỉ | **rusty metal** | rust, corroded metal, rusted steel | Cầu, thuyền, mái tôn cũ |

---

## 2. Model địa danh (Meshy)

Tên tiếng Anh dùng để viết prompt cho Meshy, hoặc tìm ảnh tham khảo và model có sẵn trên Sketchfab.

| | Thứ | Tên tiếng Anh | Tên khác để tìm | Ghi chú |
|---|---|---|---|---|
| [ ] | Chùa Cầu | **Japanese Covered Bridge, Hoi An** | Japanese Bridge Hoi An, Chua Cau, covered bridge pagoda | **Quan trọng nhất**: Hội An là chặng hiện tại |
| [ ] | Nhà thờ Đức Bà | **Saigon Notre-Dame Cathedral** | Notre-Dame Cathedral Basilica of Saigon, Saigon cathedral, red brick cathedral | Sài Gòn |
| [ ] | Bưu điện Thành phố | **Saigon Central Post Office** | Ho Chi Minh City post office, colonial post office | Sài Gòn |
| [ ] | Chợ Bến Thành | **Ben Thanh Market** | Ben Thanh market clock tower, Saigon market | Làm lại màu (Retexture) |

---

## 3. Model phụ trợ

### Quy tắc

| | Lấy | Tránh |
|---|---|---|
| Giấy phép | **CC0**, hoặc **CC BY** (chỉ cần ghi tên tác giả) | CC BY-NC (cấm thương mại), CC BY-ND (cấm chỉnh sửa), "Standard" hay "Editorial" của Sketchfab |
| Định dạng | **glTF / GLB**, có texture đi kèm | Chỉ có `.blend`, `.max`, `.c4d` |
| Kiểu | Chân thật hoặc bán chân thật, cùng tông | Hoạt hình, low-poly màu phẳng (trừ vật nhỏ ở xa) |
| Độ nặng | Một vật nên dưới 100k tam giác, mình tự giảm thêm | Model scan 1–5 triệu tam giác cho một vật nhỏ |

**Mỗi model một thư mục**, kèm file `nguon.txt` gồm 3 dòng: link trang tải, tên tác giả, giấy phép.

```
assets/incoming/models/<nhóm>/<tên>/
  scene.gltf (hoặc .glb), scene.bin, textures/...
  nguon.txt
```

Nhóm: `xe`, `thuyen`, `nha`, `cay`, `duong-pho`, `da` (vách đá, tảng đá), `chang-01` … `chang-11`.

### Tìm ở đâu

| Nguồn | Link | Giấy phép | Dùng cho |
|---|---|---|---|
| **Sketchfab** | https://sketchfab.com/search?features=downloadable&type=models&q=honda+wave | Lọc **License** ở cột trái: chọn *CC0* và *CC Attribution* | **Nguồn chính.** Nhiều nhất, có cả đồ Việt Nam: xe máy Honda, thuyền thúng, xích lô, nón lá. Cần tạo tài khoản miễn phí để tải. Khi tải chọn **glTF**. Đổi chữ sau `q=` để tìm thứ khác, thử thêm `vietnam`, `vietnamese`, `hoi an`, `saigon`. |
| **Poly Haven** | https://polyhaven.com/models | CC0 | Chân thật, ít đồ: đá, cây, bụi, đồ vật. `rock_face_01/02` bản glTF nằm ở đây. |
| **Poly Pizza** | https://poly.pizza | CC0 / CC BY (ghi trên từng model) | Low-poly, chỉ cho vật nhỏ ở xa. |
| **Quaternius** | https://quaternius.com | CC0 | Bộ thiên nhiên, xe cộ, kiểu đơn giản. |
| **Kenney** | https://kenney.nl/assets | CC0 | Hoạt hình, chỉ dùng khi hết cách. |

Trên Sketchfab, giấy phép ghi ở cột phải trang model (dòng "License"). Kiểm tra trước khi tải, vì kết quả tìm kiếm đôi khi lẫn model không cho tải hoặc có giấy phép khác.

Bỏ qua Fab (Megascans), CGTrader, TurboSquid, BlenderKit: giấy phép phức tạp hoặc không cho đưa file gốc lên một trang web công khai.

### Danh sách

Tên tiếng Anh in đậm là từ nên gõ trước. Tên riêng (Honda Wave, Toyota Vios…) cho ra đúng mẫu xe Việt Nam; không có thì dùng từ chung (underbone motorcycle, sedan…).

**Ưu tiên 1: dùng chung cho nhiều chặng**

| | Thứ | Tên tiếng Anh | Từ đồng nghĩa để tìm | Số loại | Dùng ở |
|---|---|---|---|---|---|
| [ ] | Xe máy số | **Honda Wave** | Honda Dream, Honda Super Cub, underbone motorcycle, moped, motorbike | 1–2 | Hà Nội, Đà Nẵng, Sài Gòn |
| [ ] | Xe tay ga | **scooter** | Honda Vision, Honda Air Blade, Honda Lead, Vespa, motor scooter | 1–2 | Hà Nội, Đà Nẵng, Sài Gòn |
| [ ] | Ô tô con, taxi | **sedan** | taxi, compact car, hatchback, Toyota Vios, Hyundai i10, Kia Morning, VinFast | 2 | Đà Nẵng, Sài Gòn |
| [ ] | Xe buýt | **city bus** | public bus, transit bus, bus | 1 | Sài Gòn |
| [ ] | Thuyền gỗ nhỏ, xuồng, đò | **sampan** | wooden rowboat, rowing boat, small wooden boat, Vietnamese boat, longtail boat, canoe | 2 | Hạ Long, Huế, Hội An, Miền Tây |
| [ ] | Thuyền thúng | **basket boat** | coracle, round boat, Vietnamese basket boat, thung chai | 1 | Hội An, Nha Trang, Phan Thiết |
| [ ] | Thuyền đánh cá | **fishing boat** | wooden fishing boat, Vietnamese fishing boat, trawler, squid fishing boat, junk | 2 | Nha Trang, Phan Thiết, Cà Mau |
| [ ] | Nhà ống, nhà phố | **shophouse** | tube house, Asian townhouse, row house, narrow house, Vietnamese house, Chinese shophouse, Hoi An house | 2–3 | Hà Nội, Hội An, Sài Gòn |
| [ ] | Đèn đường cổ | **vintage street lamp** | street light, lamp post, lamppost, Victorian street lamp, old street light | 1–2 | Hà Nội, Sài Gòn, Đà Nẵng |
| [ ] | Bụi tre | **bamboo** | bamboo grove, bamboo cluster, bamboo plant, bamboo stalks | 1–2 | Lũng Cú, Huế, Miền Tây |
| [ ] | Cây dừa | **coconut palm** | coconut tree, palm tree, tropical palm | 2 | Nha Trang, Phan Thiết, Miền Tây |
| [ ] | Dừa nước | **nipa palm** | Nypa fruticans, mangrove palm, water palm | 1 | Miền Tây, Cà Mau |
| [ ] | Vách đá, tảng đá | **rock face** (Poly Haven, bản glTF) | cliff, rock formation, boulder, limestone rock, karst, rock scan | 2–3 | Hà Giang, Hạ Long, Nha Trang |
| [ ] | Người đi bộ (nhẹ, nếu có) | **low poly people** | pedestrian, crowd, walking man, Asian woman, character | 3–5 | Phố, chợ |
| [ ] | Nón lá | **Vietnamese conical hat** | non la, Asian conical hat, rice hat, bamboo hat | 1 | Đi kèm người, thuyền |

**Ưu tiên 2: theo chặng**

| | Chặng | Thứ | Tên tiếng Anh | Từ đồng nghĩa để tìm |
|---|---|---|---|---|
| [ ] | 01 Lũng Cú | Nhà đất trình tường mái ngói | **rammed earth house** | adobe house, mud house, mountain village house, Hmong house, Asian village house, tile roof house |
| [ ] | 01 Lũng Cú | Tường rào đá | **dry stone wall** | stone wall, stone fence, rock wall |
| [ ] | 01 Lũng Cú | Bậc đá | **stone stairs** | stone steps, rock stairs |
| [ ] | 01 Lũng Cú | Hoa tam giác mạch | **buckwheat flowers** | pink wildflowers, flower patch, flower field |
| [ ] | 02 Hà Nội | Liễu rủ | **weeping willow** | willow tree |
| [ ] | 02 Hà Nội | Cây đa | **banyan tree** | ficus, fig tree, tree with aerial roots, old tree |
| [ ] | 02 Hà Nội | Xích lô | **cyclo** | pedicab, cycle rickshaw, trishaw, bicycle rickshaw |
| [ ] | 02 Hà Nội | Ghế đá công viên | **park bench** | stone bench, bench |
| [ ] | 03 Hạ Long | Tàu du lịch nhiều tầng | **Ha Long Bay cruise** | junk boat, Chinese junk, cruise boat, tourist boat, river cruise |
| [ ] | 03 Hạ Long | Nhà bè, làng chài nổi | **floating house** | floating village, fish farm raft, houseboat, floating hut |
| [ ] | 03 Hạ Long | Kayak | **kayak** | sea kayak, canoe |
| [ ] | 03 Hạ Long | Phao nuôi trai | **fishing buoys** | buoy, floats, net floats |
| [ ] | 04 Huế | Thuyền rồng | **dragon boat** | Chinese dragon boat, dragon head boat, Hue dragon boat |
| [ ] | 04 Huế | Cổng chùa, cổng tam quan | **temple gate** | pagoda gate, Chinese gate, paifang, Asian gate |
| [ ] | 04 Huế | Sen | **lotus** | lotus flower, lotus leaf, lotus pond, water lily |
| [ ] | 05 Đà Nẵng, Hội An | Cáp treo | **cable car** | gondola lift, aerial tramway, cable car cabin |
| [ ] | 05 Đà Nẵng, Hội An | Hoa giấy | **bougainvillea** | flowering vine, climbing plant, flower bush |
| [ ] | 05 Đà Nẵng, Hội An | Đèn lồng | **paper lantern** | Chinese lantern, silk lantern, Hoi An lantern, lantern |
| [ ] | 05 Đà Nẵng, Hội An | Nhà cao tầng hiện đại | **apartment building** | modern building, high-rise, hotel, condominium, residential tower |
| [ ] | 06 Tây Nguyên | Voi | **Asian elephant** | elephant |
| [ ] | 06 Tây Nguyên | Nhà dài, nhà sàn | **stilt house** | longhouse, wooden stilt house, tribal house, jungle hut |
| [ ] | 06 Tây Nguyên | Cây cà phê | **coffee plant** | coffee tree, coffee shrub, coffee bush |
| [ ] | 06 Tây Nguyên | Thuyền độc mộc | **dugout canoe** | log canoe, wooden canoe |
| [ ] | 07 Nha Trang | Dù bãi biển | **beach umbrella** | parasol, sun umbrella |
| [ ] | 07 Nha Trang | Ghế bãi biển | **sun lounger** | beach chair, deck chair |
| [ ] | 07 Nha Trang | Khách sạn ven biển | **beach hotel** | hotel, resort, seaside building |
| [ ] | 08 Phan Thiết | Thanh long | **dragon fruit plant** | dragon fruit, pitaya, Hylocereus, climbing cactus |
| [ ] | 08 Phan Thiết | Tháp Chăm (nếu có) | **Cham tower** | Champa temple, Po Sah Inu, brick temple, Hindu temple |
| [ ] | 09 Sài Gòn | Xe đẩy hàng rong | **street food cart** | food cart, hawker cart, vendor cart, noodle cart |
| [ ] | 09 Sài Gòn | Ghế nhựa, bàn nhựa | **plastic stool** | plastic chair, plastic table, street stool |
| [ ] | 09 Sài Gòn | Tòa nhà cao tầng | **skyscraper** | office tower, high-rise, glass building, Bitexco, Landmark 81 |
| [ ] | 09 Sài Gòn | Hàng cây dầu ven đường | **tall tropical tree** | dipterocarp, Dipterocarpus, street tree |
| [ ] | 09 Sài Gòn | Phà, tàu sông | **river ferry** | ferry, passenger ferry, river boat |
| [ ] | 10 Miền Tây | Trái cây, sạp hàng | **fruit stall** | market stall, fruit crate, fruit basket, produce |
| [ ] | 11 Mũi Cà Mau | Cây đước có rễ | **mangrove tree** | mangrove, mangrove roots, Rhizophora, stilt roots |
| [ ] | 11 Mũi Cà Mau | Cầu gỗ đi bộ | **wooden boardwalk** | wooden pier, jetty, wooden walkway, dock |
