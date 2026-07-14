"use client";

/**
 * ThemeReveal — circular clip-path reveal coordinator.
 *
 * Does NOT paint a solid white/black fullscreen layer.
 * View Transition snapshots keep the real dashboard visible:
 * - Outside the circle → previous theme (old snapshot)
 * - Inside the circle  → new theme (new snapshot)
 *
 * CSS lives in styles/animations.css (::view-transition-* rules).
 * Origin / radius CSS vars are set by ThemeProvider before the transition.
 */
export default function ThemeReveal() {
  return null;
}
