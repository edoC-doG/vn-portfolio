# Asset

| Phần | Tình trạng |
|---|---|
| 1. Texture (51 bộ) | **Xong.** Mình đã chọn và tải từ Poly Haven, ambientCG. |
| 2. Mô hình Poly Haven (33 cái) | **Xong.** Đá, vách núi, cây nhiệt đới, cột điện, dây điện, cục nóng điều hòa, cửa cuốn, ghế nhựa, cầu gỗ… |
| 3. Model Sketchfab (86 link) | **Bạn tải** theo link ở mục 3. Ưu tiên phần ⭐ trước. |
| 4. Meshy | **Bạn làm**: Chùa Cầu, Bưu điện, làm lại màu Chợ Bến Thành (mục 4). |
| 5. Không có model tốt | Mình làm bằng code (mục 5). |

Texture và mô hình ở mục 1, 2 không nằm trong git (khoảng 400 MB). Tải lại bất cứ lúc nào bằng:

```bash
python3 tools/library/fetch.py
```

Danh sách nằm ở `tools/library/library.json`, file ghi nguồn sinh ra ở `assets/library/CREDITS.md`. Tất cả đều CC0.

---

## 1. Texture (xong)

| Nhóm | Texture |
|---|---|
| rock | [Rock059](https://ambientcg.com/view?id=Rock059), [Rock036](https://ambientcg.com/view?id=Rock036), [rock_01](https://polyhaven.com/a/rock_01), [rock_boulder_dry](https://polyhaven.com/a/rock_boulder_dry), [rock_3](https://polyhaven.com/a/rock_3), [dry_river_pebbles](https://polyhaven.com/a/dry_river_pebbles), [river_small_rocks](https://polyhaven.com/a/river_small_rocks) |
| ground | [red_laterite_soil_stones](https://polyhaven.com/a/red_laterite_soil_stones), [red_dirt_mud_01](https://polyhaven.com/a/red_dirt_mud_01), [brown_mud_03](https://polyhaven.com/a/brown_mud_03), [brown_mud_02](https://polyhaven.com/a/brown_mud_02), [dirt](https://polyhaven.com/a/dirt), [grass_path_2](https://polyhaven.com/a/grass_path_2) |
| grass | [Grass004](https://ambientcg.com/view?id=Grass004), [Grass001](https://ambientcg.com/view?id=Grass001), [grass_ground](https://polyhaven.com/a/grass_ground), [sparse_grass](https://polyhaven.com/a/sparse_grass), [leafy_grass](https://polyhaven.com/a/leafy_grass) |
| sand | [aerial_beach_01](https://polyhaven.com/a/aerial_beach_01), [dense_sand](https://polyhaven.com/a/dense_sand), [red_sand](https://polyhaven.com/a/red_sand) |
| road | [asphalt_01](https://polyhaven.com/a/asphalt_01), [concrete_pavers](https://polyhaven.com/a/concrete_pavers), [floor_pavement](https://polyhaven.com/a/floor_pavement), [square_brick_paving](https://polyhaven.com/a/square_brick_paving), [cobblestone_floor_08](https://polyhaven.com/a/cobblestone_floor_08), [concrete_floor_02](https://polyhaven.com/a/concrete_floor_02) |
| wall | [painted_plaster_wall](https://polyhaven.com/a/painted_plaster_wall), [damaged_plaster](https://polyhaven.com/a/damaged_plaster), [red_brick](https://polyhaven.com/a/red_brick), [brick_wall_006](https://polyhaven.com/a/brick_wall_006), [clay_plaster](https://polyhaven.com/a/clay_plaster), [excavated_soil_wall](https://polyhaven.com/a/excavated_soil_wall), [broken_wall](https://polyhaven.com/a/broken_wall), [stone_wall](https://polyhaven.com/a/stone_wall), [white_plaster_02](https://polyhaven.com/a/white_plaster_02), [concrete_wall_008](https://polyhaven.com/a/concrete_wall_008) |
| roof | [roof_09](https://polyhaven.com/a/roof_09), [roof_07](https://polyhaven.com/a/roof_07), [corrugated_iron](https://polyhaven.com/a/corrugated_iron), [rusty_corrugated_iron](https://polyhaven.com/a/rusty_corrugated_iron), [thatch_roof_angled](https://polyhaven.com/a/thatch_roof_angled), [riet_01](https://polyhaven.com/a/riet_01) |
| wood | [weathered_planks](https://polyhaven.com/a/weathered_planks), [brown_planks_03](https://polyhaven.com/a/brown_planks_03), [blue_painted_planks](https://polyhaven.com/a/blue_painted_planks), [green_rough_planks](https://polyhaven.com/a/green_rough_planks), [bamboo_wall_02](https://polyhaven.com/a/bamboo_wall_02), [bamboo_wall](https://polyhaven.com/a/bamboo_wall), [palm_tree_bark](https://polyhaven.com/a/palm_tree_bark) |
| metal | [rust_coarse_01](https://polyhaven.com/a/rust_coarse_01) |

Vì sao không dùng `rock_face_01/02` làm texture: đó là texture của **mô hình 3D**, phủ lặp lên núi sẽ lộ ô vuông và vệt kéo giãn. Bản mô hình của chúng đã có ở mục 2.

![Texture của mô hình 3D và texture lặp được](texture-lap-va-texture-mo-hinh.png)

## 2. Mô hình Poly Haven (xong)

| Nhóm | Mô hình |
|---|---|
| da | [rock_face_01](https://polyhaven.com/a/rock_face_01), [rock_face_02](https://polyhaven.com/a/rock_face_02), [mountainside](https://polyhaven.com/a/mountainside), [coastal_cliff_01](https://polyhaven.com/a/coastal_cliff_01), [boulder_01](https://polyhaven.com/a/boulder_01), [rock_moss_set_01](https://polyhaven.com/a/rock_moss_set_01), [coast_rocks_01](https://polyhaven.com/a/coast_rocks_01) |
| cay | [island_tree_01](https://polyhaven.com/a/island_tree_01), [island_tree_02](https://polyhaven.com/a/island_tree_02), [island_tree_03](https://polyhaven.com/a/island_tree_03), [fern_02](https://polyhaven.com/a/fern_02), [shrub_01](https://polyhaven.com/a/shrub_01), [shrub_02](https://polyhaven.com/a/shrub_02), [pachira_aquatica_01](https://polyhaven.com/a/pachira_aquatica_01), [grass_medium_01](https://polyhaven.com/a/grass_medium_01) |
| duong-pho | [modular_electricity_poles](https://polyhaven.com/a/modular_electricity_poles), [modular_electric_cables](https://polyhaven.com/a/modular_electric_cables), [exterior_aircon_unit](https://polyhaven.com/a/exterior_aircon_unit), [rollershutter_door](https://polyhaven.com/a/rollershutter_door), [street_lamp_01](https://polyhaven.com/a/street_lamp_01), [utility_box_01](https://polyhaven.com/a/utility_box_01), [plastic_monobloc_chair_01](https://polyhaven.com/a/plastic_monobloc_chair_01), [plastic_crate_01](https://polyhaven.com/a/plastic_crate_01), [CoffeeCart_01](https://polyhaven.com/a/CoffeeCart_01), [planter_pot_clay](https://polyhaven.com/a/planter_pot_clay) |
| cho-ben | [modular_wooden_pier](https://polyhaven.com/a/modular_wooden_pier), [wooden_lantern_01](https://polyhaven.com/a/wooden_lantern_01), [Lantern_01](https://polyhaven.com/a/Lantern_01), [ocean_buoy](https://polyhaven.com/a/ocean_buoy), [wicker_basket_01](https://polyhaven.com/a/wicker_basket_01), [wooden_crate_01](https://polyhaven.com/a/wooden_crate_01), [chinese_stool](https://polyhaven.com/a/chinese_stool), [wooden_stool_01](https://polyhaven.com/a/wooden_stool_01) |

## 3. Model Sketchfab (bạn tải)

Sketchfab bắt đăng nhập mới cho tải, nên phần này bạn làm. Mọi link dưới đây đã được lọc: **cho tải, giấy phép CC Attribution** (dùng được, chỉ cần ghi tên tác giả), dưới 300 nghìn tam giác.

Cách tải:
1. Đăng nhập Sketchfab (tạo tài khoản miễn phí nếu chưa có).
2. Mở link → nút **Download 3D Model** → chọn **glTF** (không chọn "Original format").
3. Bỏ nguyên file `.zip` vào `assets/incoming/models/`. **Không cần giải nén, không cần viết `nguon.txt`**: tác giả và giấy phép mình đã ghi sẵn trong `tools/library/sketchfab.json`.
4. Upload qua web GitHub giới hạn **25 MB một file**. File nào lớn hơn thì đẩy bằng git, hoặc bỏ qua và báo mình.

Mỗi món có 1–3 lựa chọn. Lấy cái đầu là đủ; lấy thêm thì mình so rồi chọn.

### ⭐ Ưu tiên: Đà Nẵng, Hội An và Sài Gòn

| | Thứ | Model (bấm để mở) | Tam giác | Tác giả | Ghi chú |
|---|---|---|---|---|---|
| [ ] | Nhà thờ Đức Bà | [Notre-Dame Cathedral Basilica of Saigon](https://sketchfab.com/3d-models/c3dfdc2be8504c4ba7ee076994a15108) | 2.187 | cgart.com | Đúng công trình, model nhẹ. So với bản Meshy rồi chọn. |
| [ ] | Landmark 81 | [Landmark 81](https://sketchfab.com/3d-models/cf68d02944c74d96933637fcc7e73021) | 15.462 | Dave Love SketchFab | Thay khối hộp hiện tại ở Sài Gòn |
| [ ] | Xe máy số | [Honda Super CUB](https://sketchfab.com/3d-models/dfac2b92b05746709674bea223ee596d) | 136.279 | Azimut Cheng | Honda Super Cub, giống xe Việt Nam nhất |
| [ ] | Xe máy số | [Yamaha RX115 (White)](https://sketchfab.com/3d-models/f7c99cafa3b44d1ea8ff4c28c3fb1de5) | 6.720 | ashminggu | Yamaha RX115, nhẹ, dùng cho dòng xe đông |
| [ ] | Xe máy số | [Free Scanned Asian Motorbike](https://sketchfab.com/3d-models/f84369affafb46bbb797d497715e36ba) | 66.812 | Aung.Kyaw.Paing | Xe máy châu Á chụp quét |
| [ ] | Xe tay ga | [Vino](https://sketchfab.com/3d-models/2205f4e69bc64df3aab03c71ab9d7492) | 95.599 | minghauLoh | Yamaha Vino |
| [ ] | Xe tay ga | [Scooter](https://sketchfab.com/3d-models/8f5246e6bf854d4cb50dbe0e24e0addc) | 99.650 | re1monsen |  |
| [ ] | Xe tay ga | [Moped - Vespa Piaggio Bravo](https://sketchfab.com/3d-models/bb7549d851784b238b917ade58dad1c5) | 143.767 | Fredrik Johansen | Vespa |
| [ ] | Ô tô con | [Generic Sedan Car](https://sketchfab.com/3d-models/58c33766470d46e7b2aed542650494e5) | 113.191 | MMC Works | Sedan hiện đại |
| [ ] | Xe buýt, xe khách | [Xe Khach Hanoi](https://sketchfab.com/3d-models/6228a9c32be94ec88f501725837f7031) | 13.999 | Nguyễn Trung Đức | Xe khách Hà Nội |
| [ ] | Xe buýt, xe khách | [Generic Town Bus](https://sketchfab.com/3d-models/14fe03d792914d51b6c6250b393c44fd) | 55.542 | own.guest | Xe buýt thành phố |
| [ ] | Đò, xuồng gỗ | [Viet Boat](https://sketchfab.com/3d-models/0c84f61608354ea6bf5606b4490aa057) | 3.594 | jojo_kyduyen | Thuyền Việt |
| [ ] | Đò, xuồng gỗ | [Wooden Boat](https://sketchfab.com/3d-models/627ba38e06aa4536b90706a8626c74d4) | 8.770 | donnichols |  |
| [ ] | Đò, xuồng gỗ | [Longtail boat](https://sketchfab.com/3d-models/35038e5b626b4609984f75e4cb978f7d) | 5.675 | jorandp | Thuyền đuôi dài |
| [ ] | Thuyền đánh cá | [Fishing boat](https://sketchfab.com/3d-models/f4b38ccf5ffb46018aa7931c0e106654) | 7.244 | Pabooklas |  |
| [ ] | Thuyền đánh cá | [Fishing Boat](https://sketchfab.com/3d-models/6e33005fba3542a2aa61e187321d465e) | 26.682 | Rafael Rodrigues |  |
| [ ] | Thuyền đánh cá | [Old wooden boat](https://sketchfab.com/3d-models/c62fa438ea0e464dbb23e0ca5ff03727) | 13.310 | pnhtuan | Thuyền gỗ cũ |
| [ ] | Nhà cổ Hội An | [Hoi An Accient House](https://sketchfab.com/3d-models/5507a8fbaeb449d5a91e83f0e202ba1c) | 19.912 | Le.Manh.Cuong |  |
| [ ] | Nhà cổ Hội An | [Modular Hoi An](https://sketchfab.com/3d-models/0b502d56b0854274a0106deb293f0c98) | 3.437 | Son Nguyen | Bộ ghép nhà Hội An, nhẹ |
| [ ] | Nhà ống, nhà phố | [LowPoly Hanoi Vietnamese Tube House [Game Ready]](https://sketchfab.com/3d-models/a7b3525f0a9a439a994bcbfd8caaacaf) | 1.238 | RimiChama | Nhà ống Hà Nội, rất nhẹ |
| [ ] | Nhà ống, nhà phố | [Vietnamese House in 2000s](https://sketchfab.com/3d-models/582936c8eac641a885343e91766e71b1) | 8.490 | Khoa Nguyen | Nhà Việt những năm 2000 |
| [ ] | Nhà ống, nhà phố | [Hanoi House - Igor Ambrósio](https://sketchfab.com/3d-models/3958d56430b84c75bb79846d01d2e316) | 8.322 | Igor Ambrósio | Nhà Hà Nội |
| [ ] | Nhà ống, nhà phố | [Asian Shop Pack Free Gameready](https://sketchfab.com/3d-models/2f603ad8d5c640f7b9794f6916f9fbdd) | 39.203 | abhayexe | Bộ cửa hàng châu Á |
| [ ] | Nhà cao tầng ven sông Hàn | [Asian Themed Low Poly Night City Buildings](https://sketchfab.com/3d-models/9f0343aff4814b758dc6e905aba5b5e0) | 6.435 | 99.Miles | Bộ nhà châu Á ban đêm, rất nhẹ |
| [ ] | Nhà cao tầng ven sông Hàn | [City Apartment Building](https://sketchfab.com/3d-models/7f77793a848643e4818280f17f1629a0) | 40.464 | fredbear1211 |  |
| [ ] | Nhà cao tầng ven sông Hàn | [Modular Apartment Building](https://sketchfab.com/3d-models/a4553c5449f74dfb979cb6c5d891b063) | 11.276 | jimbogies |  |
| [ ] | Tòa nhà văn phòng (Sài Gòn) | [[FREE]  Atlanta. Corperate Office Building](https://sketchfab.com/3d-models/d96380fb001345cca9a9be121f3e43d5) | 37.290 | 99.Miles |  |
| [ ] | Tòa nhà văn phòng (Sài Gòn) | [Skyscraper](https://sketchfab.com/3d-models/9b571d0a6f34459e91aa38b6ef8e3d93) | 37.072 | ManySince910 |  |
| [ ] | Cột điện Việt Nam | [Vietnam Electric Pole](https://sketchfab.com/3d-models/838358343f2a4a7e82cff10326207902) | 1.826 | Khoa Nguyen |  |
| [ ] | Đèn đường cổ | [Vintage lamp post](https://sketchfab.com/3d-models/56f6dcb3865144cd84e049ca6a736fae) | 8.170 | dasmodal |  |
| [ ] | Đèn đường cổ | [Street Lamp](https://sketchfab.com/3d-models/6881aa1e84b047d79860fa9297e05e22) | 7.810 | bez_glaza |  |
| [ ] | Ghế nhựa, ghế đẩu đỏ | [Vietnamese Red Plastic Stool — Game-ready PBR](https://sketchfab.com/3d-models/f07bfecbffa648c3b61227760901942b) | 1.500 | Saigon Sidewalk Assets | Ghế đẩu nhựa đỏ Việt Nam |
| [ ] | Ghế nhựa, ghế đẩu đỏ | [Vietnamese Plastic Chair](https://sketchfab.com/3d-models/25c585737c014827bfa3b56c2b680581) | 3.940 | kiim | Ghế nhựa Việt Nam |
| [ ] | Xe đẩy hàng rong | [煎饼车/Gerobak Lumpia](https://sketchfab.com/3d-models/bca4551289cb456dbf2de4ed91e4acfc) | 10.822 | billionlioe | Xe đẩy kiểu Đông Nam Á |
| [ ] | Xe đẩy hàng rong | [Avika Street Food Cart](https://sketchfab.com/3d-models/d54005c378fa45c3a06090d65a53fb23) | 36.653 | AVIKA |  |
| [ ] | Sạp chợ | [Vietnamese Vegetable Market](https://sketchfab.com/3d-models/a3c935d758624c8f866bc27776f86712) | 6.733 | Khoa Nguyen | Sạp rau Việt Nam |
| [ ] | Sạp chợ | [Vietnamese Meat Market stall](https://sketchfab.com/3d-models/0cd04f3c727347d9899b52b9b88be871) | 3.689 | Khoa Nguyen | Sạp thịt Việt Nam |
| [ ] | Đèn lồng | [Vietnamese Lantern](https://sketchfab.com/3d-models/e08d22e1d8364603a1cd10337d5f9da8) | 4.161 | Khoa Nguyen | Đèn lồng Việt Nam |
| [ ] | Đèn lồng | [Chinese Lantern](https://sketchfab.com/3d-models/0fc4dbf7122141828c16bae9025ce47c) | 1.412 | Batuhan13 |  |
| [ ] | Tre | [Free Bamboo Set](https://sketchfab.com/3d-models/e9f9fa5397814f81bf85ad06acf5bf30) | 37.834 | JonhGillessen | Bộ tre |
| [ ] | Tre | [bamboo tree](https://sketchfab.com/3d-models/d0161434cf6844a8bc6eaeb0c0692ed0) | 184.941 | tojamerlin | Cây tre |
| [ ] | Dừa | [Coconut Palm](https://sketchfab.com/3d-models/26e787f2ff2e4c0fb004c3b0210805a3) | 7.432 | evolveduk | Nhẹ |
| [ ] | Dừa | [Realistic Palm Tree 2 Free](https://sketchfab.com/3d-models/d05c8ffb6ec64a7184c4b673e21f7224) | 60.764 | Next Spring | Chân thật |
| [ ] | Hoa giấy (Hội An) | [Bougainvillea](https://sketchfab.com/3d-models/3579fe79be0d46d49de80d5478a4e3cd) | 36.609 | amn009 |  |

### Thêm: các chặng còn lại

| | Thứ | Model (bấm để mở) | Tam giác | Tác giả | Ghi chú |
|---|---|---|---|---|---|
| [ ] | Dinh Độc Lập (thêm cho Sài Gòn) | [Dinh Doc Lap Independence Palace](https://sketchfab.com/3d-models/2c4905c6a1fd4fb18981886a77ba4fa9) | 148.496 | Hoàng Huy |  |
| [ ] | Chùa Một Cột (thêm cho Hà Nội) | [One Pillar Pagoda - Vietnam](https://sketchfab.com/3d-models/8475a13cd0ce41ffacd977eea63ac245) | 12.924 | stephenk232 |  |
| [ ] | Khuê Văn Các (thêm cho Hà Nội) | [Khuê Văn các - Khue Van pavilion](https://sketchfab.com/3d-models/bd978368dc0444058c6c61336ed8f2d0) | 281.122 | Heli Ton | Nặng, mình sẽ giảm |
| [ ] | Tháp Rùa (so với bản Meshy) | [Tháp Rùa - Turtle Tower on Hoan Kiem Lake](https://sketchfab.com/3d-models/a22adcd051914e2e911debf0730cab28) | 59.400 | minhduc26119931 |  |
| [ ] | Xích lô | [Cycle rickshaw](https://sketchfab.com/3d-models/704a942b531846bfbbfa067c24d501a5) | 125.368 | AryPadli | Xích lô kiểu Ấn Độ (người lái ngồi trước). Nếu không ổn, làm bằng Meshy. |
| [ ] | Chợ nổi (ghe, hàng hóa) | [A floating market](https://sketchfab.com/3d-models/0ce35d7f3a2d4a4eb747804f4d467840) | 20.355 | daydev | Cả cảnh chợ nổi, lấy ghe và hàng |
| [ ] | Chợ nổi (ghe, hàng hóa) | [Thai floating market props](https://sketchfab.com/3d-models/015fa8d96fd9467d9837be3628219ee5) | 31.780 | Biya | Đạo cụ chợ nổi |
| [ ] | Tàu buồm Hạ Long (thêm, đã có bản Meshy) | [Chinese Junk Ship Model](https://sketchfab.com/3d-models/dca48504de4e4794b790e249983238cc) | 43.426 | BG Builds |  |
| [ ] | Tàu buồm Hạ Long (thêm, đã có bản Meshy) | [Chinese Junk Ship](https://sketchfab.com/3d-models/a331d56c34ff4d958763114dc8e7c275) | 23.440 | Nisa Nurul Azizah |  |
| [ ] | Kayak | [Wooden Kayak & Paddle](https://sketchfab.com/3d-models/01cc514c5ace410ea4e5710cbfe89bb8) | 2.872 | Dominik Biały | Nhẹ |
| [ ] | Kayak | [Kayak with Paddle](https://sketchfab.com/3d-models/cda3354816af4a0aa1ca5cfee6c5dcd7) | 79.658 | nayangway |  |
| [ ] | Nhà sàn Miền Tây | [Stilt house in DenHung (CanTho - VietNam)](https://sketchfab.com/3d-models/73b917a1b8564feaad1583dfe263c40b) | 6.600 | Wang Sh D | Nhà sàn Đền Hùng, Cần Thơ |
| [ ] | Nhà sàn Miền Tây | [Small house in DenHung (CanTho - VietNam)](https://sketchfab.com/3d-models/335732e069d64197b22cf1093900430e) | 8.690 | Wang Sh D | Nhà nhỏ Cần Thơ |
| [ ] | Nhà mái lá, nhà sàn (Tây Nguyên) | [Thatched Hut on Stilts](https://sketchfab.com/3d-models/b73d5d61395d45a2bd65768223fb28de) | 9.986 | rajoelinirinanear | Chòi mái lá trên cột |
| [ ] | Nhà mái lá, nhà sàn (Tây Nguyên) | [Atap (straw) house](https://sketchfab.com/3d-models/f6dc892674be4265b0151f1534bee511) | 2.262 | 1catalogue | Nhà mái lá |
| [ ] | Cổng chùa, đền (Huế) | [CHINESE TEMPLE](https://sketchfab.com/3d-models/0ffd9067916642779ae1c270d083d77f) | 14.212 | mervemacit | Đền kiểu Trung Hoa, gần kiến trúc Huế |
| [ ] | Dây phơi đồ | [Laundry Clothesline](https://sketchfab.com/3d-models/6f13cc3c463f43888fb5db634cc603aa) | 8.693 | Khoa Nguyen |  |
| [ ] | Nón lá | [Vietnamese _ Non La](https://sketchfab.com/3d-models/abd86436d03344b9a40c82e127fb6252) | 1.512 | NNgan | Nón lá Việt Nam |
| [ ] | Nón lá | [Asian Conical Hat](https://sketchfab.com/3d-models/4eed68df8fb84284a91f42a6c6e4569c) | 3.234 | MushyDay |  |
| [ ] | Người đi bộ | [Low Poly T-Posed People](https://sketchfab.com/3d-models/c17584fcc6f4471983319df260a5d5d8) | 11.998 | flyingspringrol | Bộ người low poly |
| [ ] | Người đi bộ | [Standing Asian girl](https://sketchfab.com/3d-models/b555f1fbaef64752a7b4b42e04fd6e7d) | 38.860 | moonsoulymoon | Cô gái châu Á |
| [ ] | Võng (thêm cho Miền Tây) | [Traditional Vietnamese Hammock](https://sketchfab.com/3d-models/35282e45dd3842f1911666afa3135426) | 1.458 | Khoa Nguyen | Võng Việt Nam |
| [ ] | Dù, ghế bãi biển (Nha Trang) | [Beach Umbrella](https://sketchfab.com/3d-models/1014ad7c8a4c4aa8ba5e88fc6151aa4f) | 3.832 | stealth86 | Dù |
| [ ] | Dù, ghế bãi biển (Nha Trang) | [Beach Chair](https://sketchfab.com/3d-models/57e9477018d244378302070a8738b566) | 7.376 | stealth86 | Ghế |
| [ ] | Cáp treo Bà Nà | [Cable Car](https://sketchfab.com/3d-models/1621ec805f3b460faf50cd61f7bcb98f) | 33.528 | ugarychev | Cabin |
| [ ] | Cáp treo Bà Nà | [Ski gongola and lift station detailed drafts](https://sketchfab.com/3d-models/a8fabd3e955643a2a9e9f09bd46635db) | 36.557 | Wilin_Amaurea | Cabin và nhà ga |
| [ ] | Chuối (Miền Tây) | [Banana tree](https://sketchfab.com/3d-models/3b658ecad29f4d9a9606dbf8fea7c9bb) | 48.232 | 1Quad |  |
| [ ] | Chuối (Miền Tây) | [Banana Plant](https://sketchfab.com/3d-models/85695b82c7ba4b3497a663616cc3bf25) | 4.402 | evolveduk | Nhẹ |
| [ ] | Cây nhiệt đới tầng thấp | [Tropical Plants Pack M02P](https://sketchfab.com/3d-models/2f093afb792742438f0f7ba7eaab90f0) | 46.575 | MozzarellaARC | Bộ cây nhiệt đới |
| [ ] | Liễu rủ (Hồ Gươm) | [Weeping willow tree](https://sketchfab.com/3d-models/48c090ce93d543cf8b19d3c6f2b6788a) | 144.348 | adam127 |  |
| [ ] | Cây đa | [Chinese Banyan (Ficus Microcarpa)](https://sketchfab.com/3d-models/2a0dbcdf8f5d48f5ad79987c7a8170ce) | 111.392 | Valery.Li | Cây đa (Ficus microcarpa) |
| [ ] | Sen, súng (Huế) | [LOTUS](https://sketchfab.com/3d-models/5627ae9572ce419fac75b68a2ac54594) | 55.636 | Amagi_Arts | Sen |
| [ ] | Sen, súng (Huế) | [Water lily](https://sketchfab.com/3d-models/04dd636204cd4b0db45a4fc82efa4385) | 360 | Mariia Melnik | Súng, rất nhẹ |
| [ ] | Cây cà phê | [Coffee Plant Sasha An](https://sketchfab.com/3d-models/cecd9cfe831b4282906064d622df850d) | 22.416 | xan1 |  |
| [ ] | Cây cà phê | [Coffee Plant](https://sketchfab.com/3d-models/0c5c4cd4e79b4015811914203d599b9d) | 5.244 | neutralize | Nhẹ |
| [ ] | Cây đước | [Mangrove Tree](https://sketchfab.com/3d-models/5d4542431caa46f0b6f1feb089fc19dd) | 4.268 | Nice2meetU2 |  |
| [ ] | Cây đước | [mangrove tree roots](https://sketchfab.com/3d-models/c32d977c14e04e5ebc1fbef9b6111957) | 3.926 | lucq22 | Rễ đước |
| [ ] | Cây đước | [Tall Mangrove Tree](https://sketchfab.com/3d-models/b722ee2895e84fd3b02a467cd1ba1cbe) | 3.096 | Matt Bodner | Đước cao |
| [ ] | Voi | [African Elephant Textured](https://sketchfab.com/3d-models/49ad44f03f374433ac3a4f3143d7980c) | 53.341 | JohnMesplay | Voi châu Phi, nhìn xa không khác |
| [ ] | Voi | [Elephant](https://sketchfab.com/3d-models/4ae161372d6a4219a87340339d1ffe03) | 1.958 | Rukh3D | Nhẹ |
| [ ] | Thanh long (quả, cho sạp chợ) | [3D Scan: Dragon Fruit / Pitaya](https://sketchfab.com/3d-models/c7833d1adf434d66a694d732f6dc5446) | 64.124 | Z3D | Cây thanh long mình làm bằng code |
| [ ] | Lưới đánh cá | [Fishing net (Rede de pesca)](https://sketchfab.com/3d-models/cab12e62c8dd46cdbb6b250c2a3c1306) | 112 | Alex Martire |  |

## 4. Meshy (bạn làm)

Không có model miễn phí nào đúng các công trình này.

| | Thứ | Prompt tiếng Anh gợi ý |
|---|---|---|
| [ ] | **Chùa Cầu** (quan trọng nhất) | Japanese Covered Bridge in Hoi An, Vietnam: short arched wooden bridge with a small pagoda temple on one side, yellow walls, red lacquered wood, curved clay tile roof |
| [ ] | Bưu điện Thành phố | Saigon Central Post Office: French colonial building, yellow facade with white trim, large arched windows, central clock above the entrance |
| [ ] | Chợ Bến Thành (làm lại màu) | Ben Thanh Market, Saigon: cream and grey market building with a clock tower at the main gate, red roofs |
| [ ] | Tháp Chăm (nếu muốn) | Cham tower, Po Sah Inu, Phan Thiet: red brick Hindu temple tower, tiered roof, weathered |
| [ ] | Nhà trình tường Lũng Cú (nếu muốn) | Lo Lo ethnic house in Lung Cu, Ha Giang: rammed earth walls, yin-yang clay tile roof, wooden door, small courtyard with stone fence |

## 5. Không có model tốt (mình làm bằng code)

Ruộng bậc thang và ruộng lúa, cây thanh long trên trụ, dừa nước, hoa tam giác mạch, thuyền độc mộc, nhà bè Hạ Long, phà, thác nước Tây Nguyên, cờ đỏ sao vàng (đã có).
