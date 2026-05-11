import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Trophy, Users, Star, BarChart3, GraduationCap, Zap } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
    onChallenge: () => void;
}

export function LandingPage({ onStart, onChallenge }: LandingPageProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navbar */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 glass-card rounded-2xl w-[90%] max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-indigo-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                        <GraduationCap className="text-white h-6 w-6" />
                    </div>
                    <span className="text-xl font-black text-slate-800 tracking-tight">林哲數學 <span className="text-indigo-600">Junior</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onStart}
                        className="clay-btn-premium px-6 py-2.5 text-sm font-black text-slate-700 hover:text-indigo-600"
                    >
                        開始探索
                    </button>
                    <button
                        onClick={onChallenge}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        挑戰模式
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-48 pb-24 px-6 relative">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-10"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/70 glass-card text-indigo-700 font-bold text-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                            </span>
                            全新 3D 互動教學系統
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black text-slate-800 leading-[1.05] tracking-tight">
                            讓數學變得很 <br />
                            <span className="text-gradient">立體好玩</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl text-slate-500 leading-relaxed max-w-lg font-medium">
                            跳脫枯燥的紙本練習！結合 Desmos 互動圖表與 Claymorphism 設計，為您打造視覺與知覺並重的數學遊戲場。
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-wrap gap-5">
                            <button
                                onClick={onStart}
                                className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-2xl text-white font-black text-lg shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1.5 transition-all duration-300"
                            >
                                <span className="flex items-center gap-3">
                                    立即開始學習
                                    <ArrowRight className="group-hover:translate-x-1.5 transition-transform" />
                                </span>
                            </button>
                            <button className="px-10 py-5 clay-btn-premium rounded-2xl text-slate-600 font-black text-lg">
                                了解更多
                            </button>
                            <button
                                onClick={onChallenge}
                                className="px-10 py-5 bg-slate-900 rounded-2xl text-white font-black text-lg shadow-xl hover:bg-slate-800 hover:-translate-y-1.5 transition-all flex items-center gap-3"
                            >
                                <Zap className="h-5 w-5 text-orange-400 fill-orange-400" />
                                極限挑戰
                            </button>
                        </motion.div>

                        {/* Stats/Proof */}
                        <motion.div variants={itemVariants} className="flex items-center gap-5 pt-4">
                            <div className="flex -space-x-3.5">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-100 bg-white shadow-sm overflow-hidden transform hover:-translate-y-1 transition-transform">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 456}`} alt="Student" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-slate-700">1,200+ 學生好評推薦</span>
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="fill-current w-4 h-4 shadow-sm" />)}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Hero Visual - Premium Floating Interface */}
                    <div className="relative perspective-1000 hidden lg:block">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotateY: 15 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative premium-clay-card p-10 bg-white/40 backdrop-blur-md animate-float"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">即時學習數據</h3>
                                    <p className="text-sm font-bold text-slate-400">MATH PERFORMANCE</p>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-2xl shadow-sm border border-indigo-100">
                                    <BarChart3 className="text-indigo-600 h-8 w-8" />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-slate-600">三角形全等</span>
                                        <span className="text-2xl font-black text-indigo-600">85%</span>
                                    </div>
                                    <div className="h-4 bg-slate-100/50 rounded-full overflow-hidden inner-shadow-soft">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '85%' }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-slate-600">一元二次方程式</span>
                                        <span className="text-2xl font-black text-cyan-600">62%</span>
                                    </div>
                                    <div className="h-4 bg-slate-100/50 rounded-full overflow-hidden inner-shadow-soft">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '62%' }}
                                            transition={{ duration: 1.5, delay: 0.7 }}
                                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5 mt-10">
                                    <div className="bg-white/60 p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 group hover:bg-white transition-colors">
                                        <div className="p-2.5 bg-amber-50 rounded-xl">
                                            <Trophy className="text-amber-500 h-7 w-7" />
                                        </div>
                                        <span className="font-black text-slate-700">成就挑戰</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">12 BADGES</span>
                                    </div>
                                    <div className="bg-white/60 p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 group hover:bg-white transition-colors">
                                        <div className="text-3xl font-black text-indigo-600">15</div>
                                        <span className="font-black text-slate-700">連續學習</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STREAK DAYS</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute -top-12 -right-8 w-24 h-24 bg-fuchsia-100/80 glass-card rounded-3xl flex items-center justify-center p-4 shadow-xl -z-10"
                        >
                            <span className="text-4xl">📐</span>
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                            className="absolute -bottom-10 -left-12 w-28 h-28 bg-indigo-50/80 glass-card rounded-[2.5rem] flex items-center justify-center p-4 shadow-xl -z-10"
                        >
                            <span className="text-4xl">🔢</span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features section with premium cards */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-xl font-black text-indigo-600 uppercase tracking-[0.2em]">CORE FEATURES</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-slate-800">為什麼我們的教學很有感？</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Users className="w-8 h-8 text-blue-500" />,
                                title: "社群探索",
                                desc: "與數千名同學在線上切磋解題，討論那些課本沒教的直覺技巧。",
                                color: "blue"
                            },
                            {
                                icon: <BookOpen className="w-8 h-8 text-fuchsia-500" />,
                                title: "視覺化筆記",
                                desc: "所有章節均提供互動圖表與精美筆記，讓您眼睛看得到的數學才叫學會。",
                                color: "fuchsia"
                            },
                            {
                                icon: <Trophy className="w-8 h-8 text-amber-500" />,
                                title: "遊戲化紀錄",
                                desc: "測驗紀錄、成就徽章與學習天數，讓數學練習變得像破關一樣上癮。",
                                color: "amber"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="premium-clay-card p-10 flex flex-col items-center text-center">
                                <div className={`p-5 rounded-2xl bg-${feature.color}-50 mb-8 shadow-inner-soft border border-${feature.color}-100`}>
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-black text-slate-800 mb-4">{feature.title}</h4>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Catalog section */}
            <section className="py-32 px-6 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">精選教材目錄</h2>
                            <p className="text-slate-500 font-bold">隨時隨地開啟您的進階學習課程</p>
                        </div>
                        <button onClick={onStart} className="flex items-center gap-2 text-indigo-600 font-black hover:translate-x-1 transition-transform">
                            前往完整書庫 <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {['國一上', '國一下', '國二上', '國二下'].map((book, i) => (
                            <div key={i} onClick={onStart} className="premium-clay-card p-6 cursor-pointer group hover:bg-white">
                                <div className="aspect-[4/3] rounded-[2rem] bg-slate-200 mb-6 overflow-hidden relative shadow-inner">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${i === 0 ? 'from-indigo-400 to-violet-500' :
                                        i === 1 ? 'from-fuchsia-400 to-pink-500' :
                                            i === 2 ? 'from-cyan-400 to-blue-500' :
                                                'from-emerald-400 to-teal-500'
                                        } opacity-90 group-hover:scale-110 transition-transform duration-700 ease-out`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white text-3xl font-black drop-shadow-xl">{book}</span>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black text-slate-800 mb-1">{book}</h4>
                                <p className="text-xs font-bold text-slate-400 tracking-wider">持續更新中</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-20 text-center text-slate-400 bg-white">
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="flex justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    </div>
                    <p className="font-bold">&copy; 2026 林哲數學 <span className="text-indigo-600">Junior</span>. <br className="md:hidden" /> 國中數學，一節一節打好基礎。</p>
                </div>
            </footer>
        </div>
    );
}
