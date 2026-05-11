
import { QuizData, AnswerState } from '@/types';
import { cn } from '@/lib/utils';
import { Check, X, Keyboard } from 'lucide-react';

interface QuestionSidebarProps {
    quizData: QuizData;
    answers: AnswerState;
}

export function QuestionSidebar({ quizData, answers }: QuestionSidebarProps) {
    const scrollToQuestion = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
                <div className="clay-card overflow-hidden border-none px-4 py-6">
                    <div className="mb-4 flex items-center gap-2 border-b border-slate-200/50 pb-4">
                        <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                        <h3 className="font-bold text-slate-700">測驗導航</h3>
                    </div>
                    <div className="max-h-[calc(100vh-350px)] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {quizData.sections.map((section, sIndex) => (
                            <div key={`side-section-${sIndex}`} className="mb-5 last:mb-0">
                                <h4 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {section.name}
                                </h4>
                                <div className="grid grid-cols-5 gap-2 px-1">
                                    {section.questions.map((q) => {
                                        const state = answers[q.id];
                                        const isCorrect = state?.isCorrect;
                                        const isSubmitted = state?.isSubmitted;

                                        // Determine button style based on state
                                        let btnClass = "clay-btn-secondary text-slate-400 hover:text-slate-600"; // Default

                                        if (isSubmitted) {
                                            if (isCorrect) {
                                                btnClass = "bg-green-100 text-green-600 shadow-inner border border-green-200/50";
                                            } else {
                                                btnClass = "bg-red-100 text-red-600 shadow-inner border border-red-200/50";
                                            }
                                        }

                                        return (
                                            <button
                                                key={`nav-${q.id}`}
                                                onClick={() => scrollToQuestion(q.id)}
                                                className={cn(
                                                    "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95",
                                                    btnClass
                                                )}
                                            >
                                                {q.number}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats Summary below nav */}
                <div className="clay-card p-5 border-none">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">
                        <span>進度摘要</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 clay-icon-display">
                            <Check className="h-4 w-4 text-green-500 mb-1" />
                            <span className="text-xl font-black text-slate-700">
                                {Object.values(answers).filter(a => a.isCorrect && !a.needsManualCheck && a.isSubmitted).length}
                            </span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 clay-icon-display">
                            <X className="h-4 w-4 text-red-500 mb-1" />
                            <span className="text-xl font-black text-slate-700">
                                {Object.values(answers).filter(a => !a.isCorrect && !a.needsManualCheck && a.isSubmitted).length}
                            </span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 clay-icon-display">
                            <Keyboard className="h-4 w-4 text-amber-500 mb-1" />
                            <span className="text-xl font-black text-slate-700">
                                {Object.values(answers).filter(a => a.needsManualCheck && a.isSubmitted).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
