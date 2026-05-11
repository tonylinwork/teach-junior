import { useState } from 'react';
import { MathRenderer } from '@/components/quiz/MathRenderer';
import summaryData from '@/data/summaryData.json';
import { Download, Loader2, Archive } from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { InteractiveChart } from '@/components/InteractiveChart';

export function SummaryPage() {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [isBatchDownloading, setIsBatchDownloading] = useState(false);

    const generateImage = async (chapterId: string): Promise<string | null> => {
        const element = document.getElementById(`chapter-card-${chapterId}`);
        if (!element) return null;

        // 確保元素是可見的
        return await toPng(element, {
            cacheBust: true,
            backgroundColor: '#f0f4f8',
            pixelRatio: 2, // 提高解析度
            style: { margin: '0' },
            filter: (node) => {
                const el = node as HTMLElement;
                return el?.tagName !== 'BUTTON';
            }
        });
    };

    const handleDownload = async (chapterId: string, chapterTitle: string) => {
        try {
            setDownloadingId(chapterId);
            const dataUrl = await generateImage(chapterId);
            if (!dataUrl) return;

            const link = document.createElement('a');
            link.download = `${chapterTitle}-總整理.png`;
            link.href = dataUrl;
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating image:', error);
            alert('產生圖片時發生錯誤，請稍後再試。');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleBatchDownload = async () => {
        try {
            setIsBatchDownloading(true);
            const zip = new JSZip();

            for (let i = 0; i < summaryData.length; i++) {
                const chapter = summaryData[i] as any;
                const dataUrl = await generateImage(chapter.id);
                if (dataUrl) {
                    const base64Data = dataUrl.split(',')[1];
                    const numPrefix = String(i + 1).padStart(2, '0');
                    zip.file(`${numPrefix}_${chapter.title}-總整理.png`, base64Data, { base64: true });
                }
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, '所有單元總整理.zip');
        } catch (error) {
            console.error('Error generating batch zip:', error);
            alert('批量下載發生錯誤，請稍後再試。');
        } finally {
            setIsBatchDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-32">
            <nav className="sticky top-6 z-50 px-6 py-4 glass-card rounded-2xl mx-auto w-[95%] max-w-[1792px] mb-12 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-indigo-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
                        <Archive className="text-white h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-800 tracking-tight">單元重點總整理</span>
                </div>
                <button
                    onClick={handleBatchDownload}
                    disabled={isBatchDownloading || summaryData.length === 0}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isBatchDownloading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Archive className="h-5 w-5" />
                    )}
                    {isBatchDownloading ? '打包產生中...' : '批量下載全部'}
                </button>
            </nav>

            <div className="max-w-[1792px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {summaryData.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 font-bold text-xl">目前沒有任何重點整理或考前暖身資料。</p>
                    </div>
                ) : (
                    summaryData.map((chapter: any) => (
                        <div
                            key={chapter.id}
                            id={`chapter-card-${chapter.id}`}
                            className="space-y-8 bg-white/40 p-6 sm:p-10 rounded-[3rem] border border-white/60 shadow-sm"
                        >
                            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                                <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                                    {chapter.title}
                                </h2>
                                <button
                                    onClick={() => handleDownload(chapter.id, chapter.title)}
                                    disabled={downloadingId === chapter.id}
                                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {downloadingId === chapter.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    儲存為圖片
                                </button>
                            </div>

                            <div className="premium-clay-card border-none bg-white p-8 sm:p-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <div className="h-64 w-64 rounded-full bg-indigo-500 blur-[100px]" />
                                </div>
                                <h3 className="text-2xl font-black text-indigo-900 mb-8 flex items-center gap-4 relative z-10">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl shadow-inner-soft border border-indigo-100">💡</span>
                                    整理與考前暖身
                                </h3>
                                <div
                                    className="bg-slate-50/50 rounded-[2rem] p-6 sm:p-10 shadow-inner-soft backdrop-blur-sm relative z-10 border border-slate-100"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='rgba(79,70,229,0.04)' font-family='sans-serif' font-weight='900' text-anchor='middle' dominant-baseline='middle' transform='rotate(-30 200 200)'%3E哲學數學 TEACH%3C/text%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'repeat'
                                    }}
                                >
                                    <MathRenderer
                                        className="prose prose-indigo max-w-none text-slate-700 leading-loose font-bold"
                                        content={chapter.content}
                                    />

                                    {/* 互動式圖表展示：針對三次函數 (math1_ch11)、二次函數 (math1_ch10) 與 直線方程式 (math1_ch6) */}
                                    {chapter.id === 'math1_ch11' && (
                                        <InteractiveChart
                                            title="互動探索：三次函數的圖形特徵"
                                            description="請拖拉下方的滑桿，觀察三次函數標準式 y = a(x-h)³ + p(x-h) + k 中，各個參數如何影響圖形的延伸方向、平移與局部特徵！"
                                            expressions={['y = a(x-h)^3 + p(x-h) + k', '(h, k)']}
                                            sliders={[
                                                { id: 'a', label: '首項係數 (a) - 決定延伸方向', min: -5, max: 5, step: 0.1, defaultValue: 1 },
                                                { id: 'p', label: '一次項係數 (p) - 決定局部圖形', min: -5, max: 5, step: 0.1, defaultValue: 1 },
                                                { id: 'h', label: '對稱中心水平位移 (h)', min: -5, max: 5, step: 0.5, defaultValue: 0 },
                                                { id: 'k', label: '對稱中心垂直位移 (k)', min: -5, max: 5, step: 0.5, defaultValue: 0 }
                                            ]}
                                        />
                                    )}
                                    {chapter.id === 'math1_ch10' && (
                                        <InteractiveChart
                                            title="互動探索：二次函數的參數變化"
                                            description="請拖拉下方的滑桿，觀察二次函數 y = a(x-h)² + k 的開口方向、大小以及頂點位置如何隨著 a, h, k 的改變而移動！"
                                            expressions={['y = a(x-h)^2 + k']}
                                            sliders={[
                                                { id: 'a', label: '開口大小與方向 (a)', min: -5, max: 5, step: 0.1, defaultValue: 1 },
                                                { id: 'h', label: '頂點的水平位移 (h)', min: -10, max: 10, step: 1, defaultValue: 0 },
                                                { id: 'k', label: '頂點的垂直位移 (k)', min: -10, max: 10, step: 1, defaultValue: 0 }
                                            ]}
                                        />
                                    )}
                                    {chapter.id === 'math1_ch6' && (
                                        <InteractiveChart
                                            title="互動探索：直線方程式與斜率"
                                            description="試著拉動滑桿，觀察直線方程式 y = mx + b 中，斜率 m 和 y 截距 b 的數值改變會如何影響直線的傾斜程度與位置！"
                                            expressions={['y = mx + b']}
                                            sliders={[
                                                { id: 'm', label: '直線的斜率 (m)', min: -5, max: 5, step: 0.1, defaultValue: 1 },
                                                { id: 'b', label: 'y 截距 (b)', min: -10, max: 10, step: 1, defaultValue: 0 }
                                            ]}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
}
