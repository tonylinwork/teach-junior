
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Question } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, Keyboard, X, Edit2, Save, Undo } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MathKeyboard } from './MathKeyboard';
import { ScratchPaper } from './ScratchPaper';
import { MathRenderer } from './MathRenderer';

interface QuestionCardProps {
    question: Question;
    chapterId?: string;
    onAnswer?: (isCorrect: boolean, needsManualCheck?: boolean, selectedAnswer?: string) => void;
    onUpdateQuestion?: (updatedQuestion: Question) => void;
    savedState?: {
        selectedAnswer: string;
        isCorrect: boolean;
        isSubmitted: boolean;
        needsManualCheck?: boolean;
    };
}

export function QuestionCard({ question, chapterId, onAnswer, onUpdateQuestion, savedState }: QuestionCardProps) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isManualCheck, setIsManualCheck] = useState(false);
    const [showMathKeyboard, setShowMathKeyboard] = useState(false);

    // Initialize/Sync state from savedState
    useEffect(() => {
        if (savedState) {
            setUserAnswer(savedState.selectedAnswer || '');
            setIsSubmitted(savedState.isSubmitted);
            setIsCorrect(savedState.isCorrect);
            setIsManualCheck(savedState.needsManualCheck || false);
            if (savedState.isSubmitted) {
                setShowAnswer(true);
            }
        }
    }, [savedState]);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        content: question.content,
        answer: question.answer,
        explanation: question.explanation
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleStartEdit = () => {
        setEditForm({
            content: question.content,
            answer: question.answer,
            explanation: question.explanation
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        if (!chapterId) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/update-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chapterId,
                    questionId: question.id,
                    ...editForm
                })
            });

            if (res.ok) {
                if (onUpdateQuestion) {
                    onUpdateQuestion({
                        ...question,
                        ...editForm
                    });
                }
                setIsEditing(false);
            } else {
                alert('儲存失敗');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('發生錯誤');
        } finally {
            setIsSaving(false);
        }
    };

    const beautifyUserAnswer = (input: string) => {
        if (!input) return '';
        let result = input;

        // 1. Auto convert simple fractions: digit/digit or char/digit etc.
        if (!result.includes('\\frac')) {
            // Handle simple cases like 3/2, a/b, 2x/3
            result = result.replace(/(\d+|[a-zA-Z])\/(\d+|[a-zA-Z])/g, '\\frac{$1}{$2}');
        }

        // 2. Auto convert exponents (^): handle x^2, (a+b)^2, x^(10)
        // Match base^exponent where exponent can be alphanumeric or content in parentheses
        if (!result.includes('^{')) {
            // Case 1: base ^ alphanumeric (e.g., x^2 -> x^{2})
            result = result.replace(/(\)|[a-zA-Z0-9])\^([a-zA-Z0-9]+)/g, '$1^{$2}');
            // Case 2: base ^ (expression) (e.g., x^(x+1) -> x^{x+1}) - already user provided parens, but we ensure LaTeX syntax
            result = result.replace(/\^(\((.*?)\))/g, '^{$2}');
        }

        return result;
    };

    const handleInsertSymbol = (symbol: string) => {
        setUserAnswer(prev => prev + symbol);
    };

    // Use provided type if available, otherwise fallback to ID prefix detection
    const type = question.type || (
        question.id.startsWith('true_false') ? 'true_false' :
            question.id.startsWith('single_choice') ? 'single_choice' :
                question.id.startsWith('multi_choice') ? 'multi_choice' :
                    'fill_in'
    );

    const isTrueFalse = type === 'true_false';
    const isSingleChoice = type === 'single_choice';
    const isMultiChoice = type === 'multi_choice';
    const isFillIn = !isTrueFalse && !isSingleChoice && !isMultiChoice;

    const handleMultiChoiceToggle = (opt: string) => {
        setUserAnswer(prev => {
            const current = prev.split('').filter(Boolean);
            if (current.includes(opt)) {
                return current.filter(c => c !== opt).sort().join('');
            } else {
                return [...current, opt].sort().join('');
            }
        });
    };

    const handleManualClassification = (correct: boolean) => {
        setIsCorrect(correct);
        setIsManualCheck(false);
        if (onAnswer) onAnswer(correct, false, userAnswer);
    };

    const handleCheck = (forcedAnswer?: string) => {
        const finalAnswer = forcedAnswer || userAnswer;
        if (!finalAnswer) return;

        // Normalize answer for check - strip HTML and non-breaking spaces
        const cleanAnswerText = question.answer.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        const userInputClean = finalAnswer.trim();

        // Check if answer is primarily an image (no text after stripping HTML)
        const isImageAnswer = question.answer.includes('<img') && cleanAnswerText === '';

        let correct = false;
        let needsManual = false;

        if (isFillIn && isImageAnswer) {
            needsManual = true;
            setIsManualCheck(true);
            setIsCorrect(false);
        } else {
            // Strict comparison
            // Remove spaces for more robust comparison of formulas
            let target = cleanAnswerText.replace(/\s+/g, '');
            let input = userInputClean.replace(/\s+/g, '');

            if (isMultiChoice) {
                // For multi-choice, normalize both to uppercase and sort alphabetically
                target = target.toUpperCase().split('').sort().join('');
                input = input.toUpperCase().split('').sort().join('');
            }

            if (target !== '' && target === input) {
                // Exact match (ignoring whitespace and order for multi-choice)
                correct = true;
                needsManual = false;
                setIsCorrect(true);
                setIsManualCheck(false);

                // Trigger Confetti!
                const rect = document.getElementById(question.id)?.getBoundingClientRect();
                if (rect) {
                    const x = (rect.left + rect.width / 2) / window.innerWidth;
                    const y = (rect.top + rect.height / 2) / window.innerHeight;
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { x, y },
                        colors: ['#4f46e5', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
                    });
                }
            } else {
                // Mismatch
                if (isFillIn) {
                    // Fill-in: Fallback to manual check instead of marking "Wrong"
                    correct = false;
                    needsManual = true;
                    setIsCorrect(false);
                    setIsManualCheck(true);
                } else {
                    // Multiple Choice / True-False: Mark wrong immediately
                    correct = false;
                    needsManual = false;
                    setIsCorrect(false);
                    setIsManualCheck(false);
                }
            }
        }

        setIsSubmitted(true);
        setShowAnswer(true);

        if (onAnswer) onAnswer(correct, needsManual, finalAnswer);
    };


    return (
        <div
            id={question.id}
            className="mb-12 premium-clay-card border-none overflow-hidden scroll-mt-28 transition-all hover:-translate-y-1.5"
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="inline-block rounded-lg bg-slate-100/50 px-3 py-1 text-xs font-extrabold text-slate-500 tracking-wider">
                                    QUESTION {question.number}
                                </span>
                                <ScratchPaper questionId={question.id} questionNumber={question.number} chapterId={chapterId} />
                            </div>
                            {!import.meta.env.PROD && !isEditing && (
                                <button
                                    onClick={handleStartEdit}
                                    className="p-2 text-slate-300 hover:text-indigo-500 transition-colors rounded-full hover:bg-indigo-50"
                                    title="編輯題目"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 mb-6">
                                {/* ... existing editing form inputs ... */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">題目內容 (HTML)</label>
                                    <textarea
                                        value={editForm.content}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none min-h-[100px]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">正確答案</label>
                                    <input
                                        type="text"
                                        value={editForm.answer}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">解析 (HTML)</label>
                                    <textarea
                                        value={editForm.explanation}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none min-h-[80px]"
                                    />
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">編輯預覽</span>
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                        <MathRenderer
                                            className="quiz-content prose prose-slate max-w-none prose-p:my-2"
                                            content={editForm.content}
                                        />
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <h4 className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wider">答案預覽</h4>
                                            <MathRenderer
                                                className="quiz-content text-lg font-medium text-slate-800"
                                                content={editForm.answer}
                                            />
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <h4 className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wider">解析預覽</h4>
                                            <MathRenderer
                                                className="quiz-content text-sm text-slate-600"
                                                content={editForm.explanation}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        <Undo className="h-4 w-4" />
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSaving ? '儲存中...' : '儲存變更'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <MathRenderer
                                className="quiz-content prose prose-slate max-w-none prose-p:my-2 mb-8 text-slate-700 font-medium leading-relaxed"
                                content={question.content}
                            />
                        )}

                        {/* Interaction Area */}
                        {!isSubmitted ? (
                            <div className="space-y-6">
                                {isTrueFalse && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {['○', '╳'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    setUserAnswer(opt);
                                                }}
                                                className={cn(
                                                    "relative overflow-hidden rounded-2xl py-4 px-4 font-black text-2xl transition-all active:scale-[0.98]",
                                                    userAnswer === opt
                                                        ? "text-indigo-600 shadow-inner bg-[#e4ebf5] ring-1 ring-black/5" // Pressed state
                                                        : "clay-btn-secondary text-slate-400 hover:text-slate-600" // Unpressed
                                                )}
                                                style={userAnswer === opt ? { boxShadow: 'inset 4px 4px 8px rgba(166, 180, 200, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)' } : {}}
                                            >
                                                {userAnswer === opt && (
                                                    <motion.div
                                                        layoutId="check-tf"
                                                        className="absolute top-3 right-3"
                                                    >
                                                        <CheckCircle className="h-5 w-5 text-indigo-500" />
                                                    </motion.div>
                                                )}
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {(isSingleChoice) && (
                                    <div className="grid grid-cols-5 gap-4">
                                        {['A', 'B', 'C', 'D', 'E'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    setUserAnswer(opt);
                                                }}
                                                className={cn(
                                                    "relative h-14 rounded-2xl font-black text-lg transition-all active:scale-[0.98]",
                                                    userAnswer === opt
                                                        ? "text-indigo-600 bg-[#e4ebf5] ring-1 ring-black/5"
                                                        : "clay-btn-secondary text-slate-400 hover:text-slate-600"
                                                )}
                                                style={userAnswer === opt ? { boxShadow: 'inset 3px 3px 6px rgba(166, 180, 200, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.9)' } : {}}
                                            >
                                                {userAnswer === opt && (
                                                    <motion.div
                                                        layoutId="check-sc"
                                                        className="absolute top-1 right-1"
                                                    >
                                                        <div className="rounded-full p-0.5">
                                                            <CheckCircle className="h-3 w-3 text-indigo-500" />
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {(isMultiChoice) && (
                                    <div className="grid grid-cols-5 gap-4">
                                        {['A', 'B', 'C', 'D', 'E'].map(opt => {
                                            const isSelected = userAnswer.includes(opt);
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleMultiChoiceToggle(opt)}
                                                    className={cn(
                                                        "relative h-14 rounded-2xl font-black text-lg transition-all active:scale-[0.98]",
                                                        isSelected
                                                            ? "text-indigo-600 bg-[#e4ebf5] ring-1 ring-black/5"
                                                            : "clay-btn-secondary text-slate-400 hover:text-slate-600"
                                                    )}
                                                    style={isSelected ? { boxShadow: 'inset 3px 3px 6px rgba(166, 180, 200, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.9)' } : {}}
                                                >
                                                    {isSelected && (
                                                        <motion.div
                                                            layoutId={`check-mc-${opt}`}
                                                            className="absolute top-1 right-1"
                                                        >
                                                            <div className="rounded-full p-0.5">
                                                                <CheckCircle className="h-3 w-3 text-indigo-500" />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {isFillIn && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">填答區塊</span>
                                            <button
                                                onClick={() => setShowMathKeyboard(!showMathKeyboard)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                                    showMathKeyboard
                                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                                        : "clay-btn-secondary text-slate-500"
                                                )}
                                            >
                                                <Keyboard className="h-4 w-4" />
                                                數學鍵盤
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {showMathKeyboard && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="origin-top"
                                                >
                                                    <MathKeyboard onInsert={handleInsertSymbol} className="mb-4" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <input
                                            type="text"
                                            value={userAnswer}
                                            placeholder="在此輸入答案 (例如: √2, 3/4, 45°)"
                                            className="w-full rounded-2xl border-none bg-slate-50/50 p-6 text-2xl font-black text-slate-800 placeholder:text-slate-300 focus:outline-none transition-all shadow-[inset_2px_2px_4px_rgba(166,180,200,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:bg-slate-50"
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                        />

                                        {/* Live Preview for LaTeX */}
                                        {(userAnswer.includes('\\') || userAnswer.includes('$') || userAnswer.includes('/') || userAnswer.includes('^')) && (
                                            <div className="mt-2 p-6 bg-indigo-50/30 rounded-2xl flex flex-col gap-2">
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">即時預覽</span>
                                                <MathRenderer
                                                    className="text-2xl font-medium text-slate-800"
                                                    content={`$${beautifyUserAnswer(userAnswer)}$`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    disabled={!userAnswer}
                                    onClick={() => handleCheck()}
                                    className={cn(
                                        "w-full rounded-[1.5rem] py-5 text-lg font-black text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative",
                                        userAnswer ? "bg-indigo-600 shadow-xl shadow-indigo-100" : "bg-slate-200 text-slate-400"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <CheckCircle className="h-6 w-6" />
                                        檢查答案
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                    "rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 transition-all premium-shadow",
                                    isManualCheck
                                        ? "bg-amber-50/80 text-amber-800 border-amber-200/50 shadow-amber-100"
                                        : isCorrect
                                            ? "bg-green-50/80 text-green-800 border-green-200/50 shadow-green-100"
                                            : "bg-red-50/80 text-red-800 border-red-200/50 shadow-red-100"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-14 w-14 rounded-full flex items-center justify-center shadow-lg text-white",
                                        isManualCheck
                                            ? "bg-amber-500 shadow-amber-200"
                                            : isCorrect
                                                ? "bg-green-500 shadow-green-200"
                                                : "bg-red-500 shadow-red-200"
                                    )}>
                                        {isManualCheck ? (
                                            <Keyboard className="h-8 w-8" />
                                        ) : isCorrect ? (
                                            <CheckCircle className="h-8 w-8" />
                                        ) : (
                                            <X className="h-8 w-8" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">您的回答</p>
                                        <MathRenderer
                                            className="text-3xl font-black tracking-tight leading-none"
                                            content={`$${beautifyUserAnswer(userAnswer)}$`}
                                        />
                                    </div>
                                </div>
                                <div className="h-px w-full md:h-12 md:w-px bg-current opacity-10" />
                                <div className="text-right">
                                    <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">判定結果</p>
                                    {isManualCheck ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const rect = document.getElementById(question.id)?.getBoundingClientRect();
                                                    if (rect) {
                                                        const x = (rect.left + rect.width / 2) / window.innerWidth;
                                                        const y = (rect.top + rect.height / 2) / window.innerHeight;
                                                        confetti({
                                                            particleCount: 100,
                                                            spread: 70,
                                                            origin: { x, y },
                                                            colors: ['#4f46e5', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
                                                        });
                                                    }
                                                    handleManualClassification(true);
                                                }}
                                                className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-black hover:bg-green-600 transition-all active:scale-95 shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                                            >
                                                正確
                                            </button>
                                            <button
                                                onClick={() => handleManualClassification(false)}
                                                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-all active:scale-95 shadow-[0_4px_12px_rgba(239,44,44,0.3)]"
                                            >
                                                錯誤
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-xl font-bold">
                                            {isCorrect ? '正確' : '不正確'}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100">
                <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="flex w-full items-center justify-between text-xs font-bold text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors uppercase tracking-widest group"
                >
                    <span className="flex items-center gap-2">
                        <div className={cn(
                            "h-2 w-2 rounded-full transition-all group-hover:scale-110",
                            showAnswer ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-slate-300"
                        )} />
                        {showAnswer ? '隱藏詳細解析' : '顯示詳細解析與答案'}
                    </span>
                    {showAnswer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
            </div>

            <AnimatePresence>
                {showAnswer && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-slate-100 bg-slate-50/50 p-6 pt-2">
                            <div className="mb-4">
                                <h4 className="flex items-center text-sm font-bold text-green-700 mb-2">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    正確答案
                                </h4>
                                <MathRenderer
                                    className="quiz-content text-lg font-medium text-slate-800"
                                    content={question.answer}
                                />
                            </div>

                            {question.explanation && question.explanation.length > 10 && (
                                <div>
                                    <h4 className="flex items-center text-sm font-bold text-blue-700 mb-2">
                                        <div className="mr-2 rounded-full border border-blue-200 bg-blue-50 p-0.5">
                                            <span className="block h-2 w-2 rounded-full bg-blue-500" />
                                        </div>
                                        解析
                                    </h4>
                                    <MathRenderer
                                        className="quiz-content prose prose-sm prose-slate max-w-none bg-white p-4 rounded-md border text-slate-600"
                                        content={question.explanation}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
