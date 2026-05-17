import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BookOpen, ClipboardCheck, GraduationCap, Trophy, Zap } from 'lucide-react';

interface LandingPageProps {
    onStart: (book?: string) => void;
    onChallenge: () => void;
}

const books = ['國一上', '國一下', '國二上', '國二下', '國三上', '國三下', '歷屆會考'];

export function LandingPage({ onStart, onChallenge }: LandingPageProps) {
    const itemVariants = {
        hidden: { y: 16, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            <nav className="sticky top-4 z-50 mx-auto mt-4 flex w-[92%] max-w-7xl items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur md:px-6">
                <button onClick={onStart} className="flex items-center gap-3 text-left">
                    <div className="rounded-xl bg-indigo-600 p-2.5 shadow-sm">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-black tracking-tight sm:text-xl">
                        林哲數學 <span className="text-indigo-600">Junior</span>
                    </span>
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onStart}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-indigo-600"
                    >
                        題庫練習
                    </button>
                    <button
                        onClick={onChallenge}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
                    >
                        挑戰模式
                    </button>
                </div>
            </nav>

            <main>
                <section className="px-6 pb-16 pt-20 md:pt-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            transition={{ staggerChildren: 0.12 }}
                            className="space-y-8"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm">
                                <ClipboardCheck className="h-4 w-4" />
                                國中數學題庫練習
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-5">
                                <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-slate-900 sm:text-5xl lg:text-6xl">
                                    選單元，寫題目，看解析。
                                </h1>
                                <p className="max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
                                    依年級、冊別與章節練習國中數學題目；作答後保留紀錄，方便複習錯題與重點解析。
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={onStart}
                                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                                >
                                    進入題庫
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={onChallenge}
                                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-base font-black text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800"
                                >
                                    <Zap className="h-5 w-5 text-amber-300" />
                                    隨機挑戰
                                </button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-3">
                                {[
                                    { icon: BookOpen, label: '章節題庫', desc: '依冊別與單元練習' },
                                    { icon: ClipboardCheck, label: '作答紀錄', desc: '自動保存本機進度' },
                                    { icon: Trophy, label: '挑戰模式', desc: '跨單元隨機抽題' }
                                ].map(item => (
                                    <button
                                        key={item.label}
                                        onClick={item.label === '挑戰模式' ? onChallenge : onStart}
                                        className="rounded-2xl border border-white/80 bg-white/80 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:bg-white"
                                    >
                                        <item.icon className="mb-4 h-6 w-6 text-indigo-600" />
                                        <div className="font-black text-slate-800">{item.label}</div>
                                        <div className="mt-1 text-sm font-medium text-slate-500">{item.desc}</div>
                                    </button>
                                ))}
                            </motion.div>
                        </motion.div>

                        <motion.aside
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-slate-200/70"
                        >
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">快速開始</h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">先進題庫後可切換冊別與章節</p>
                                </div>
                                <BarChart3 className="h-7 w-7 text-indigo-600" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {books.map(book => (
                                    <button
                                        key={book}
                                        onClick={() => onStart(book)}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                    >
                                        {book}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={onStart}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800"
                            >
                                開始練習
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </motion.aside>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/70 bg-white/70 px-6 py-8 text-center text-sm font-bold text-slate-400">
                © 2026 林哲數學 Junior
            </footer>
        </div>
    );
}
