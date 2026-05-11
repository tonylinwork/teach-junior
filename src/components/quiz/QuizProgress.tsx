
import { AnswerState } from '@/types';
import { CheckCircle2, Trophy } from 'lucide-react';

interface QuizProgressProps {
    totalQuestions: number;
    answers: AnswerState;
}

export function QuizProgress({ totalQuestions, answers }: QuizProgressProps) {
    const answeredCount = Object.keys(answers).length;
    const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
    const progressPercentage = (answeredCount / totalQuestions) * 100;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t-0 rounded-b-none border-t border-white/40 pb-6 pt-4 bg-white/90">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 shadow-inner">
                                <span className="text-xs font-black text-slate-600">{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                完成度 <span className="text-slate-900 ml-1 text-sm">{answeredCount} / {totalQuestions}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500 drop-shadow-sm" />
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                得分 <span className="text-slate-900 ml-1 text-sm">{correctCount * 5}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md mx-4">
                        <div className="h-4 w-full rounded-full bg-slate-100 shadow-[inset_2px_2px_4px_rgba(166,180,200,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] p-0.5">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-sm transition-all duration-500 ease-out relative overflow-hidden"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-violet-600 font-black text-sm">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>繼續加油！</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
