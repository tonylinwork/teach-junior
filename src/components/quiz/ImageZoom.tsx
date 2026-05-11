import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function ImageZoom() {
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    useEffect(() => {
        const handleImageClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG' && target.closest('.quiz-content')) {
                const img = target as HTMLImageElement;
                e.preventDefault();
                e.stopPropagation();
                setZoomedImage(img.src);
            }
        };

        document.addEventListener('click', handleImageClick, true);

        return () => {
            document.removeEventListener('click', handleImageClick, true);
        };
    }, []);

    const handleClose = () => {
        setZoomedImage(null);
    };

    if (!zoomedImage) return null;

    return (
        <div
            className="image-zoom-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="關閉"
            >
                <X className="h-6 w-6" />
            </button>
            <img
                src={zoomedImage}
                alt="放大預覽"
                className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
