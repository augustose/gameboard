import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameSetup } from './components/GameSetup';
import { Scoreboard } from './components/Scoreboard';
import { PodiumView } from './components/PodiumView';
import { HistoryView } from './components/HistoryView';
import { StatsView } from './components/StatsView';
import { AboutView } from './components/AboutView';
import { Sidebar } from './components/Sidebar';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Game, Player, Score, Round, GameType } from './types';
import { Menu } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

const Dashboard = () => {
  const { data, saveGame, deleteGame, importData, exportData } = useLocalStorage();
  const { t } = useLanguage();

  const [view, setView] = useState<'home' | 'history' | 'stats' | 'about'>('home');
  const [selectedGameType, setSelectedGameType] = useState<GameType>('rummy');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const startGame = (players: Player[], type: GameType) => {
    const newGame: Game = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: 'active',
      type,
      players,
      rounds: [],
      hostId: 'local-user'
    };
    setActiveGame(newGame);
    setView('home');
  };

  const cancelGame = () => {
    if (confirm(t.confirm_cancel)) {
      setActiveGame(null);
      setView('home');
    }
  };

  const handleStartGameRequest = (type: GameType) => {
    if (activeGame) {
      if (confirm(t.confirm_new_game)) {
        setActiveGame(null);
        setView('home');
        setSelectedGameType(type);
      }
    } else {
      setActiveGame(null);
      setView('home');
      setSelectedGameType(type);
    }
  };

  const navigate = (newView: 'home' | 'history' | 'stats' | 'about') => {
    setView(newView);
    setIsMenuOpen(false);
  };

  const handleRematch = () => {
    if (!activeGame) return;
    startGame(activeGame.players, activeGame.type);
  };

  const handleAddRound = (scores: Score[]) => {
    if (!activeGame) return;
    const newRound: Round = {
      id: crypto.randomUUID(),
      roundNumber: activeGame.rounds.length + 1,
      scores,
      timestamp: Date.now()
    };
    setActiveGame({ ...activeGame, rounds: [...activeGame.rounds, newRound] });
  };

  const handleUpdatePlayerName = (playerId: string, newName: string) => {
    if (!activeGame) return;
    setActiveGame({
      ...activeGame,
      players: activeGame.players.map(p => p.id === playerId ? { ...p, name: newName } : p)
    });
  };

  const finishGame = () => {
    if (!activeGame) return;
    const completedGame: Game = { ...activeGame, status: 'completed', endedAt: Date.now() };
    setActiveGame(completedGame);
    saveGame(completedGame);
  };

  const renderContent = () => {
    if (view === 'history') {
      return (
        <HistoryView
          history={data.history}
          onImport={importData}
          onExport={exportData}
          onDeleteGame={deleteGame}
          onSelectGame={(game) => {
            setActiveGame(game);
            setView('home');
          }}
        />
      );
    }

    if (view === 'stats') {
      return <StatsView history={data.history} />;
    }

    if (view === 'about') {
      return <AboutView />;
    }

    if (!activeGame) {
      return <GameSetup onStartGame={startGame} initialGameType={selectedGameType} />;
    }

    if (activeGame.status === 'completed') {
      return (
        <PodiumView
          game={activeGame}
          onRematch={handleRematch}
          onHome={() => setActiveGame(null)}
        />
      );
    }

    return (
      <Scoreboard
        game={activeGame}
        onAddRound={handleAddRound}
        onUpdatePlayerName={handleUpdatePlayerName}
      />
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 h-16 flex-shrink-0 z-30">
          <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer lg:hidden" onClick={() => setView('home')}>
                El Turix Scoreboard
              </h1>
              <h2 className="hidden lg:block font-bold text-slate-700 capitalize text-lg">
                {view === 'home' ? (activeGame ? t.app_active_match : t.app_new_game) : (t as any)[`menu_${view}`] || view}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {activeGame && activeGame.status === 'active' && view === 'home' && (
                <>
                  <button
                    onClick={cancelGame}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-1.5 transition-colors uppercase tracking-wide lg:px-4 lg:py-2 lg:text-sm lg:mr-2"
                  >
                    {t.app_cancel}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t.confirm_finish)) finishGame();
                    }}
                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-wide lg:bg-blue-600 lg:text-white lg:px-4 lg:py-2 lg:text-sm lg:hover:bg-blue-700 lg:shadow-md"
                  >
                    {t.app_finish}
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 scroll-smooth">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none flex-shrink-0 border-l border-slate-200 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Sidebar
          onNavigate={navigate}
          onStartGame={(type) => { handleStartGameRequest(type); setIsMenuOpen(false); }}
          onImport={importData}
          onExport={exportData}
        />
      </div>
    </div>
  );
};

const Login = () => (<div />);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
