import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trophy, Zap, Target } from 'lucide-react';
import { GameState } from '../../lib/challenge-logic';

interface GameHeaderProps {
    gameState: GameState;
    onExit: () => void;
}

export function GameHeader({ gameState, onExit }: GameHeaderProps) {
    const { hp, score, combo, currentLevel, xp, maxXp } = gameState;

    return (
        <header className="sticky top-0 z-50 w-full glass-card border-none bg-slate-900/90 text-white shadow-2xl">
            <div className="mx-auto max-w-[1800px] px-6 h-20 flex items-center justify-between">
                {/* Left: Progress & HP */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={onExit}
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                        <div className="p-2 rounded-lg group-hover:bg-slate-800 transition-all">
                            <Target className="h-5 w-5 rotate-45" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest hidden sm:inline">放棄挑戰</span>
                    </button>

                    <div className="h-8 w-px bg-slate-700 hidden sm:block" />

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">生命值</span>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((i) => {
                                const isFull = hp >= i;
                                const isHalf = !isFull && hp >= (i - 0.5);
                                const isEmpty = hp < (i - 0.5);

                                return (
                                    <motion.div
                                        key={i}
                                        initial={false}
                                        animate={{
                                            scale: !isEmpty ? [1, 1.2, 1] : 0.9,
                                            opacity: !isEmpty ? 1 : 0.3,
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="relative"
                                    >
                                        {/* Background Empty Heart */}
                                        <Heart className="h-6 w-6 text-slate-600 fill-slate-800" />

                                        {/* Fill Heart (Clipped for half) */}
                                        {!isEmpty && (
                                            <motion.div
                                                className="absolute inset-0 overflow-hidden"
                                                initial={false}
                                                animate={{ width: isFull ? '100%' : '50%' }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Heart className="h-6 w-6 text-rose-500 fill-rose-500 min-w-[1.5rem]" />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Center: Current Level (Large) & XP Bar */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">PROGRESS</span>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-black italic tracking-tighter">LV. {currentLevel}</span>
                        {/* XP Bar */}
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-400"
                                initial={false}
                                animate={{ width: `${(xp / maxXp) * 100}%` }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Score & Combo */}
                <div className="flex items-center gap-6">
                    <AnimatePresence mode="wait">
                        {combo >= 3 && (
                            <motion.div
                                key="combo"
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400"
                            >
                                <Zap className="h-4 w-4 fill-orange-400" />
                                <span className="text-sm font-black italic">{combo} COMBO!</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SCORE</span>
                        <motion.div
                            key={score}
                            initial={{ scale: 1.2, color: '#818cf8' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            className="text-2xl font-black tabular-nums tracking-tight"
                        >
                            {score.toLocaleString()}
                        </motion.div>
                    </div>

                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Trophy className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>

            {/* Visual indicator for danger (Low HP) */}
            {hp === 1 && (
                <motion.div
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-x-0 bottom-0 h-1 bg-red-500 shadow-[0_-4px_12px_rgba(239,68,68,0.5)]"
                />
            )}
        </header>
    );
}
