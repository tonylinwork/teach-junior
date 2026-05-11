import { useState, useMemo, useEffect } from 'react';
import { QuizLayout } from '@/components/layout/QuizLayout';
import { QuizSection } from '@/components/quiz/QuizSection';
import { QuizProgress } from '@/components/quiz/QuizProgress';
import { ImportDialog } from '@/components/quiz/ImportDialog';
import { FontSizeControl } from '@/components/quiz/FontSizeControl';
import { ImageZoom } from '@/components/quiz/ImageZoom';
import { PlusCircle, Library, Trash2, ChevronDown, ArrowLeft, RotateCcw } from 'lucide-react';
import { QuizData, AnswerState } from '@/types';
import { QuestionSidebar } from '@/components/quiz/QuestionSidebar';
import { MathRenderer } from '@/components/quiz/MathRenderer';

interface QuizAppProps {
    onBack?: () => void;
}

type ChapterOption = {
    id: string;
    title: string;
    book: string;
    chapterTitle: string;
};

const parseChapterTitle = (chapter: { id: string; title: string }): ChapterOption => {
    const match = chapter.title.match(/^(國[一二三][上下])\s+(.+)$/);

    return {
        ...chapter,
        book: match?.[1] || '其他',
        chapterTitle: match?.[2] || chapter.title
    };
};

