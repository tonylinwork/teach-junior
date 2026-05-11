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
                    <div className="flex items-center gap-4">
                        <a className="flex items-center space-x-2" href="/">
                            <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-violet-200">
                                <div className="text-white font-black text-xs">TA</div>
                            </div>
                            <span className="font-black text-slate-800 tracking-tighter text-xl">
                                TeachAssistant
                            </span>
                        </a>
                        {title && (
                            <div className="flex items-center gap-2 text-sm font-medium border-l border-slate-300 pl-4 ml-2">
                                <span className="text-slate-500">目前章節:</span>
                                <span className="text-slate-900 font-bold">{title}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-[1800px] py-6 md:py-10 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none"
                    >
                        <ArrowUp className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
