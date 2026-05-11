import { useState, useRef, useEffect } from 'react';
import { FileText, Trash2, X, Eraser, Pen } from 'lucide-react';

interface ScratchPaperProps {
    questionId: string;
    questionNumber?: number;
    chapterId?: string;
}

export function ScratchPaper({ questionId, questionNumber, chapterId = 'default' }: ScratchPaperProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [isEraser, setIsEraser] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Canvas dimensions - increased size
    const CANVAS_WIDTH = 700;
    const CANVAS_HEIGHT = 500;

    // Create unique storage key with chapterId
    const storageKey = `scratch-${chapterId}-${questionId}`;

    // Check if localStorage has content for this question
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        setHasContent(!!saved);
    }, [storageKey]);

    // Load saved canvas data from localStorage
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isOpen) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas internal size
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // Set drawing style
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Load saved drawing
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
            img.src = saved;
        }
    }, [isOpen, storageKey]);

    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL();
        localStorage.setItem(storageKey, dataUrl);
        setHasContent(true);
    };

    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        // Calculate the scale between display size and internal canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Get mouse position relative to canvas and scale it
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        return { x, y };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(e);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Set eraser or pen mode
        if (isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 20; // Larger eraser size
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = 2;
        }

        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(e);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            // Only save if user was actually drawing
            saveCanvas();
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.removeItem(storageKey);
        setHasContent(false);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.drag-handle')) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    return (
        <>
            {/* Scratch Paper Window */}
            {isOpen && (
                <div
                    className="fixed z-50 bg-white rounded-2xl shadow-2xl border-2 border-slate-200"
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        width: '740px'
                    }}
                    onMouseDown={handleMouseDown}
                >
                    {/* Header */}
                    <div className="drag-handle flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 rounded-t-xl cursor-move">
                        <div className="flex items-center gap-2 text-white">
                            <FileText className="h-4 w-4" />
                            <span className="font-bold text-sm">
                                計算紙 {questionNumber ? `- 題號 ${questionNumber}` : ''}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            title="關閉"
                        >
                            <X className="h-3.5 w-3.5 text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500">在下方空白處進行計算或草稿</p>

                                {/* Pen/Eraser Toggle */}
                                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                                    <button
                                        onClick={() => setIsEraser(false)}
                                        className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-md transition-all ${!isEraser
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        title="畫筆"
                                    >
                                        <Pen className="h-3 w-3" />
                                        畫筆
                                    </button>
                                    <button
                                        onClick={() => setIsEraser(true)}
                                        className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-md transition-all ${isEraser
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        title="橡皮擦"
                                    >
                                        <Eraser className="h-3 w-3" />
                                        橡皮擦
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={clearCanvas}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                清除全部
                            </button>
                        </div>
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className={`border-2 border-slate-200 rounded-lg bg-white shadow-inner ${isEraser ? 'cursor-cell' : 'cursor-crosshair'
                                }`}
                            style={{
                                touchAction: 'none',
                                display: 'block',
                                width: '100%'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Toggle Button with Content Indicator */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${hasContent
                    ? 'text-indigo-700 bg-indigo-50 border-indigo-300 hover:bg-indigo-100'
                    : 'text-indigo-600 bg-white border-indigo-200 hover:bg-indigo-50'
                    }`}
                title={hasContent ? '計算紙（有內容）' : '開啟計算紙'}
            >
                <FileText className="h-3.5 w-3.5" />
                計算紙
                {hasContent && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-indigo-600 rounded-full border-2 border-white"></span>
                )}
            </button>
        </>
    );
}
