import React from 'react';
import { Undo2 } from 'lucide-react';
import type { Game, Player, TrucoMarkerStyle } from '../types';
import { TallyMark } from './TallyMark';
import { groupStrokes, splitMalasBuenas, teamTotal } from '../lib/truco';
import { useLanguage } from '../contexts/LanguageContext';

interface TrucoScoreboardProps {
  game: Game;
  onAddPoint: (playerId: string) => void;
  onUndo: (playerId: string) => void;
}

interface TeamColumnProps {
  player: Player;
  total: number;
  target: number;
  style: TrucoMarkerStyle;
  onAddPoint: () => void;
  onUndo: () => void;
  malasLabel: string;
  buenasLabel: string;
  undoLabel: string;
}

const TeamColumn: React.FC<TeamColumnProps> = ({
  player, total, target, style, onAddPoint, onUndo, malasLabel, buenasLabel, undoLabel,
}) => {
  const { malas, buenas } = splitMalasBuenas(total);
  const showDivider = target === 30;
  const won = total >= target;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-4 min-h-[60vh] transition-colors ${
        won ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-center">
        <div className="text-sm font-bold uppercase tracking-wider text-slate-500">{player.name}</div>
        <div data-testid={`total-${player.id}`} className="text-5xl font-black text-slate-800">{total}</div>
      </div>

      {/* Malas */}
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{malasLabel}</div>
        <div className="flex flex-wrap gap-1 text-slate-700 min-h-[44px]">
          {groupStrokes(malas).map((s, i) => (
            <TallyMark key={`m${i}`} strokes={s} style={style} />
          ))}
        </div>
      </div>

      {showDivider && <div className="my-3 border-t-2 border-dashed border-slate-300" />}

      {/* Buenas */}
      {showDivider && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{buenasLabel}</div>
          <div className="flex flex-wrap gap-1 text-slate-700 min-h-[44px]">
            {groupStrokes(buenas).map((s, i) => (
              <TallyMark key={`b${i}`} strokes={s} style={style} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Members */}
      {player.members && player.members.length > 0 && (
        <div className="text-center text-xs text-slate-400 mb-3 truncate">
          {player.members.slice(0, 3).join(', ')}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          data-testid={`add-${player.id}`}
          onClick={onAddPoint}
          disabled={won}
          aria-label={`+1 ${player.name}`}
          className="flex-1 py-4 rounded-xl bg-blue-600 text-white text-2xl font-bold active:scale-95 transition-transform disabled:bg-slate-300"
        >
          +1
        </button>
        <button
          data-testid={`undo-${player.id}`}
          onClick={onUndo}
          disabled={total === 0}
          aria-label={undoLabel}
          className="p-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
        >
          <Undo2 size={20} />
        </button>
      </div>
    </div>
  );
};

export const TrucoScoreboard: React.FC<TrucoScoreboardProps> = ({ game, onAddPoint, onUndo }) => {
  const { t } = useLanguage();
  const target = game.config?.targetPoints ?? 30;
  const style: TrucoMarkerStyle = game.config?.markerStyle ?? 'square';

  return (
    // Truco is always exactly two teams (Nosotros / Ellos) — hence a fixed 2-column grid.
    <div className="grid grid-cols-2 gap-3 sm:gap-6 animate-in fade-in duration-300">
      {game.players.map(p => (
        <TeamColumn
          key={p.id}
          player={p}
          total={teamTotal(game, p.id)}
          target={target}
          style={style}
          onAddPoint={() => onAddPoint(p.id)}
          onUndo={() => onUndo(p.id)}
          malasLabel={t.truco_malas}
          buenasLabel={t.truco_buenas}
          undoLabel={t.truco_undo}
        />
      ))}
    </div>
  );
};
