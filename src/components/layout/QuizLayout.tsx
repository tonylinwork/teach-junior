import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function QuizLayout({ children, title }: QuizLayoutProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#f0f4f8] font-sans text-slate-900">
            <header className="sticky top-0 z-50 w-full glass-card border-none bg-white/80">
                <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 flex h-16 items-center">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                        <a className="flex shrink-0 items-center space-x-2" href="/">
                            <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-violet-200">
                                <div className="text-white font-black text-xs">TA</div>
                            </div>
                            <span className="hidden sm:inline font-black text-slate-800 tracking-tighter text-xl">
                                TeachAssistant
                            </span>
                        </a>
                        {title && (
                            <div className="flex min-w-0 items-center gap-2 text-sm font-medium sm:border-l border-slate-300 sm:pl-4 sm:ml-2">
                                <span className="hidden sm:inline text-slate-500 shrink-0">目前章節:</span>
                                <span className="truncate text-base sm:text-sm text-slate-900 font-bold">{title}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-[1800px] py-2 md:py-10 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-32 right-4 sm:bottom-8 sm:right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none"
                    >
                        <ArrowUp className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
