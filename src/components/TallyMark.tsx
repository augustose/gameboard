import React from 'react';
import type { TrucoMarkerStyle } from '../types';

interface TallyMarkProps {
  strokes: number;              // 0..5 (values are clamped)
  style: TrucoMarkerStyle;
  className?: string;
}

// Ordered strokes. Each is an SVG path 'd'. Order matters: strokes appear 1..5.
const SQUARE_STROKES: string[] = [
  'M8 6 L8 34',    // 1: left side
  'M8 6 L32 6',    // 2: top
  'M32 6 L32 34',  // 3: right side
  'M8 34 L32 34',  // 4: bottom
  'M8 6 L32 34',   // 5: diagonal (the "cross")
];

// A stylised cup/cáliz drawn with 5 strokes.
const CUP_STROKES: string[] = [
  'M12 6 Q20 20 12 20',   // 1: left side of the bowl
  'M28 6 Q20 20 28 20',   // 2: right side of the bowl
  'M20 20 L20 30',        // 3: stem
  'M12 34 L28 34',        // 4: base
  'M12 6 L28 6',          // 5: rim (the "cross")
];

export const TallyMark: React.FC<TallyMarkProps> = ({ strokes, style, className }) => {
  const clamped = Math.max(0, Math.min(5, Math.floor(strokes)));
  const paths = style === 'cup' ? CUP_STROKES : SQUARE_STROKES;
  return (
    <svg viewBox="0 0 40 40" className={className} width="40" height="40" aria-hidden="true">
      {paths.slice(0, clamped).map((d, i) => (
        <path
          key={i}
          d={d}
          data-stroke="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};
