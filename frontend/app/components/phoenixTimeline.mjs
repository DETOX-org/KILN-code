export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (t) => t * t * (3 - 2 * t);
const keys = [
  [0, 248, 242, .12, -18],
  [.17, 335, 260, .64, -12],
  [.34, 454, 414, .78, 12],
  [.47, 661, 260, .92, 18],
  [.58, 830, 308, .64, -22],
  [.70, 750, 454, .015, -8],
  [1, 750, 454, 0, 0],
];
export function phoenixTimeline(progress) {
  const p = clamp(progress);
  const index = keys.findIndex((key, i) => i < keys.length - 1 && p <= keys[i + 1][0]);
  const a = keys[Math.max(0, index)], b = keys[Math.max(0, index) + 1];
  const t = ease(clamp((p - a[0]) / (b[0] - a[0])));
  const values = a.slice(1).map((v, i) => v + (b[i + 1] - v) * t);
  const front = clamp((p - .36) / .04);
  const zoom = ease(clamp((p - .69) / .14));
  return { x: values[0], y: values[1], scale: values[2], roll: values[3], front, zoom,
    birdOpacity: clamp(p / .04) * (1 - clamp((p - .68) / .03)),
    reveal: ease(clamp((p - .80) / .10)), glow: clamp((p - .57) / .13),
    stage: p < .24 ? 0 : p < .51 ? 1 : p < .80 ? 2 : 3 };
}
