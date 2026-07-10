import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TallyMark } from './TallyMark';

describe('TallyMark', () => {
  it('renders no strokes for 0', () => {
    const { container } = render(<TallyMark strokes={0} style="square" />);
    expect(container.querySelectorAll('[data-stroke="true"]').length).toBe(0);
  });
  it('renders 3 strokes for 3 (square)', () => {
    const { container } = render(<TallyMark strokes={3} style="square" />);
    expect(container.querySelectorAll('[data-stroke="true"]').length).toBe(3);
  });
  it('renders 5 strokes for a full square', () => {
    const { container } = render(<TallyMark strokes={5} style="square" />);
    expect(container.querySelectorAll('[data-stroke="true"]').length).toBe(5);
  });
  it('renders 5 strokes for a full cup', () => {
    const { container } = render(<TallyMark strokes={5} style="cup" />);
    expect(container.querySelectorAll('[data-stroke="true"]').length).toBe(5);
  });
});
