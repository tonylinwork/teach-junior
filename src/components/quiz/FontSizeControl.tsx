import { useState, useEffect } from 'react';
import { Type } from 'lucide-react';

type FontSize = 'normal' | 'large' | 'extra-large';

const fontSizeMap = {
    'normal': { label: '普通', class: 'text-base' },
    'large': { label: '大', class: 'text-lg' },
    'extra-large': { label: '特大', class: 'text-xl' }
};

export function FontSizeControl() {
    const [fontSize, setFontSize] = useState<FontSize>('normal');

    // Load saved preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('fontSize') as FontSize;
        if (saved && fontSizeMap[saved]) {
            setFontSize(saved);
            document.documentElement.setAttribute('data-font-size', saved);
        }
    }, []);

    const handleFontSizeChange = (size: FontSize) => {
        setFontSize(size);
        localStorage.setItem('fontSize', size);
        document.documentElement.setAttribute('data-font-size', size);
    };

    return (
        <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-slate-400" />
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                {(Object.keys(fontSizeMap) as FontSize[]).map((size) => (
                    <button
                        key={size}
                        onClick={() => handleFontSizeChange(size)}
                        className={`
                            px-3 py-1.5 text-xs font-bold rounded-md transition-all
                            ${fontSize === size
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }
                        `}
                    >
                        {fontSizeMap[size].label}
                    </button>
                ))}
            </div>
        </div>
    );
}
