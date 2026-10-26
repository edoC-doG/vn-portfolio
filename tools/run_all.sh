#!/bin/bash
# Re-export every Meshy original into assets/models/{high,mid,low}.
# Usage: tools/run_all.sh <folder with the original Meshy .glb files>
# The originals (0.2-5.6M triangles each, ~1.3 GB together) are not in this repo.
set -u
IN=${1:?folder with the Meshy originals}
OUT=$(cd "$(dirname "$0")/.." && pwd)/assets/models
cd "$(dirname "$0")"
declare -A MAP=(
 [thuyen-buom]="Meshy_AI_Vietnamese_Junk_Boat_1023164745_image-to-3d-texture.glb"
 [cong-chieng]="Meshy_AI_vietnamese_bronze_gon_1023164814_image-to-3d-texture.glb"
 [mui-ca-mau]="Meshy_AI_Mui_Ca_Mau_Monument_1023173835_image-to-3d-texture.glb"
 [lang-bac]="Meshy_AI_Textured_Ho_Chi_Minh__1023170137_texture.glb"
 [cau-vang]="Meshy_AI_golden_bridge_ba_na_h_1023172103_image-to-3d-texture.glb"
 [thuyen-thung]="Meshy_AI_vietnamese_basket_boa_1023164800_image-to-3d-texture.glb"
 [cot-co-lung-cu]="Meshy_AI_lung_cu_flag_tower_3d_1023165332_image-to-3d-texture.glb"
 [ghe-cho-noi]="Meshy_AI_mekong_trading_boat_3_1023165016_image-to-3d-texture.glb"
 [thap-rua]="Meshy_AI_Turtle_Tower_Textured_1023170120_texture.glb"
 [thap-nuoc-phan-thiet]="Meshy_AI_Phan_Thiet_Water_Towe_1023172313_image-to-3d-texture.glb"
 [thap-phuoc-duyen]="Meshy_AI_Phuoc_Duyen_Tower_Tex_1023172046_texture.glb"
 [cho-ben-thanh]="Meshy_AI_ben_thanh_market_3d_1023173804_image-to-3d-texture.glb"
 [nha-rong]="Meshy_AI_RongCommunalHouse_1023165009_image-to-3d-texture.glb"
 [thap-ba-ponagar]="Meshy_AI_Po_Nagar_Cham_Towers__1023172112_image-to-3d-texture.glb"
)
: > results.jsonl
for s in "${!MAP[@]}"; do
  LT=3000; case $s in nha-rong|thap-ba-ponagar) LT=6000;; cot-co-lung-cu) LT=5000;; esac
  echo "== $s"
  LOWTRIS=$LT node --max-old-space-size=8192 process.mjs "$IN/${MAP[$s]}" "$s" "$OUT" >> results.jsonl || echo "FAILED $s"
done
