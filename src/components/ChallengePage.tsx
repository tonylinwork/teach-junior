import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChallengeGame } from '../lib/challenge-logic';
import { GameHeader } from './game/GameHeader';
import { GameOverModal } from './game/GameOverModal';
import { QuestionCard } from './quiz/QuestionCard';
import { GameProgressMap } from './game/GameProgressMap';
import { Target, Zap, Trophy, ArrowRight, Loader2 } from 'lucide-react';

interface ChallengePageProps {
    onBack: () => void;
}

export function ChallengePage({ onBack }: ChallengePageProps) {
    const { gameState, questions, isLoading, initGame, processAnswer, finishGame } = useChallengeGame();
    const [gameStarted, setGameStarted] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const currentQuestion = useMemo(() => {
        if (!gameStarted || questions.length === 0) return null;
        return questions[gameState.questionIndex];
    }, [gameStarted, questions, gameState.questionIndex]);

    const handleAnswer = (isCorrect: boolean, _manual?: boolean, userAnswer?: string) => {
        processAnswer(isCorrect, userAnswer || '');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
                <p className="font-black tracking-widest uppercase text-slate-500">正在備戰題庫...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            <AnimatePresence>
                {!gameStarted && !gameState.isGameOver ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 -z-10" />

                        <div className="max-w-2xl w-full text-center space-y-12">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 font-bold text-sm backdrop-blur-md"
                            >
                                <Target className="h-4 w-4" />
                                跨單元全屏挑戰模式
                            </motion.div>

                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-6xl sm:text-8xl font-black tracking-tighter leading-none"
                            >
                                極限 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">連擊挑戰</span>
                            </motion.h1>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-400 font-medium max-w-lg mx-auto leading-relaxed"
                            >
                                準備好接受挑戰了嗎？系統將從所有單元中隨機抽取題目。答錯將扣除生命值，連續答對可獲得積分加乘！
                            </motion.p>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-3 gap-6 py-8"
                            >
                                <div className="space-y-2">
                                    <div className="text-2xl font-black text-white">3</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">初始生命</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-2xl font-black text-white">{questions.length}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">總題庫量</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-2xl font-black text-white">∞</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">挑戰上限</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <button
                                    onClick={() => setGameStarted(true)}
                                    className="px-12 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xl shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    開始挑戰
                                    <ArrowRight className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={onBack}
                                    className="px-12 py-5 bg-slate-800 text-white rounded-[2rem] font-black text-xl border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
                                >
                                    返回大廳
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {gameStarted && (
                <>
                    <GameHeader gameState={gameState} onExit={finishGame} />

                    <main className="mx-auto max-w-[1800px] px-6 py-12 pb-32">
                        <GameProgressMap currentLevel={gameState.currentLevel} />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={gameState.questionIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            >
                                {currentQuestion && (
                                    <QuestionCard
                                        question={currentQuestion}
                                        onAnswer={(isCorrect, manual, answer) => handleAnswer(isCorrect, manual, answer)}
                                        // 闖關模式不保存進度，強制不使用 savedState
                                        savedState={undefined}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    {/* Footer Tips */}
                    <footer className="fixed bottom-0 inset-x-0 h-20 bg-gradient-to-t from-slate-950 to-transparent flex items-center justify-center pointer-events-none">
                        <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3" />
                                COMBO X1.2 AT 5+
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy className="h-3 w-3" />
                                UNLOCK S RANK AT 2000
                            </div>
                        </div>
                    </footer>
                </>
            )}

            <AnimatePresence>
                {gameState.isGameOver && !isReviewMode && (
                    <GameOverModal
                        gameState={gameState}
                        onRestart={() => {
                            initGame();
                            setGameStarted(true);
                        }}
                        onReview={() => setIsReviewMode(true)}
                        onExit={onBack}
                    />
                )}
            </AnimatePresence>

            {/* Review Mode UI */}
            <AnimatePresence>
                {isReviewMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="fixed inset-0 z-[110] bg-slate-950 overflow-y-auto"
                    >
                        <header className="sticky top-0 z-50 glass-card bg-slate-900/90 border-slate-800 p-6">
                            <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsReviewMode(false)}
                                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <ArrowRight className="h-6 w-6 rotate-180" />
                                    </button>
                                    <h2 className="text-2xl font-black tracking-tight">作答回顧</h2>
                                </div>
                                <div className="flex items-center gap-6 text-sm font-black text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span>答對: {gameState.history.filter(h => h.isCorrect).length}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span>答錯: {gameState.history.filter(h => !h.isCorrect).length}</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <main className="max-w-[1800px] mx-auto px-6 py-12 space-y-12">
                            {gameState.history.map((item, idx) => (
                                <div key={idx} className="relative">
                                    <div className={`absolute -left-4 top-0 bottom-0 w-1 rounded-full ${item.isCorrect ? 'bg-green-500/50' : 'bg-red-500/50'}`} />
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-500">LEVEL {idx + 1}</span>
                                        {item.isCorrect ? (
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded uppercase">Correct</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-black rounded uppercase">Incorrect</span>
                                        )}
                                    </div>
                                    <QuestionCard
                                        question={item.question}
                                        savedState={{
                                            selectedAnswer: item.userAnswer,
                                            isCorrect: item.isCorrect,
                                            isSubmitted: true
                                        }}
                                    />
                                </div>
                            ))}

                            <div className="py-20 text-center">
                                <button
                                    onClick={() => setIsReviewMode(false)}
                                    className="px-12 py-5 bg-slate-800 text-white rounded-[2rem] font-black text-xl border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
                                >
                                    返回結算
                                </button>
                            </div>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
