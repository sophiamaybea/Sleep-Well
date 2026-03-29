/**
 * moonPhase.ts — Agent D2: The Moon Phase Marker
 * Pure JS moon phase calculation using the Meeus algorithm.
 * No external API. No AI. Just math and a cron job.
 *
 * Part of The Page Gallery Journal background agent system.
 * Runs as a Supabase Edge Function daily cron to write
 * current moon phase to site_config table.
 */

export type MoonPhaseCode =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface MoonPhaseResult {
  phase: MoonPhaseCode;
  illumination: number; // 0.0 to 1.0
  glyph: string;        // Unicode moon emoji
  label: string;        // Human-readable label
  isNewMoon: boolean;
  isFullMoon: boolean;
  message: string | null; // Special message for new/full moon
}

/**
 * Calculates the current lunar phase using the Meeus algorithm.
 * Returns a normalised phase angle (0 = new moon, 0.5 = full moon).
 */
export function getMoonPhase(date: Date = new Date()): MoonPhaseResult {
  // Meeus algorithm for moon age (days since last new moon)
  const synodicMonth = 29.53058867; // Average length of a synodic month in days

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Calculate Julian Day Number
  let y = year;
  let m = month;
  if (m < 3) {
    y--;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5;

  // Reference new moon: Jan 6, 2000 (JD 2451549.5)
  const daysSinceNewMoon = JD - 2451549.5;
  const newMoons = daysSinceNewMoon / synodicMonth;
  const moonAge = (newMoons - Math.floor(newMoons)) * synodicMonth;

  // Illumination fraction (0-1)
  const phaseAngle = (moonAge / synodicMonth) * Math.PI * 2;
  const illumination = (1 - Math.cos(phaseAngle)) / 2;

  // Determine phase
  const pct = moonAge / synodicMonth;

  let phase: MoonPhaseCode;
  let glyph: string;
  let label: string;
  let isNewMoon = false;
  let isFullMoon = false;

  if (pct < 0.03 || pct >= 0.97) {
    phase = 'new_moon';
    glyph = '\u{1F311}';
    label = 'New Moon';
    isNewMoon = true;
  } else if (pct < 0.22) {
    phase = 'waxing_crescent';
    glyph = '\u{1F312}';
    label = 'Waxing Crescent';
  } else if (pct < 0.28) {
    phase = 'first_quarter';
    glyph = '\u{1F313}';
    label = 'First Quarter';
  } else if (pct < 0.47) {
    phase = 'waxing_gibbous';
    glyph = '\u{1F314}';
    label = 'Waxing Gibbous';
  } else if (pct < 0.53) {
    phase = 'full_moon';
    glyph = '\u{1F315}';
    label = 'Full Moon';
    isFullMoon = true;
  } else if (pct < 0.72) {
    phase = 'waning_gibbous';
    glyph = '\u{1F316}';
    label = 'Waning Gibbous';
  } else if (pct < 0.78) {
    phase = 'last_quarter';
    glyph = '\u{1F317}';
    label = 'Last Quarter';
  } else {
    phase = 'waning_crescent';
    glyph = '\u{1F318}';
    label = 'Waning Crescent';
  }

  // Special messages for new and full moon
  let message: string | null = null;
  if (isNewMoon) {
    message = 'New moon. A good night to begin something.';
  } else if (isFullMoon) {
    message = 'Full moon. A good night to finish something.';
  }

  return {
    phase,
    illumination: Math.round(illumination * 100) / 100,
    glyph,
    label,
    isNewMoon,
    isFullMoon,
    message,
  };
}

/**
 * Returns just the moon phase glyph for a given date.
 * Useful for compact UI display.
 */
export function getMoonGlyph(date: Date = new Date()): string {
  return getMoonPhase(date).glyph;
}
