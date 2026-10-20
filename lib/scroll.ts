// Shared, mutable scroll state read every frame by the 3D scene (no React re-renders).
export const story = { t: 0 };

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// Progress of t inside [a, b], eased.
export const range = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