export function QuizApp({ onBack }: QuizAppProps) {
    const [chapters, setChapters] = useState<{ id: string, title: string }[]>([]);
    const [currentChapterId, setCurrentChapterId] = useState<string>('');

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [answers, setAnswers] = useState<AnswerState>({});
    const [isImportOpen, setIsImportOpen] = useState(false);

    const fetchChapters = async () => {
        try {
            const res = await fetch('/api/list-chapters');
            if (!res.ok) throw new Error('API not available');
            const data = await res.json();
            const chaptersArray = Array.isArray(data) ? data : [];
            setChapters(chaptersArray);
            if (chaptersArray.length > 0 && !currentChapterId) {
                setCurrentChapterId(chaptersArray[0].id);
            }
        } catch (err) {
            console.log('Falling back to static chapters.json');
            try {
                const module = await import('../data/chapters.json');
                const chaptersArray = (module.default || []) as { id: string, title: string }[];
                setChapters(chaptersArray);
                if (chaptersArray.length > 0 && !currentChapterId) {
                    setCurrentChapterId(chaptersArray[0].id);
                }
            } catch (staticErr) {
                console.error('Failed to load static chapters:', staticErr);
            }
        }
    };

    const handleReset = () => {
        if (!confirm('確定要清除本章節的所有作答紀錄嗎？')) return;
        setAnswers({});
        if (currentChapterId) {
            localStorage.removeItem(`quiz_answers_${currentChapterId}`);
        }
    };

    const handleDeleteChapter = async () => {
        if (!currentChapterId) return;
        if (!confirm('確定要刪除此章節嗎？這將會移除相關的 HTML 與圖片資料。')) return;

        try {
            const res = await fetch('/api/delete-chapter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapterId: currentChapterId })
            });

            if (res.ok) {
                localStorage.removeItem(`quiz_answers_${currentChapterId}`);

                const updatedChapters = chapters.filter(ch => ch.id !== currentChapterId);
                setChapters(updatedChapters);
                if (updatedChapters.length > 0) {
                    setCurrentChapterId(updatedChapters[0].id);
                } else {
                    setCurrentChapterId('');
                    setQuizData(null);
                }
            } else {
                alert('刪除失敗');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('發生錯誤');
        }
    };

    useEffect(() => {
        fetchChapters();
    }, []);

    // Load answers when chapter changes
    useEffect(() => {
        if (!currentChapterId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        import(`../data/${currentChapterId}.json`)
            .then(module => {
                setQuizData(module.default);

                const savedAnswers = localStorage.getItem(`quiz_answers_${currentChapterId}`);
                if (savedAnswers) {
                    try {
                        setAnswers(JSON.parse(savedAnswers));
                    } catch (e) {
                        console.error('Failed to parse saved answers:', e);
                        setAnswers({});
                    }
                } else {
                    setAnswers({});
                }

                setIsLoading(false);
            })
            .catch(err => {
                console.warn('Failed to load chapter data:', err);
                setQuizData(null);
                setIsLoading(false);
            });
    }, [currentChapterId]);

    const totalQuestions = useMemo(() => {
        if (!quizData) return 0;
        return quizData.sections.reduce((acc, section) => acc + section.questions.length, 0);
    }, [quizData]);

    const chapterOptions = useMemo(() => chapters.map(parseChapterTitle), [chapters]);
    const currentChapter = useMemo(
        () => chapterOptions.find(ch => ch.id === currentChapterId),
        [chapterOptions, currentChapterId]
    );
    const bookOptions = useMemo(() => {
        const seen = new Set<string>();
        return chapterOptions
            .map(ch => ch.book)
            .filter(book => {
                if (seen.has(book)) return false;
                seen.add(book);
                return true;
            });
    }, [chapterOptions]);
    const selectedBook = currentChapter?.book || bookOptions[0] || '';
    const chaptersInSelectedBook = useMemo(
        () => chapterOptions.filter(ch => ch.book === selectedBook),
        [chapterOptions, selectedBook]
    );

    const handleBookChange = (book: string) => {
        const firstChapter = chapterOptions.find(ch => ch.book === book);
        if (firstChapter) {
            setCurrentChapterId(firstChapter.id);
        }
    };

    const handleAnswer = (questionId: string, isCorrect: boolean, needsManualCheck: boolean = false, selectedAnswer: string = '') => {
        setAnswers(prev => {
            const newAnswers = {
                ...prev,
                [questionId]: {
                    selectedAnswer,
                    isCorrect,
                    isSubmitted: true,
                    needsManualCheck
                }
            };

            if (currentChapterId) {
                localStorage.setItem(`quiz_answers_${currentChapterId}`, JSON.stringify(newAnswers));
            }

            return newAnswers;
        });
    };

    const handleUpdateQuestion = (updatedQuestion: any) => {
        if (!quizData) return;
        setQuizData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                sections: prev.sections.map(section => ({
                    ...section,
                    questions: section.questions.map(q =>
                        q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q
                    )
                }))
            };
        });
    };

    return (
        <QuizLayout title={quizData?.title}>
            <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 pb-32">
                <div className="flex flex-col lg:flex-row gap-12 pt-8">
                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 px-3 py-2 rounded-xl hover:bg-blue-50 w-fit"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    <span className="font-bold">回到首頁</span>
                                </button>
                            )}
                        </div>

                        <div className="mb-12 flex flex-col items-center md:flex-row md:justify-between gap-6 relative">
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                                    <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-100 uppercase tracking-wider">
                                        <Library className="h-3.5 w-3.5" />
                                        精選教材
                                    </span>
                                </div>
                                <h1 className="text-5xl font-black tracking-tight lg:text-7xl mb-6 text-slate-800 font-sans">
                                    {quizData?.title || (isLoading ? '正在讀取...' : '尚無教材')}
                                </h1>
                                <p className="text-lg text-slate-500 max-w-2xl">
                                    {quizData ? '請認真完成下列題目，點擊「檢查答案」即可確認詳細解析與正確答案。' : '目前尚未上傳任何教學投影片或題目。'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <FontSizeControl />

                                <div className="flex items-center gap-2">
                                    {/* Chapter Selection from chapters.json */}
                                    <div className="relative group">
                                        <select
                                            value={selectedBook}
                                            onChange={(e) => handleBookChange(e.target.value)}
                                            className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2 text-sm font-bold text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm min-w-[112px]"
                                        >
                                            {bookOptions.length === 0 && (
                                                <option value="">無冊別資料</option>
                                            )}
                                            {bookOptions.map(book => (
                                                <option key={book} value={book}>{book}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            value={currentChapterId}
                                            onChange={(e) => setCurrentChapterId(e.target.value)}
                                            className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2 text-sm font-bold text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm max-w-[300px]"
                                        >
                                            {chaptersInSelectedBook.length === 0 && (
                                                <option value="">無章節資料</option>
                                            )}
                                            {chaptersInSelectedBook.map(ch => (
                                                <option key={ch.id} value={ch.id}>{ch.chapterTitle}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>

                                    {currentChapterId && (
                                        <>
                                            <button
                                                onClick={handleReset}
                                                title="重置作答"
                                                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={handleDeleteChapter}
                                                title="刪除此章節"
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => window.open('/#summary', '_blank')}
                                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                                >
                                    <Library className="h-5 w-5" />
                                    重點總整理
                                </button>
                                {!import.meta.env.PROD && (
                                    <button
                                        onClick={() => setIsImportOpen(true)}
                                        className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                                    >
                                        <PlusCircle className="h-5 w-5" />
                                        匯入新章節
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-violet-500 animate-spin shadow-lg" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Library className="h-6 w-6 text-violet-500" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-800 text-lg tracking-tight">正在準備題目中</p>
                                    <p className="text-sm font-bold text-slate-400 mt-2">這可能需要幾秒鐘時間...</p>
                                </div>
                            </div>
                        ) : quizData ? (
                            <div className="space-y-8">
                                {quizData.notice && (
                                    <div className="rounded-2xl border border-sky-200 bg-sky-50/70 px-5 py-4 flex items-start gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">ℹ</span>
                                        <MathRenderer
                                            className="text-sm text-sky-900 leading-relaxed"
                                            content={quizData.notice}
                                        />
                                    </div>
                                )}

                                {quizData.summary && (
                                    <div className="clay-card border-none bg-amber-50/50 p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                            <div className="h-32 w-32 rounded-full bg-amber-400 blur-3xl" />
                                        </div>
                                        <h3 className="text-2xl font-black text-amber-900 mb-6 flex items-center gap-4 relative z-10">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-2xl shadow-inner-soft border border-amber-100">💡</span>
                                            本章重點精華
                                        </h3>
                                        <div className="bg-white/50 rounded-2xl p-6 shadow-inner-soft backdrop-blur-sm relative z-10 border border-amber-100">
                                            <MathRenderer
                                                className="prose prose-amber max-w-none text-slate-700 leading-relaxed font-bold"
                                                content={quizData.summary}
                                            />
                                        </div>
                                    </div>
                                )}

                                {quizData.warmup && (
                                    <div className="clay-card border-none bg-teal-50/50 p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                            <div className="h-32 w-32 rounded-full bg-teal-400 blur-3xl" />
                                        </div>
                                        <h3 className="text-xl font-black text-teal-800 mb-4 flex items-center gap-3 relative z-10">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-lg">🔥</span>
                                            考前暖身
                                        </h3>
                                        <div className="bg-white/60 rounded-xl p-4 shadow-sm backdrop-blur-sm relative z-10 border border-teal-100">
                                            <MathRenderer
                                                className="prose prose-teal max-w-none text-slate-700 leading-relaxed font-medium"
                                                content={quizData.warmup}
                                            />
                                        </div>
                                    </div>
                                )}

                                {quizData.sections.map((section, index) => (
                                    <QuizSection
                                        key={`${currentChapterId}-section-${index}`}
                                        section={section}
                                        chapterId={currentChapterId}
                                        onAnswer={handleAnswer}
                                        onUpdateQuestion={handleUpdateQuestion}
                                        answers={answers}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <Library className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold text-xl">尚無測驗資料</p>
                                <p className="text-slate-400 mt-2">
                                    {import.meta.env.PROD
                                        ? '請聯絡老師上傳最新考題。'
                                        : '請點擊右上方「匯入章節」開始建立您的測驗庫。'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar Nav */}
                    {quizData && !isLoading && (
                        <QuestionSidebar quizData={quizData} answers={answers} />
                    )}
                </div>
            </div>

            <QuizProgress totalQuestions={totalQuestions} answers={answers} />

            <ImportDialog
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={(id) => {
                    fetchChapters();
                    setCurrentChapterId(id);
                }}
            />

            <ImageZoom />
        </QuizLayout>
    );
}
