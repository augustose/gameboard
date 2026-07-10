import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutView } from './AboutView';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('AboutView — Why Truco note', () => {
  it('renders the "Why Truco?" note dedicated to Adrián', () => {
    render(<LanguageProvider><AboutView /></LanguageProvider>);
    // default language is 'en'
    expect(screen.getByText(/Why Truco\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Adrián/)).toBeInTheDocument();
  });

  it('keeps the existing Don Rafael tribute intact', () => {
    render(<LanguageProvider><AboutView /></LanguageProvider>);
    expect(screen.getByText(/Don Rafael/)).toBeInTheDocument();
  });
});
