import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameProgressMapProps {
    currentLevel: number;
    maxVisibleLevels?: number;
}

export function GameProgressMap({ currentLevel, maxVisibleLevels = 10 }: GameProgressMapProps) {
    // 決定地圖顯示的範圍（始終讓玩家處於視野中）
    const startLevel = Math.max(1, currentLevel - 2);
    const levels = Array.from({ length: maxVisibleLevels }, (_, i) => startLevel + i);

    return (
        <div className="relative w-full pt-16 pb-8 mb-8">
            {/* 地圖背景軌道 */}
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-800/50 -translate-y-1/2 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                    initial={false}
                    animate={{ width: `${((currentLevel - startLevel) / (maxVisibleLevels - 1)) * 100}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                />
            </div>

            {/* 關卡點位 */}
            <div className="relative flex justify-between items-center px-4 sm:px-12">
                {levels.map((lvl) => {
                    const isCompleted = lvl < currentLevel;
                    const isCurrent = lvl === currentLevel;
                    const isMilestone = lvl % 5 === 0;

                    return (
                        <div key={lvl} className="relative flex flex-col items-center group">
                            {/* 節點主體 */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.2 : 1,
                                    y: isCurrent ? -4 : 0
                                }}
                                className={cn(
                                    "z-10 h-10 w-10 rounded-full flex items-center justify-center transition-all border-4 shadow-lg",
                                    isCompleted ? "bg-indigo-500 border-indigo-400 shadow-indigo-500/20" :
                                        isCurrent ? "bg-white border-fuchsia-500 shadow-fuchsia-500/40" :
                                            "bg-slate-900 border-slate-700"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5 text-white stroke-[4]" />
                                ) : isCurrent ? (
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <Zap className="h-5 w-5 text-fuchsia-600 fill-fuchsia-500" />
                                    </motion.div>
                                ) : (
                                    <span className="text-xs font-black text-slate-500">{lvl}</span>
                                )}
                            </motion.div>

                            {/* 里程碑寶箱 */}
                            {isMilestone && (
                                <div className="absolute -top-12">
                                    <motion.div
                                        animate={isCompleted ? { opacity: 0.5, y: 5, scale: 0.9 } : {
                                            y: [0, -5, 0],
                                            scale: isCurrent ? [1, 1.1, 1] : 1
                                        }}
                                        transition={{ repeat: Infinity, duration: 2.5 }}
                                        className={cn(
                                            "p-1.5 rounded-lg border-2 shadow-xl",
                                            isCompleted ? "bg-slate-800 border-slate-700 text-slate-500" :
                                                isCurrent ? "bg-gradient-to-br from-orange-400 to-yellow-600 border-yellow-300 text-white animate-pulse" :
                                                    "bg-indigo-900/40 border-indigo-500/30 text-indigo-300"
                                        )}
                                    >
                                        <Gift className="h-4 w-4" />
                                    </motion.div>
                                </div>
                            )}

                            {/* 文字標籤 */}
                            <div className={cn(
                                "absolute -bottom-6 text-[10px] font-black uppercase tracking-widest whitespace-nowrap whitespace-nowrap",
                                isCurrent ? "text-white" : "text-slate-600"
                            )}>
                                {isMilestone ? "Reward" : `LV. ${lvl}`}
                            </div>

                            {/* 玩家抵達時的光暈 */}
                            <AnimatePresence>
                                {isCurrent && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 0.3, scale: 2.5 }}
                                        exit={{ opacity: 0, scale: 3 }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute z-0 h-10 w-10 rounded-full bg-fuchsia-500 pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
