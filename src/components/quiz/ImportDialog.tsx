
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, CheckCircle2, Loader2, AlertCircle, FileText, Info, ChevronDown } from 'lucide-react';
import { BOOKS_CONFIG, DIFFICULTIES } from '@/constants';


interface ImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (chapterId: string) => void;
}

export function ImportDialog({ isOpen, onClose, onSuccess }: ImportDialogProps) {
    const [step, setStep] = useState<'info' | 'uploading' | 'success' | 'error'>('info');

    // Hierarchical metadata
    const [selectedBook, setSelectedBook] = useState(BOOKS_CONFIG[0].name);
    const [selectedChapterNum, setSelectedChapterNum] = useState(1);
    const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

    const [error, setError] = useState('');

    const [htmlFile, setHtmlFile] = useState<File | null>(null);
    const [docxFile, setDocxFile] = useState<File | null>(null);
    const [txtFile, setTxtFile] = useState<File | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);


    const folderInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFolderSelect = (files: FileList | null) => {
        if (!files) return;
        const fileArray = Array.from(files);

        // Detect docx/doc file
        const docx = fileArray.find(f => f.name.endsWith('.docx') || f.name.endsWith('.doc'));
        if (docx) {
            setDocxFile(docx);
            setHtmlFile(null); // Clear HTML if Word is picked
            setError('');
            return;
        }

        // Detect txt file
        const txt = fileArray.find(f => f.name.endsWith('.txt'));
        if (txt) {
            setTxtFile(txt);
            setDocxFile(null);
            setHtmlFile(null);
            setError('');
            return;
        }

        const html = fileArray.find(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
        if (!html) {
            setError('找不到 HTML 檔案或 Word 檔案 (.docx)');
            return;
        }

        setHtmlFile(html);
        setDocxFile(null);
        setImageFiles(fileArray.filter(f => f.type.startsWith('image/')));
        setError('');
    };

    const handleImport = async () => {
        if (!htmlFile && !docxFile && !txtFile) {
            setError('請選擇檔案');
            return;
        }

        const bookPrefix = selectedBook.replace('數學', 'math');
        const chapterId = `${bookPrefix}_ch${selectedChapterNum}_${selectedDifficulty}`;
        const difficultyLabel = DIFFICULTIES.find(d => d.id === selectedDifficulty)?.label || '';
        const title = `${selectedBook} 第${selectedChapterNum}章 (${difficultyLabel})`;

        setStep('uploading');
        setError('');

        try {
            let payload: any = {
                chapterId,
                title
            };

            if (docxFile) {
                // Read Docx as Base64
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(docxFile);
                });
                payload.isDocx = true;
                payload.docxContent = base64;
                payload.fileName = docxFile.name;
            } else if (htmlFile) {
                // 1. Read HTML
                const htmlContent = await htmlFile.text();

                // 2. Read all images to Base64
                const imagePromises = imageFiles.map(file => {
                    return new Promise<{ name: string, data: string }>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64 = (reader.result as string).split(',')[1];
                            resolve({ name: file.name, data: base64 });
                        };
                        reader.readAsDataURL(file);
                    });
                });

                const imagesData = await Promise.all(imagePromises);
                payload.isDocx = false;
                payload.htmlContent = htmlContent;
                payload.images = imagesData;
            } else if (txtFile) {
                // Read Txt
                const txtContent = await txtFile.text();
                payload.isTxt = true;
                payload.txtContent = txtContent;
            }


            // 3. Send to local API
            const response = await fetch('/api/import-chapter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '匯入失敗');
            }

            setStep('success');
            setTimeout(() => {
                onSuccess(chapterId);
                onClose();
                // Reset state
                setStep('info');
                setHtmlFile(null);
                setDocxFile(null);
                setTxtFile(null);
                setImageFiles([]);

            }, 2000);

        } catch (err: any) {
            setStep('error');
            setError(err.message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h3 className="text-xl font-bold text-slate-900">匯入新題目</h3>
                            <button
                                onClick={onClose}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {step === 'info' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">冊別</label>
                                            <div className="relative group">
                                                <select
                                                    value={selectedBook}
                                                    onChange={(e) => {
                                                        const book = BOOKS_CONFIG.find(b => b.name === e.target.value);
                                                        setSelectedBook(e.target.value);
                                                        if (book && selectedChapterNum > book.chapters) {
                                                            setSelectedChapterNum(1);
                                                        }
                                                    }}
                                                    className="appearance-none w-full rounded-lg border border-slate-200 bg-white pl-4 pr-10 py-2 text-sm font-bold text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-sm"
                                                >
                                                    {BOOKS_CONFIG.map(b => (
                                                        <option key={b.name} value={b.name}>{b.name}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">章節</label>
                                            <div className="relative group">
                                                <select
                                                    value={selectedChapterNum}
                                                    onChange={(e) => setSelectedChapterNum(parseInt(e.target.value))}
                                                    className="appearance-none w-full rounded-lg border border-slate-200 bg-white pl-4 pr-10 py-2 text-sm font-bold text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-sm"
                                                >
                                                    {Array.from({ length: BOOKS_CONFIG.find(b => b.name === selectedBook)?.chapters || 12 }, (_, i) => (
                                                        <option key={i + 1} value={i + 1}>第{i + 1}章</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">難度</label>
                                            <div className="relative group">
                                                <select
                                                    value={selectedDifficulty}
                                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                                    className="appearance-none w-full rounded-lg border border-slate-200 bg-white pl-4 pr-10 py-2 text-sm font-bold text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-sm"
                                                >
                                                    {DIFFICULTIES.map(d => (
                                                        <option key={d.id} value={d.id}>{d.label}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">匯入預覽</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">
                                            {selectedBook} 第 {selectedChapterNum} 章 ({DIFFICULTIES.find(d => d.id === selectedDifficulty)?.label})
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                            ID: math{selectedBook.replace('數學', '')}_ch{selectedChapterNum}_{selectedDifficulty}
                                        </p>
                                    </div>

                                    <div className="pt-2 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${docxFile ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
                                            >
                                                <FileText className={`mb-2 h-8 w-8 ${docxFile ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                <span className="text-sm font-bold text-slate-900">選擇 Word</span>
                                                <p className="text-[10px] text-slate-500 mt-1">支援 .docx 直接匯入</p>
                                            </button>

                                            <button
                                                onClick={() => fileInputRef.current?.setAttribute('accept', '.txt') || fileInputRef.current?.click()}
                                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${txtFile ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-400 hover:bg-slate-50'}`}
                                            >
                                                <FileText className={`mb-2 h-8 w-8 ${txtFile ? 'text-orange-500' : 'text-slate-400'}`} />
                                                <span className="text-sm font-bold text-slate-900">選擇 TXT</span>
                                                <p className="text-[10px] text-slate-500 mt-1">AI 轉換後的純文字</p>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => folderInputRef.current?.click()}
                                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${htmlFile ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-400 hover:bg-slate-50'}`}
                                            >
                                                <Folder className={`mb-2 h-8 w-8 ${htmlFile ? 'text-green-500' : 'text-slate-400'}`} />
                                                <span className="text-sm font-bold text-slate-900">選擇資料夾</span>
                                                <p className="text-[10px] text-slate-500 mt-1">HTML 與圖片目錄</p>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <a
                                                href="/import_guide.txt"
                                                target="_blank"
                                                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                <Info className="h-3.5 w-3.5" />
                                                查看 AI 匯入指引 (讓 AI 幫你轉文字)
                                            </a>
                                        </div>

                                        {(htmlFile || docxFile || txtFile) && (
                                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 p-3">
                                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                                    {docxFile ? <FileText className="h-4 w-4 text-indigo-500" /> : txtFile ? <FileText className="h-4 w-4 text-orange-500" /> : <Folder className="h-4 w-4 text-green-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {docxFile ? docxFile.name : txtFile ? txtFile.name : htmlFile?.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500">
                                                        {docxFile ? '準備匯入 Word 內容' : txtFile ? '準備匯入 AI 文字內容' : `偵測到 HTML + ${imageFiles.length} 張圖片`}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => { setHtmlFile(null); setDocxFile(null); setTxtFile(null); setImageFiles([]); }}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}


                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".docx,.doc,.txt"
                                            onChange={(e) => handleFolderSelect(e.target.files)}
                                        />

                                        <input
                                            type="file"
                                            ref={folderInputRef}
                                            className="hidden"
                                            // @ts-ignore
                                            webkitdirectory=""
                                            onChange={(e) => handleFolderSelect(e.target.files)}
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleImport}
                                        className="w-full rounded-xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                    >
                                        開始匯入並轉換
                                    </button>
                                </div>
                            )}

                            {step === 'uploading' && (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-900">正在處理中...</p>
                                        <p className="text-sm text-slate-500">正在上傳圖片並自動解析 HTML 內容</p>
                                    </div>
                                </div>
                            )}

                            {step === 'success' && (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4 text-green-600">
                                    <CheckCircle2 className="h-16 w-16" />
                                    <div className="text-center">
                                        <p className="text-xl font-bold">匯入成功！</p>
                                        <p className="text-sm text-green-700/80">資料已成功轉換為 JSON 並儲存至專案中。</p>
                                    </div>
                                </div>
                            )}

                            {step === 'error' && (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4 text-red-600">
                                    <AlertCircle className="h-16 w-16" />
                                    <div className="text-center px-4">
                                        <p className="text-xl font-bold">發生錯誤</p>
                                        <p className="text-sm text-red-700/80 mb-4">{error}</p>
                                        <button
                                            onClick={() => setStep('info')}
                                            className="rounded-lg bg-slate-100 px-6 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                                        >
                                            返回重試
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
