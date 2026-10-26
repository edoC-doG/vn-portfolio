// Tree kinds for the forest, built from EZ-Tree presets. Shared by bake.html (generation) and documented in docs/MODELS.md.
export const KINDS = [
  { name: 'oak', preset: 'Oak Medium', leafTint: 0xb9d9a0 },   // broadleaf canopy: northern and central forests
  { name: 'ash', preset: 'Ash Medium', leafTint: 0xa8d090 },   // tall broadleaf
  { name: 'pine', preset: 'Pine Medium' },                      // Hà Giang highlands, Tây Nguyên (Đà Lạt pines)
  { name: 'bush', preset: 'Bush 1', leafTint: 0xb0d498 },      // understory and scrub
];
// leaf: share of leaves kept, size: leaf size factor, sec/seg: branch sections and radial segments, child: share of the finest branches kept
export const LEVELS = {
  mid: { leaf: 0.3, size: 2.1, sec: 0.45, seg: 0.6, child: 0.5 },
  low: { leaf: 0.16, size: 2.8, sec: 0.35, seg: 0.5, maxLevels: 2, child: 0.6 },
};
