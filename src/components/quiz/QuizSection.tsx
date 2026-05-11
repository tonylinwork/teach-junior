
import { Section, AnswerState } from '@/types';
import { QuestionCard } from '@/components/quiz/QuestionCard';

interface QuizSectionProps {
    section: Section;
    chapterId?: string;
    onAnswer?: (questionId: string, isCorrect: boolean, needsManualCheck?: boolean, selectedAnswer?: string) => void;
    onUpdateQuestion?: (updatedQuestion: any) => void;
    answers?: AnswerState;
}

export function QuizSection({ section, chapterId, onAnswer, onUpdateQuestion, answers }: QuizSectionProps) {
    return (
        <div className="mb-12">
            <div className="mb-8 flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-2 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full shadow-lg shadow-violet-200" />
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-800">
                            {section.name}
                        </h2>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                章節部分
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm border border-slate-100">
                    <span className="text-xs font-black text-slate-700">
                        {section.questions.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        題目
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                {section.questions.map((q) => (
                    <QuestionCard
                        key={q.id}
                        question={q}
                        chapterId={chapterId}
                        savedState={answers?.[q.id]}
                        onAnswer={(isCorrect, needsManualCheck, selectedAnswer) => onAnswer && onAnswer(q.id, isCorrect, needsManualCheck, selectedAnswer)}
                        onUpdateQuestion={onUpdateQuestion}
                    />
                ))}
            </div>
        </div>
    );
}
