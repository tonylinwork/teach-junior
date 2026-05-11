
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MathKeyboardProps {
    onInsert: (symbol: string) => void;
    className?: string;
}

const MATH_SYMBOLS = [
    { label: '√', value: '\\sqrt{', description: '根號' },
    { label: 'ⁿ√', value: '\\sqrt[ ]{', description: 'n次方根' },
    { label: '分', value: '\\frac{ }{ }', description: '分數' },
    { label: 'x²', value: '^{2}', description: '平方' },
    { label: 'xⁿ', value: '^{ }', description: '次方' },
    { label: 'π', value: '\\pi', description: '圓周率' },
    { label: '±', value: '\\pm', description: '正負' },
    { label: '∠', value: '\\angle', description: '角度' },
    { label: 'sin', value: '\\sin ', description: '正弦' },
    { label: 'cos', value: '\\cos ', description: '餘弦' },
    { label: 'tan', value: '\\tan ', description: '正切' },
    { label: 'θ', value: '\\theta', description: 'Theta' },
    { label: 'α', value: '\\alpha', description: 'Alpha' },
    { label: 'β', value: '\\beta', description: 'Beta' },
    { label: 'Δ', value: '\\Delta', description: 'Delta' },
    { label: '∞', value: '\\infty', description: '無限大' },
    { label: '≠', value: '\\neq', description: '不等於' },
    { label: '≤', value: '\\le', description: '小於等於' },
    { label: '≥', value: '\\ge', description: '大於等於' },
    { label: '°', value: '^{\\circ}', description: '度' },
    { label: '∈', value: '\\in', description: '屬於' },
    { label: 'ℚ', value: '\\mathbb{Q}', description: '有理數集' },
    { label: 'ℝ', value: '\\mathbb{R}', description: '實數集' },
    { label: '∫', value: '\\int_{ }^{ }', description: '積分' },
    { label: '∑', value: '\\sum_{ }^{ }', description: '連加' },
];

export function MathKeyboard({ onInsert, className }: MathKeyboardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex flex-wrap gap-1.5 p-3 rounded-2xl border border-slate-200/60 shadow-xl glass-card",
                className
            )}
        >
            {MATH_SYMBOLS.map((sym) => (
                <button
                    key={sym.value}
                    title={sym.description}
                    onClick={() => onInsert(sym.value)}
                    className="flex h-10 min-w-[40px] items-center justify-center px-3 rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-md hover:bg-blue-50/30 active:scale-90 transition-all cursor-pointer"
                >
                    {sym.label}
                </button>
            ))}
        </motion.div>
    );
}
