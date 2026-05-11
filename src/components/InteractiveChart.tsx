import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface SliderConfig {
    id: string; // e.g. 'a', 'h', 'k'
    label: string; // e.g. '開口方向與大小 (a)'
    min: number;
    max: number;
    step: number;
    defaultValue: number;
}

interface InteractiveChartProps {
    title: string;
    description: string;
    expressions: string[]; // e.g. ['y = a(x-h)^2 + k']
    sliders: SliderConfig[];
}

// Global declaration for Desmos API
declare global {
    interface Window {
        Desmos: any;
    }
}

export function InteractiveChart({ title, description, expressions, sliders }: InteractiveChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const calculatorRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial state for sliders
    const [values, setValues] = useState<Record<string, number>>(() => {
        const init: Record<string, number> = {};
        sliders.forEach(s => init[s.id] = s.defaultValue);
        return init;
    });

    // 1. Load Desmos script
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.Desmos) {
            const script = document.createElement('script');
            script.src = 'https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
            script.async = true;
            script.onload = () => setIsLoaded(true);
            document.head.appendChild(script);
        } else {
            setIsLoaded(true);
        }
    }, []);

    // 2. Initialize Calculator
    useEffect(() => {
        if (!isLoaded || !containerRef.current) return;

        if (!calculatorRef.current) {
            calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
                keypad: false,
                expressions: false,
                settingsMenu: false,
                zoomButtons: false,
                lockViewport: false,
                border: false,
            });

            expressions.forEach((latex, i) => {
                calculatorRef.current?.setExpression({ id: `expr-${i}`, latex });
            });

            sliders.forEach(s => {
                calculatorRef.current?.setExpression({ id: s.id, latex: `${s.id}=${values[s.id]}` });
            });
        }

        return () => {
            if (calculatorRef.current) {
                calculatorRef.current.destroy();
                calculatorRef.current = null;
            }
        };
    }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    // 3. Update variables when slider changes
    useEffect(() => {
        if (!calculatorRef.current) return;
        Object.entries(values).forEach(([id, val]) => {
            calculatorRef.current.setExpression({ id, latex: `${id}=${val}` });
        });
    }, [values]);

    const handleSliderChange = (id: string, val: number) => {
        setValues(prev => ({ ...prev, [id]: val }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 border-t-2 border-slate-100 pt-12"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-indigo-50 p-3 rounded-2xl shadow-inner-soft border border-indigo-100">
                    <span className="text-2xl">📊</span>
                </div>
                <div>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h4>
                    <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full mt-1" />
                </div>
            </div>

            <div className="bg-white/50 p-6 rounded-[2rem] border border-white/60 glass-card mb-8">
                <p className="text-slate-600 leading-relaxed font-bold">
                    {description}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Custom Premium Sliders Container */}
                <div className="w-full lg:w-[350px] space-y-8 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100/50">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-2">
                        <span className="font-black text-slate-800 tracking-tight">參數調整</span>
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">LIVE UPDATE</span>
                    </div>

                    {sliders.map(s => (
                        <div key={s.id} className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-black text-slate-700">{s.label}</label>
                                <motion.span
                                    key={values[s.id]}
                                    initial={{ scale: 1.2, color: '#4f46e5' }}
                                    animate={{ scale: 1, color: '#1e293b' }}
                                    className="text-sm font-black bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 shadow-sm"
                                >
                                    {values[s.id]}
                                </motion.span>
                            </div>
                            <div className="relative h-6 flex items-center">
                                <input
                                    type="range"
                                    min={s.min}
                                    max={s.max}
                                    step={s.step}
                                    value={values[s.id]}
                                    onChange={(e) => handleSliderChange(s.id, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-300 font-black">
                                <span>MIN {s.min}</span>
                                <span>MAX {s.max}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Premium Calculator Window */}
                <div className="flex-1 aspect-[4/3] min-h-[450px] rounded-[2.5rem] overflow-hidden border-[8px] border-slate-900 shadow-2xl relative group bg-white">
                    {/* Mac Window Header */}
                    <div className="h-10 bg-slate-900 w-full absolute top-0 left-0 flex items-center px-6 gap-2.5 z-10">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        <div className="flex-1 text-center pr-12">
                            <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Interactive Graph Engine</span>
                        </div>
                    </div>
                    {/* Desmos Surface */}
                    <div ref={containerRef} className="w-full h-full pt-10" />
                </div>
            </div>
        </motion.div>
    );
}
