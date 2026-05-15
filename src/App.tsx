import { useState, useEffect, Suspense, lazy } from 'react';

const LandingPage = lazy(() => import('@/components/LandingPage').then(module => ({ default: module.LandingPage })));
const QuizApp = lazy(() => import('@/components/QuizApp').then(module => ({ default: module.QuizApp })));
const SummaryPage = lazy(() => import('@/components/SummaryPage').then(module => ({ default: module.SummaryPage })));
const ChallengePage = lazy(() => import('@/components/ChallengePage').then(module => ({ default: module.ChallengePage })));

function App() {
    // Default to Landing Page
    const [view, setView] = useState<'landing' | 'app' | 'challenge'>('landing');
    const [initialBook, setInitialBook] = useState<string | undefined>(undefined);
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    let content;
    if (hash === '#summary') {
        content = <SummaryPage />;
    } else if (hash === '#challenge') {
        content = <ChallengePage onBack={() => {
            window.location.hash = '';
            setView('landing');
        }} />;
    } else if (view === 'app') {
        // Simple router
        content = <QuizApp onBack={() => setView('landing')} initialBook={initialBook} />;
    } else if (view === 'challenge') {
        content = <ChallengePage onBack={() => setView('landing')} />;
    } else {
        content = <LandingPage onStart={(book) => { setInitialBook(book); setView('app'); }} onChallenge={() => setView('challenge')} />;
    }

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#f0f4f8]">
                <div className="text-xl font-bold text-slate-500 animate-pulse">正在載入，請稍候...</div>
            </div>
        }>
            {content}
        </Suspense>
    );
}

export default App;
