import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Trash2, X, Eraser, Pen } from 'lucide-react';

interface ScratchPaperProps {
    questionId: string;
    questionNumber?: number;
    chapterId?: string;
}

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 500;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

export function ScratchPaper({ questionId, questionNumber, chapterId = 'default' }: ScratchPaperProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [isEraser, setIsEraser] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const storageKey = `scratch-${chapterId}-${questionId}`;

    // Keep latest canvasSize in a ref so other effects can read it without re-running on every resize tick.
    const canvasSizeRef = useRef(canvasSize);
    useEffect(() => { canvasSizeRef.current = canvasSize; }, [canvasSize]);

    // Load saved canvas size when question changes
    useEffect(() => {
        try {
            const saved = localStorage.getItem(`${storageKey}-size`);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed?.width === 'number' && typeof parsed?.height === 'number') {
                    setCanvasSize({
                        width: Math.max(MIN_WIDTH, parsed.width),
                        height: Math.max(MIN_HEIGHT, parsed.height),
                    });
                    return;
                }
            }
        } catch {
            // ignore parse errors
        }
        setCanvasSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    }, [storageKey]);

    // Check if localStorage has content for this question
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        setHasContent(!!saved);
    }, [storageKey]);

    // Load saved canvas data from localStorage when window opens
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isOpen) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvasSizeRef.current.width;
        canvas.height = canvasSizeRef.current.height;

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

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

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: canvasSize.width,
            height: canvasSize.height,
        });
    };

    useEffect(() => {
        if (!isResizing) return;

        let latestSize = { width: resizeStart.width, height: resizeStart.height };

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - resizeStart.x;
            const dy = e.clientY - resizeStart.y;
            const newWidth = Math.max(MIN_WIDTH, resizeStart.width + dx);
            const newHeight = Math.max(MIN_HEIGHT, resizeStart.height + dy);
            latestSize = { width: newWidth, height: newHeight };
            setCanvasSize(latestSize);
        };

        const handleMouseUp = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const hadContent = !!localStorage.getItem(storageKey);
                    const dataUrl = hadContent ? canvas.toDataURL() : null;
                    canvas.width = latestSize.width;
                    canvas.height = latestSize.height;
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    if (dataUrl) {
                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                            localStorage.setItem(storageKey, canvas.toDataURL());
                        };
                        img.src = dataUrl;
                    }
                }
            }
            localStorage.setItem(`${storageKey}-size`, JSON.stringify(latestSize));
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, resizeStart, storageKey]);

    const scratchWindow = isOpen ? (
        <div
            className="fixed z-50 bg-white rounded-2xl shadow-2xl border-2 border-slate-200"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
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
                        width: `${canvasSize.width}px`,
                        height: `${canvasSize.height}px`,
                    }}
                />
            </div>

            {/* Resize handle */}
            <div
                onMouseDown={handleResizeStart}
                className="absolute bottom-1 right-1 cursor-se-resize text-slate-400 hover:text-slate-600 transition-colors"
                title="拖曳改變大小"
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="2" y1="12" x2="12" y2="2" />
                    <line x1="7" y1="12" x2="12" y2="7" />
                    <line x1="11" y1="12" x2="12" y2="11" />
                </svg>
            </div>
        </div>
    ) : null;

    return (
        <>
            {scratchWindow && createPortal(scratchWindow, document.body)}

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
