# IMPL: Multilingual Support (English/Spanish)

I will implement a lightweight internationalization system to support both English (default) and Spanish languages, including browser language detection and a selector in the sidebar.

## User Review Required

> [!NOTE]
> The default language will be English. If the user's browser is set to Spanish/Castilian (es-ES, es-MX, etc.), it will automatically switch to Spanish on the first load.
> Two flag icons (🇺🇸 / 🇪🇸 or similar) will be added to the bottom of the sidebar for manual switching.

## Proposed Changes

### Core Logic

#### [NEW] [src/contexts/LanguageContext.tsx](file:///Users/augustose/DEV/gameboard/src/contexts/LanguageContext.tsx)
- Create a context to manage `language` state ('en' | 'es').
- Implement `detectLanguage()` to check `navigator.language`.
- Provide a `useLanguage` hook to access the dictionary and valid languages.

#### [NEW] [src/translations.ts](file:///Users/augustose/DEV/gameboard/src/translations.ts)
- Export a dictionary object structure:
  ```ts
  export const translations = {
    en: { ... },
    es: { ... }
  }
  ```
- Keys will cover:
  - Menu Items (Home, History, Stats, About)
  - Game Actions (Start, Cancel, Finish)
  - Setup Labels (New Game, Add Player)
  - Stats Headers (Total Games, Top Player)
  - Dialogue/Alert messages

### Component Updates (Apply Translations)

#### [MODIFY] [src/main.tsx](file:///Users/augustose/DEV/gameboard/src/main.tsx)
- Wrap the app in `<LanguageProvider>`.

#### [MODIFY] [src/components/Sidebar.tsx](file:///Users/augustose/DEV/gameboard/src/components/Sidebar.tsx)
- Use `useLanguage` hook.
- Replace menu text with keys.
- **Add Flag Icons** at the bottom (footer area or separate section) to toggle language:
  - 🇺🇸 (EN)
  - 🇪🇸 (ES)

#### [MODIFY] [src/App.tsx](file:///Users/augustose/DEV/gameboard/src/App.tsx)
- Replace headers and button text (Cancel, Finish Game).
- Replace `confirm` messages with translated versions.

#### [MODIFY] [src/components/GameSetup.tsx](file:///Users/augustose/DEV/gameboard/src/components/GameSetup.tsx)
- Translate form labels and buttons.

#### [MODIFY] [src/components/Scoreboard.tsx](file:///Users/augustose/DEV/gameboard/src/components/Scoreboard.tsx)
- Translate "Rounds" header.

#### [MODIFY] [src/components/HistoryView.tsx](file:///Users/augustose/DEV/gameboard/src/components/HistoryView.tsx)
- Translate "Game History", empty state, and table headers.

#### [MODIFY] [src/components/StatsView.tsx](file:///Users/augustose/DEV/gameboard/src/components/StatsView.tsx)
- Translate stat labels (Wins, Top Player, Win Rate).

#### [MODIFY] [src/components/AboutView.tsx](file:///Users/augustose/DEV/gameboard/src/components/AboutView.tsx)
- Translate description, bio, and credits.

## Verification Plan

### Manual Verification
1.  **Default Load**: Open in a browser with English settings -> Verify English text.
2.  **Switch to ES**: Click the Spanish flag -> Verify all labels change to Spanish instantly.
3.  **Switch to EN**: Click the US flag -> Verify text reverts.
4.  **Browser Detection**: Change browser language preference to Spanish, reload -> Verify app starts in Spanish.
