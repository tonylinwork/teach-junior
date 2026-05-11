import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, Star, Zap, Activity } from 'lucide-react';
import { GameState } from '../../lib/challenge-logic';

interface GameOverModalProps {
    gameState: GameState;
    onRestart: () => void;
    onReview: () => void;
    onExit: () => void;
}

export function GameOverModal({ gameState, onRestart, onReview, onExit }: GameOverModalProps) {
    const { score, maxCombo, currentLevel } = gameState;

    // Calculate Grade
    const getGrade = () => {
        if (score > 2000) return { label: 'S', color: 'text-amber-400', desc: '超越顛峰的數學之神！' };
        if (score > 1200) return { label: 'A', color: 'text-fuchsia-400', desc: '極其優秀的邏輯大師！' };
        if (score > 500) return { label: 'B', color: 'text-indigo-400', desc: '實力堅韌的挑戰者！' };
        return { label: 'C', color: 'text-slate-400', desc: '再接再厲，潛力無窮！' };
    };

    const grade = getGrade();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-2xl premium-clay-card bg-slate-900 border-slate-800 p-8 sm:p-12 text-center text-white overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]"
            >
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500" />
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[100px] -z-10" />

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    className="mx-auto w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-8"
                >
                    <Trophy className="h-12 w-12 text-white" />
                </motion.div>

                <h2 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">挑戰結束！</h2>
                <p className="text-slate-400 font-bold text-lg mb-10">{grade.desc}</p>

                {/* Performance Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center">
                        <Star className="h-5 w-5 text-amber-500 mb-2" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">最終得分</span>
                        <div className="text-3xl font-black tabular-nums">{score.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center">
                        <Zap className="h-5 w-5 text-orange-500 mb-2" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">最高連擊</span>
                        <div className="text-3xl font-black tabular-nums">{maxCombo}</div>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center">
                        <Activity className="h-5 w-5 text-indigo-500 mb-2" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">突破關卡</span>
                        <div className="text-3xl font-black tabular-nums">{currentLevel - 1}</div>
                    </div>
                </div>

                {/* Final Grade Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex flex-col items-center mb-12"
                >
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-2">FINAL RANKING</span>
                    <div className={`text-8xl font-black italic ${grade.color} drop-shadow-[0_0_30px_currentColor]`}>
                        {grade.label}
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="flex flex-col gap-4 mb-8">
                    <button
                        onClick={onReview}
                        className="w-full flex items-center justify-center gap-2 py-5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-3xl font-black text-lg shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                    >
                        <Star className="h-6 w-6" />
                        檢視作答詳情
                    </button>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onRestart}
                            className="flex-1 flex items-center justify-center gap-2 py-5 bg-white text-slate-900 rounded-3xl font-black text-lg shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                        >
                            <RotateCcw className="h-6 w-6" />
                            再試一次
                        </button>
                        <button
                            onClick={onExit}
                            className="flex-1 flex items-center justify-center gap-2 py-5 bg-slate-800 text-white rounded-3xl font-black text-lg border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
                        >
                            <Home className="h-6 w-6" />
                            返回大廳
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
